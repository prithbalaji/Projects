#include <mpi.h>
#include <nccl.h>
#include <cuda_runtime.h>
#include <cstdio>
#include <cstdlib>
#include <vector>

#define CHECK(call) do { auto e=(call); if(e!=cudaSuccess) { fprintf(stderr,"CUDA: %s\n",cudaGetErrorString(e)); return 1; } } while(0)
#define NCCL_CHECK(call) do { auto e=(call); if(e!=ncclSuccess) { fprintf(stderr,"NCCL: %s\n",ncclGetErrorString(e)); return 1; } } while(0)

int main(int argc, char** argv) {
    MPI_Init(&argc,&argv);
    int rank, world; MPI_Comm_rank(MPI_COMM_WORLD,&rank); MPI_Comm_size(MPI_COMM_WORLD,&world);
    int count=1024;
    for(int i=1;i<argc;i++) if(std::string(argv[i])=="--count" && i+1<argc) count=std::atoi(argv[++i]);
    if(count<=0) { if(rank==0) fprintf(stderr,"count must be positive\n"); MPI_Finalize(); return 2; }
    int gpu_count=0; CHECK(cudaGetDeviceCount(&gpu_count));
    if(gpu_count<world) { if(rank==0) fprintf(stderr,"This MPI job needs one GPU per rank (%d GPUs, %d ranks)\n",gpu_count,world); MPI_Finalize(); return 3; }
    CHECK(cudaSetDevice(rank));
    std::vector<float> host(count); for(int i=0;i<count;i++) host[i]=(float)rank+1;
    float*data=nullptr; CHECK(cudaMalloc(&data,count*sizeof(float))); CHECK(cudaMemcpy(data,host.data(),count*sizeof(float),cudaMemcpyHostToDevice));
    ncclUniqueId id; if(rank==0) NCCL_CHECK(ncclGetUniqueId(&id)); MPI_Bcast(&id,sizeof(id),MPI_BYTE,0,MPI_COMM_WORLD);
    ncclComm_t comm; NCCL_CHECK(ncclCommInitRank(&comm,world,id,rank));
    NCCL_CHECK(ncclAllReduce(data,data,count,ncclFloat,ncclSum,comm,0)); CHECK(cudaDeviceSynchronize());
    CHECK(cudaMemcpy(host.data(),data,count*sizeof(float),cudaMemcpyDeviceToHost));
    float expected=world*(world+1)/2.0f; bool okay=true;
    for(float value:host) if(value!=expected) {okay=false;break;}
    if(rank==0) printf("NCCL AllReduce correct=%s ranks=%d count=%d expected=%g\n",okay?"yes":"no",world,count,expected);
    NCCL_CHECK(ncclCommDestroy(comm)); CHECK(cudaFree(data)); MPI_Finalize(); return okay?0:1;
}
