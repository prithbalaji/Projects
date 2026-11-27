# GPU Engineering Portfolio

Five practical, resume-ready projects covering the NVIDIA and GPU engineering skills most valuable for CUDA, inference, profiling, serving, and distributed systems work:

1. [`cuda-kernel-lab`](./cuda-kernel-lab) — vector operations, reductions, tiled matrix multiplication, correctness tests, and CPU baselines.
2. [`tensorrt-optimization-lab`](./tensorrt-optimization-lab) — ONNX export, TensorRT engine generation, precision comparison, and benchmark reporting.
3. [`trtllm-serving-lab`](./trtllm-serving-lab) — a TensorRT-LLM-compatible serving scaffold with batching and latency metrics.
4. [`triton-serving-lab`](./triton-serving-lab) — Triton model repository, ONNX/Python prototypes, load testing, and dynamic-batch configuration.
5. [`nccl-nsight-lab`](./nccl-nsight-lab) — NCCL collectives, Nsight Systems/Compute capture scripts, and distributed scaling benchmarks.

These repositories represent working educational prototypes. CUDA and NCCL projects require NVIDIA hardware and a matching NVIDIA driver/CUDA/NCCL environment. TensorRT and Triton also require supported container or host versions. A CPU-only machine can run the export, charting, serving, and test logic where noted, but full GPU measurements cannot be fabricated.

## Build notes

- Record GPU model, driver, CUDA, TensorRT, Triton, Nsight, PyTorch, OS, and container image in every benchmark README.
- Report warm-ups, repetitions, batch sizes, precision, throughput, p50/p99 latency, memory use, and correctness tolerances.
- Never commit model weights, API keys, credentials, or private datasets.
- Validate generated ONNX and TensorRT results against a known framework baseline.

## Recommended portfolio order

Start with the CUDA kernel lab, then Nsight profiling, followed by TensorRT, Triton, TensorRT-LLM, and NCCL. This sequence demonstrates low-level understanding before deployment and distributed scale.
