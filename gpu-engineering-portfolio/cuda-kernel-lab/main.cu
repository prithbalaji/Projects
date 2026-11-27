#include <cuda_runtime.h>
#include <iostream>
#include <cstdlib>
#include <vector>
#include <cmath>
#include "kernels.cuh"

#define CUDA_CHECK(call) do { cudaError_t e = (call); if (e != cudaSuccess) { std::cerr << cudaGetErrorString(e) << " at " << __FILE__ << ':' << __LINE__ << '\n'; std::exit(1); } } while (0)

int argument_value(int argc, char** argv, const char* name, int fallback) {
    for (int i = 1; i + 1 < argc; ++i) if (std::string(argv[i]) == name) return std::atoi(argv[i + 1]);
    return fallback;
}

void vector_add(const float* a, const float* b, float* out, int n) {
    const int threads = 256;
    const int blocks = (n + threads - 1) / threads;
    vector_add_kernel<<<blocks, threads>>>(a, b, out, n);
    CUDA_CHECK(cudaGetLastError());
}

int main(int argc, char** argv) {
    const int vector_size = argument_value(argc, argv, "--size", 1 << 20);
    const int matrix_size = argument_value(argc, argv, "--matrix", 512);
    if (vector_size <= 0 || matrix_size <= 0 || matrix_size % 16 != 0) {
        std::cerr << "Use a positive size and a matrix size divisible by 16\n";
        return 2;
    }

    std::vector<float> h(vector_size), rhs(vector_size), result(vector_size);
    for (int i = 0; i < vector_size; ++i) { h[i] = 1.0f + i % 17; rhs[i] = 0.5f; }
    float *da, *db, *dr;
    CUDA_CHECK(cudaMalloc(&da, h.size() * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&db, rhs.size() * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&dr, result.size() * sizeof(float)));
    CUDA_CHECK(cudaMemcpy(da, h.data(), h.size() * sizeof(float), cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(db, rhs.data(), rhs.size() * sizeof(float), cudaMemcpyHostToDevice));

    vector_add(da, db, dr, vector_size);
    CUDA_CHECK(cudaDeviceSynchronize());
    CUDA_CHECK(cudaMemcpy(result.data(), dr, result.size() * sizeof(float), cudaMemcpyDeviceToHost));
    float vector_error = 0.0f;
    for (int i = 0; i < vector_size; ++i) vector_error = std::max(vector_error, std::fabs(result[i] - (h[i] + rhs[i])));
    std::cout << "vector add max error: " << vector_error << '\n';

    const int matrix_count = matrix_size * matrix_size;
    std::vector<float> ma(matrix_count, 1.0f), mb(matrix_count, 0.5f), mc(matrix_count);
    float *dma, *dmb, *dmc;
    CUDA_CHECK(cudaMalloc(&dma, ma.size() * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&dmb, mb.size() * sizeof(float)));
    CUDA_CHECK(cudaMalloc(&dmc, mc.size() * sizeof(float)));
    CUDA_CHECK(cudaMemcpy(dma, ma.data(), ma.size() * sizeof(float), cudaMemcpyHostToDevice));
    CUDA_CHECK(cudaMemcpy(dmb, mb.data(), mb.size() * sizeof(float), cudaMemcpyHostToDevice));
    dim3 threads(16, 16), blocks(matrix_size / 16, matrix_size / 16);
    matmul_tiled_kernel<<<blocks, threads>>>(dma, dmb, dmc, matrix_size);
    CUDA_CHECK(cudaGetLastError());
    CUDA_CHECK(cudaDeviceSynchronize());
    CUDA_CHECK(cudaMemcpy(mc.data(), dmc, mc.size() * sizeof(float), cudaMemcpyDeviceToHost));
    float matmul_error = 0.0f;
    for (float v : mc) matmul_error = std::max(matmul_error, std::fabs(v - 0.5f * matrix_size));
    std::cout << "tiled matmul max error: " << matmul_error << '\n';

    CUDA_CHECK(cudaFree(da)); CUDA_CHECK(cudaFree(db)); CUDA_CHECK(cudaFree(dr));
    CUDA_CHECK(cudaFree(dma)); CUDA_CHECK(cudaFree(dmb)); CUDA_CHECK(cudaFree(dmc));
    return (vector_error > 1e-6f || matmul_error > 1e-4f);
}

