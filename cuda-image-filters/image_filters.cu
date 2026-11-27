#include <cuda_runtime.h>
#include <algorithm>
#include <chrono>
#include <cmath>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <stdexcept>
#include <string>
#include <vector>

#define CUDA_CHECK(call) do { cudaError_t e=(call); if(e!=cudaSuccess) throw std::runtime_error(cudaGetErrorString(e)); } while(0)
struct Image { int w, h; std::vector<uint8_t> rgb; };

static Image load_ppm(const std::string& path) {
    std::ifstream f(path, std::ios::binary);
    std::string magic; int w, h, maxv;
    if (!(f >> magic >> w >> h >> maxv) || magic != "P6" || w <= 0 || h <= 0 || maxv != 255)
        throw std::runtime_error("Expected a valid P6 PPM with max value 255");
    f.get(); // consume the single whitespace byte after the header
    Image im{w, h, std::vector<uint8_t>(static_cast<size_t>(w) * h * 3)};
    f.read(reinterpret_cast<char*>(im.rgb.data()), static_cast<std::streamsize>(im.rgb.size()));
    if (!f) throw std::runtime_error("Truncated PPM pixel data");
    return im;
}
static void save_ppm(const std::string& path, const Image& im) {
    std::ofstream f(path, std::ios::binary);
    f << "P6\n" << im.w << " " << im.h << "\n255\n";
    f.write(reinterpret_cast<const char*>(im.rgb.data()), static_cast<std::streamsize>(im.rgb.size()));
    if (!f) throw std::runtime_error("Could not write output PPM");
}

__device__ static int clampi(int x, int lo, int hi) { return max(lo, min(x, hi)); }
__global__ void filter_kernel(const uint8_t* in, uint8_t* out, int w, int h, int mode) {
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;
    if (x >= w || y >= h) return;
    int p = (y * w + x) * 3;
    if (mode == 0) {
        int gray = (77 * in[p] + 150 * in[p+1] + 29 * in[p+2]) >> 8;
        out[p] = out[p+1] = out[p+2] = static_cast<uint8_t>(gray);
    } else if (mode == 1) {
        for (int c=0;c<3;c++) { int sum=0; for(int dy=-1;dy<=1;dy++) for(int dx=-1;dx<=1;dx++)
            sum += in[(clampi(y+dy,0,h-1)*w+clampi(x+dx,0,w-1))*3+c]; out[p+c]=sum/9; }
    } else {
        if (x==0 || y==0 || x==w-1 || y==h-1) { out[p]=out[p+1]=out[p+2]=0; return; }
        const int gx[9]={-1,0,1,-2,0,2,-1,0,1}, gy[9]={-1,-2,-1,0,0,0,1,2,1};
        int sx=0, sy=0, k=0;
        for(int dy=-1;dy<=1;dy++) for(int dx=-1;dx<=1;dx++,k++) {
            int q=((y+dy)*w+x+dx)*3;
            int gray=(77*in[q]+150*in[q+1]+29*in[q+2])>>8;
            sx += gx[k]*gray; sy += gy[k]*gray;
        }
        uint8_t edge=static_cast<uint8_t>(min(255, static_cast<int>(sqrtf(float(sx*sx+sy*sy)))));
        out[p]=out[p+1]=out[p+2]=edge;
    }
}
static void cpu_filter(const Image& in, Image& out, int mode) {
    auto clamp=[](int v,int a,int b){return std::max(a,std::min(v,b));};
    for(int y=0;y<in.h;y++) for(int x=0;x<in.w;x++) {
        int p=(y*in.w+x)*3;
        if(mode==0) { int g=(77*in.rgb[p]+150*in.rgb[p+1]+29*in.rgb[p+2])>>8; out.rgb[p]=out.rgb[p+1]=out.rgb[p+2]=g; }
        else if(mode==1) for(int c=0;c<3;c++){int s=0;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++)s+=in.rgb[(clamp(y+dy,0,in.h-1)*in.w+clamp(x+dx,0,in.w-1))*3+c];out.rgb[p+c]=s/9;}
        else { if(x==0||y==0||x==in.w-1||y==in.h-1){out.rgb[p]=out.rgb[p+1]=out.rgb[p+2]=0;continue;}
            const int gx[9]={-1,0,1,-2,0,2,-1,0,1},gy[9]={-1,-2,-1,0,0,0,1,2,1};int sx=0,sy=0,k=0;
            for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++,k++){int q=((y+dy)*in.w+x+dx)*3;int g=(77*in.rgb[q]+150*in.rgb[q+1]+29*in.rgb[q+2])>>8;sx+=gx[k]*g;sy+=gy[k]*g;}
            uint8_t e=static_cast<uint8_t>(std::min(255,int(std::sqrt(double(sx*sx+sy*sy)))));out.rgb[p]=out.rgb[p+1]=out.rgb[p+2]=e;
        }
    }
}
int main(int argc,char**argv) try {
    if(argc!=4){std::cerr<<"Usage: "<<argv[0]<<" input.ppm gray|blur|sobel output.ppm\n";return 2;}
    std::string name=argv[2];int mode=name=="gray"?0:name=="blur"?1:name=="sobel"?2:-1;
    if(mode<0) throw std::runtime_error("Mode must be gray, blur, or sobel");
    Image in=load_ppm(argv[1]), gpu{in.w,in.h,std::vector<uint8_t>(in.rgb.size())}, cpu=gpu;
    uint8_t *di,*dout; CUDA_CHECK(cudaMalloc(&di,in.rgb.size())); CUDA_CHECK(cudaMalloc(&dout,in.rgb.size())); CUDA_CHECK(cudaMemcpy(di,in.rgb.data(),in.rgb.size(),cudaMemcpyHostToDevice));
    dim3 block(16,16), grid((in.w+15)/16,(in.h+15)/16); cudaEvent_t a,b;CUDA_CHECK(cudaEventCreate(&a));CUDA_CHECK(cudaEventCreate(&b));CUDA_CHECK(cudaEventRecord(a));filter_kernel<<<grid,block>>>(di,dout,in.w,in.h,mode);CUDA_CHECK(cudaGetLastError());CUDA_CHECK(cudaEventRecord(b));CUDA_CHECK(cudaEventSynchronize(b));float ms;CUDA_CHECK(cudaEventElapsedTime(&ms,a,b));CUDA_CHECK(cudaMemcpy(gpu.rgb.data(),dout,in.rgb.size(),cudaMemcpyDeviceToHost));
    auto t0=std::chrono::steady_clock::now();cpu_filter(in,cpu,mode);auto t1=std::chrono::steady_clock::now();
    size_t errors=0;for(size_t i=0;i<gpu.rgb.size();i++)if(gpu.rgb[i]!=cpu.rgb[i])errors++;
    save_ppm(argv[3],gpu);std::cout<<"CUDA kernel: "<<ms<<" ms; CPU reference: "<<std::chrono::duration<double,std::milli>(t1-t0).count()<<" ms; differing channels: "<<errors<<"\n";
    CUDA_CHECK(cudaFree(di));CUDA_CHECK(cudaFree(dout));CUDA_CHECK(cudaEventDestroy(a));CUDA_CHECK(cudaEventDestroy(b));return errors?1:0;
} catch(const std::exception&e){std::cerr<<"Error: "<<e.what()<<"\n";return 1;}
