#include <torch/extension.h>
#include <ATen/cuda/CUDAContext.h>
#include <c10/cuda/CUDAGuard.h>
#include <cuda.h>
#include <cuda_runtime.h>

 template <typename scalar_t>
__global__ void silu_kernel(const scalar_t* x, scalar_t* y, int64_t n) {
    int64_t i = int64_t(blockIdx.x) * blockDim.x + threadIdx.x;
    if (i < n) {
        float value = static_cast<float>(x[i]);
        y[i] = static_cast<scalar_t>(value / (1.0f + expf(-value)));
    }
}

torch::Tensor silu_cuda(torch::Tensor input) {
    c10::cuda::CUDAGuard device_guard(input.device());
    auto output = torch::empty_like(input);
    const int64_t n = input.numel();
    if (n == 0) return output;
    constexpr int threads = 256;
    const int blocks = static_cast<int>((n + threads - 1) / threads);
    AT_DISPATCH_FLOATING_TYPES_AND_HALF(input.scalar_type(), "silu_cuda", [&] {
        silu_kernel<scalar_t><<<blocks, threads, 0, at::cuda::getCurrentCUDAStream()>>>(
            input.data_ptr<scalar_t>(), output.data_ptr<scalar_t>(), n);
    });
    C10_CUDA_KERNEL_LAUNCH_CHECK();
    return output;
}
