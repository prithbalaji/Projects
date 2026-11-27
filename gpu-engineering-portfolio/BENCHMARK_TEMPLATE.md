# Benchmark evidence template

## Environment

- GPU:
- Driver:
- CUDA Toolkit:
- TensorRT or TensorRT-LLM version:
- Triton version:
- Nsight Systems version:
- Nsight Compute version:
- NCCL/MPI version:
- Container/image:
- OS:

## Method

- Warm-up count:
- Measured repetitions:
- Batch size:
- Precision:
- Concurrency:
- Input size:
- Synchronization method:

## Results

| Project | Baseline | Optimized | Mean latency | p50 | p99 | Throughput | Accuracy diff | Memory |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| CUDA vector/reduction/matmul | | | | | | | | |
| TensorRT | | | | | | | | |
| TensorRT-LLM | | | | | | | | |
| Triton | | | | | | | | |
| NCCL AllReduce | | | | | | | | |

## Limitations

Describe unavailable hardware, unsupported features, model limitations, calibration quality, and why no unmeasured result should be generalized.
