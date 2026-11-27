#include <cuda_runtime.h>
#include <cooperative_groups.h>
constexpr int TILE = 16;

__global__ void vector_add_kernel(const float* a, const float* b, float* out, int n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x;
    if (i < n) out[i] = a[i] + b[i];
}

__global__ void reduce_sum_kernel(const float* input, float* partial, int n) {
    __shared__ float work[256];
    int tid = threadIdx.x;
    float sum = 0.0f;
    for (int i = blockIdx.x * blockDim.x + tid; i < n; i += blockDim.x * gridDim.x) sum += input[i];
    work[tid] = sum;
    __syncthreads();
    for (int offset = blockDim.x / 2; offset > 0; offset /= 2) {
        if (tid < offset) work[tid] += work[tid + offset];
        __syncthreads();
    }
    if (tid == 0) partial[blockIdx.x] = work[0];
}

__global__ void matmul_tiled_kernel(const float* a, const float* b, float* out, int n) {
    __shared__ float tile_a[TILE][TILE];
    __shared__ float tile_b[TILE][TILE];
    int row = blockIdx.y * TILE + threadIdx.y;
    int column = blockIdx.x * TILE + threadIdx.x;
    float sum = 0.0f;
    for (int tile = 0; tile < n / TILE; ++tile) {
        tile_a[threadIdx.y][threadIdx.x] = a[row * n + tile * TILE + threadIdx.x];
        tile_b[threadIdx.y][threadIdx.x] = b[(tile * TILE + threadIdx.y) * n + column];
        __syncthreads();
        for (int k = 0; k < TILE; ++k) sum += tile_a[threadIdx.y][k] * tile_b[k][threadIdx.x];
        __syncthreads();
    }
    if (row < n && column < n) out[row * n + column] = sum;
}
