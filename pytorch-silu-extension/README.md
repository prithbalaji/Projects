# PyTorch CUDA SiLU Extension

Build a small custom CUDA operator implementing `SiLU(x) = x * sigmoid(x)`, expose it to Python with PyTorch's C++ extension API, and compare it with `torch.nn.functional.silu`.

## Requirements and build

Use a Linux environment with a supported NVIDIA GPU, CUDA Toolkit, and a PyTorch build compatible with that CUDA version. Install PyTorch first, then:

```bash
python -m pip install -e .
python demo.py
```

The build compiles both host bindings and CUDA code. If compilation fails, check that `nvcc --version`, `python -c 'import torch; print(torch.version.cuda)'`, and your installed CUDA toolkit agree. `TORCH_CUDA_ARCH_LIST` may be set to your GPU's compute capability if automatic detection is unavailable. The extension requires CUDA tensors and is intentionally a learning example, not a drop-in optimized PyTorch operator.
