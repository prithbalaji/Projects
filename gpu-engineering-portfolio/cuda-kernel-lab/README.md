# CUDA Kernel Lab

A CPU-runnable correctness shell plus CUDA kernels for vector add, a parallel reduction, and shared-memory tiled matrix multiplication.

## Implemented workloads

- `vector_add`: baseline kernel and CPU reference
- `reduce_sum`: grid-stride block reduction with final block merge
- `matmul_tiled`: 16×16 shared-memory tiles

## Requirements

- Linux or another supported NVIDIA CUDA environment
- NVIDIA GPU and current matching NVIDIA driver
- CUDA Toolkit and `nvcc`
- Optional: Nsight Systems and Nsight Compute

## Run

```bash
cd gpu-engineering-portfolio/cuda-kernel-lab
mkdir build && cd build
cmake ..
cmake --build . -j
./cuda_kernel_lab --size 1048576 --matrix 512
```

Capture the workload with:

```bash/nsys profile --trace=cuda,nvtx ./cuda_kernel_lab --size 1048576 --matrix 512
ncu --set full --kernel-name matmul_tiled ./cuda_kernel_lab --matrix 512
```

## Deliverables

Run multiple repeats and save hardware plus timing metadata. Replace example percentages in `BENCHMARK_TEMPLATE.md` only after real measurements. Include Nsight timelines and kernel metrics in a reviewer-friendly summary.
