#include <cuda_runtime.h>
#include <cmath>
#include <cstdlib>
#include <iostream>
#include <stdexcept>
#include <vector>
#define CUDA_CHECK(x) do{cudaError_t e=(x);if(e!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(e));}while(0)
constexpr int TILE=16;
__global__ void naive(const float*A,const float*B,float*C,int n){int r=blockIdx.y*blockDim.y+threadIdx.y,c=blockIdx.x*blockDim.x+threadIdx.x;if(r<n&&c<n){float s=0;for(int k=0;k<n;k++)s+=A[r*n+k]*B[k*n+c];C[r*n+c]=s;}}
__global__ void tiled(const float*A,const float*B,float*C,int n){__shared__ float as[TILE][TILE],bs[TILE][TILE];int r=blockIdx.y*TILE+threadIdx.y,c=blockIdx.x*TILE+threadIdx.x;float sum=0;for(int t=0;t<n/TILE;t++){as[threadIdx.y][threadIdx.x]=A[r*n+t*TILE+threadIdx.x];bs[threadIdx.y][threadIdx.x]=B[(t*TILE+threadIdx.y)*n+c];__syncthreads();for(int k=0;k<TILE;k++)sum+=as[threadIdx.y][k]*bs[k][threadIdx.x];__syncthreads();}C[r*n+c]=sum;}
float run(const float*A,const float*B,float*C,int n,bool use_tiled){dim3 block(TILE,TILE),grid(n/TILE,n/TILE);cudaEvent_t a,b;CUDA_CHECK(cudaEventCreate(&a));CUDA_CHECK(cudaEventCreate(&b));CUDA_CHECK(cudaEventRecord(a));if(use_tiled)tiled<<<grid,block>>>(A,B,C,n);else naive<<<grid,block>>>(A,B,C,n);CUDA_CHECK(cudaGetLastError());CUDA_CHECK(cudaEventRecord(b));CUDA_CHECK(cudaEventSynchronize(b));float ms;CUDA_CHECK(cudaEventElapsedTime(&ms,a,b));cudaEventDestroy(a);cudaEventDestroy(b);return ms;}
int main(int argc,char**argv)try{int n=argc>1?std::atoi(argv[1]):512;if(n<=0||n%TILE)throw std::runtime_error("size must be positive and divisible by 16");size_t count=size_t(n)*n;std::vector<float>a(count),b(count),ref(count),cn(count),ct(count);for(size_t i=0;i<count;i++){a[i]=float((i%97)+1)/97;b[i]=float((i%53)+1)/53;}for(int r=0;r<n;r++)for(int c=0;c<n;c++){float s=0;for(int k=0;k<n;k++)s+=a[r*n+k]*b[k*n+c];ref[r*n+c]=s;}
float *da,*db,*dc;CUDA_CHECK(cudaMalloc(&da,count*sizeof(float)));CUDA_CHECK(cudaMalloc(&db,count*sizeof(float)));CUDA_CHECK(cudaMalloc(&dc,count*sizeof(float)));CUDA_CHECK(cudaMemcpy(da,a.data(),count*sizeof(float),cudaMemcpyHostToDevice));CUDA_CHECK(cudaMemcpy(db,b.data(),count*sizeof(float),cudaMemcpyHostToDevice));float mn=run(da,db,dc,n,false);CUDA_CHECK(cudaMemcpy(cn.data(),dc,count*sizeof(float),cudaMemcpyDeviceToHost));float mt=run(da,db,dc,n,true);CUDA_CHECK(cudaMemcpy(ct.data(),dc,count*sizeof(float),cudaMemcpyDeviceToHost));float en=0,et=0;for(size_t i=0;i<count;i++){en=fmaxf(en,fabsf(ref[i]-cn[i]));et=fmaxf(et,fabsf(ref[i]-ct[i]));}std::cout<<"N="<<n<<" naive="<<mn<<" ms max error="<<en<<"; tiled="<<mt<<" ms max error="<<et<<"\n";cudaFree(da);cudaFree(db);cudaFree(dc);return(en>1e-2f||et>1e-2f)?1:0;
}catch(const std::exception&e){std::cerr<<"Error: "<<e.what()<<"\n";return 1;}
