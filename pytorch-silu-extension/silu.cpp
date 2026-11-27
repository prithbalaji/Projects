#include <torch/extension.h>

torch::Tensor silu_cuda(torch::Tensor input);

torch::Tensor silu(torch::Tensor input) {
    TORCH_CHECK(input.is_cuda(), "input must be a CUDA tensor");
    TORCH_CHECK(input.is_floating_point(), "input must have a floating-point dtype");
    TORCH_CHECK(input.is_contiguous(), "input must be contiguous");
    return silu_cuda(input);
}

PYBIND11_MODULE(TORCH_EXTENSION_NAME, m) {
    m.def("silu", &silu, "SiLU activation (CUDA)");
}
