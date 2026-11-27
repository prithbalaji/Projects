# CUDA Matrix Multiplication

Educational square FP32 matrix multiplication with a naive one-output-per-thread kernel and a shared-memory tiled kernel. The executable verifies both results against a CPU reference before printing event timings.

```bash
nvcc -O2 -std=c++17 matmul.cu -o matmul
./matmul 512
```

The optional size must be a positive integer divisible by 16 (default 512). Increase it gradually to fit GPU memory. GPU timings include only kernel execution, not transfers or CPU verification; results vary by GPU and compiler. The tiled kernel demonstrates reuse and synchronization; it is not a tuned GEMM library.
