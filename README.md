# Prithvi's Projects

A collection of browser games, utility apps, experiments, and GPU-computing projects. Each project lives in its own folder and may have its own setup instructions.

## Featured: GPU Engineering Portfolio

Hands-on prototypes for CUDA development, NVIDIA inference, profiling, serving, and multi-GPU communication.

| Project | What it explores |
|---|---|
| [CUDA Kernel Lab](./gpu-engineering-portfolio/cuda-kernel-lab/) | Vector operations, reductions, tiled matrix multiplication, correctness checks, and profiling workflows. |
| [TensorRT Optimization Lab](./gpu-engineering-portfolio/tensorrt-optimization-lab/) | Model export and GPU inference benchmarking foundations. |
| [TensorRT-LLM Serving Lab](./gpu-engineering-portfolio/trtllm-serving-lab/) | A serving API prototype and a roadmap for integrating a supported TensorRT-LLM runtime. |
| [Triton Serving Lab](./gpu-engineering-portfolio/triton-serving-lab/) | Triton-style model serving, batching configuration, and a load-test client. |
| [NCCL + Nsight Lab](./gpu-engineering-portfolio/nccl-nsight-lab/) | NCCL AllReduce fundamentals and Nsight Systems/Compute profiling exercises. |
| [Portfolio benchmark template](./gpu-engineering-portfolio/BENCHMARK_TEMPLATE.md) | Capture environment, methodology, performance, accuracy, and limitations consistently. |

These are learning prototypes, not production-optimized implementations. CUDA, TensorRT, TensorRT-LLM, Triton GPU inference, NCCL, and Nsight workflows require compatible NVIDIA hardware and software versions for real GPU measurements. Read each project's README before running it; do not report unmeasured performance as a result.

## NVIDIA + CUDA learning projects

- [NVIDIA NIM document Q&A (RAG)](./nvidia-nim-rag/) — Ask questions over local documents with local embeddings and NVIDIA NIM chat inference. Requires an API key in the `NVIDIA_API_KEY` environment variable.
- [CUDA image filters](./cuda-image-filters/) — Grayscale, box blur, and Sobel filters with CPU-reference comparison.
- [CUDA matrix multiplication](./cuda-matmul/) — Compare naive and shared-memory tiled CUDA implementations.
- [CUDA ray tracer](./cuda-raytracer/) — Render a procedural scene to a PPM image using a CUDA kernel.
- [PyTorch CUDA SiLU extension](./pytorch-silu-extension/) — Build a custom CUDA operator and call it from PyTorch.

## Apps, games, and experiments

- [Basketball 1v1](./basketball-1v1/) — Browser-based basketball game.
- [CV receipt scanner](./cv-receipt-scanner/) — Computer-vision receipt-scanning project.
- [Document expiry tracker](./document-expiry-tracker/) — Track document expiration dates.
- [Net worth app](./net-worth-app/) — Personal net-worth tracking app.
- [Predictive expense analysis](./predictive-expense-analysis/) — Expense analysis and forecasting project.
- [Quote of the day](./quote-of-the-day/) — Daily quote app.
- [Receipt scanner](./receipt-scanner/) — Receipt-scanning project.
- [Translator app](./translatorapp/) — Translation app.
- [Wordle](./wordle/) — Word-guessing game.
- [Workout generator](./workout-generator/) — Workout planning project.

## Getting started

1. Browse to a project folder and read its README for specific requirements and run instructions.
2. Web projects can often be opened directly in a browser or served locally; Python and CUDA projects may require additional packages or toolchains.
3. For GPU projects, use a supported NVIDIA GPU environment and verify the driver and toolkit versions. A MacBook GPU is not a substitute for a CUDA-capable NVIDIA GPU.
4. Keep credentials, API keys, private documents, generated model weights, and build artifacts out of commits. Use environment variables for secrets.

## Contributing and feedback

These projects are personal learning experiments. Suggestions, bug reports, and improvements are welcome through GitHub issues or pull requests.
