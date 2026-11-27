#include <cuda_runtime.h>
#include <algorithm>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <stdexcept>
#include <string>
#include <vector>
#define CUDA_CHECK(x) do{cudaError_t e=(x);if(e!=cudaSuccess)throw std::runtime_error(cudaGetErrorString(e));}while(0)
struct V{float x,y,z;};__host__ __device__ V add(V a,V b){return{a.x+b.x,a.y+b.y,a.z+b.z};}__host__ __device__ V sub(V a,V b){return{a.x-b.x,a.y-b.y,a.z-b.z};}__host__ __device__ V mul(V a,float t){return{a.x*t,a.y*t,a.z*t};}__host__ __device__ float dot(V a,V b){return a.x*b.x+a.y*b.y+a.z*b.z;}__host__ __device__ V unit(V a){return mul(a,rsqrtf(dot(a,a)));}
__device__ bool hit(V o,V d,V center,float radius,float&t){V oc=sub(o,center);float a=dot(d,d),hb=dot(oc,d),c=dot(oc,oc)-radius*radius,disc=hb*hb-a*c;if(disc<0)return false;float root=(-hb-sqrtf(disc))/a;if(root<0.001f)root=(-hb+sqrtf(disc))/a;if(root<0.001f)return false;t=root;return true;}
__device__ V color(V o,V d){float t;V centers[3]={{0,-100.5f,-1},{0,0,-1},{-1,0,-1}};float radii[3]={100,0.5f,0.5f};for(int i=0;i<3;i++)if(hit(o,d,centers[i],radii[i],t)){V p=add(o,mul(d,t)),n=unit(sub(p,centers[i]));float light=0.15f+0.85f*fmaxf(0,dot(n,unit(V{-0.5f,1,0.5f})));return mul(V{0.25f+0.55f*fabsf(n.x),0.2f+0.6f*fabsf(n.y),0.3f+0.55f*fabsf(n.z)},light);}float a=0.5f*(unit(d).y+1);return add(mul(V{1,1,1},1-a),mul(V{0.5f,0.7f,1},a));}
__global__ void render(uint8_t*out,int w,int h){int x=blockIdx.x*blockDim.x+threadIdx.x,y=blockIdx.y*blockDim.y+threadIdx.y;if(x>=w||y>=h)return;float u=(x+0.5f)/w,v=(h-y-0.5f)/h,aspect=float(w)/h;V origin{0,0,0},dir{(2*u-1)*aspect,2*v-1,-1.5f};V c=color(origin,dir);int p=(y*w+x)*3;out[p]=uint8_t(255*fminf(1,fmaxf(0,c.x)));out[p+1]=uint8_t(255*fminf(1,fmaxf(0,c.y)));out[p+2]=uint8_t(255*fminf(1,fmaxf(0,c.z)));}
int main(int argc,char**argv)try{int w=argc>1?std::stoi(argv[1]):800,h=argc>2?std::stoi(argv[2]):450;std::string path=argc>3?argv[3]:"scene.ppm";if(w<1||h<1||w>8192||h>8192)throw std::runtime_error("dimensions must be in [1,8192]");size_t bytes=size_t(w)*h*3;uint8_t*d;CUDA_CHECK(cudaMalloc(&d,bytes));dim3 block(16,16),grid((w+15)/16,(h+15)/16);render<<<grid,block>>>(d,w,h);CUDA_CHECK(cudaGetLastError());CUDA_CHECK(cudaDeviceSynchronize());std::vector<uint8_t>pixels(bytes);CUDA_CHECK(cudaMemcpy(pixels.data(),d,bytes,cudaMemcpyDeviceToHost));cudaFree(d);std::ofstream f(path,std::ios::binary);f<<"P6\n"<<w<<" "<<h<<"\n255\n";f.write(reinterpret_cast<char*>(pixels.data()),bytes);if(!f)throw std::runtime_error("failed to write image");std::cout<<"Wrote "<<path<<" ("<<w<<"x"<<h<<")\n";return 0;}catch(const std::exception&e){std::cerr<<"Error: "<<e.what()<<"\n";return 1;}
