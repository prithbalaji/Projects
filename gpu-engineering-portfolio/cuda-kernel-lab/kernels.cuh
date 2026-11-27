#pragma once
#include <cuda_runtime.h>

__global__ void vector_add_kernel(const float* a, const float* b, float* out, int n);
__global__ void reduce_sum_kernel(const float* input, float* partial, int n);
__global__ void matmul_tiled_kernel(const float* a, const float* b, float* out, int n);
