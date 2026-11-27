# NVIDIA + CUDA projects

Five progressively advanced projects for learning NVIDIA NIM, CUDA C++, and PyTorch CUDA extensions. The Python/NIM project runs from a regular CPU machine; CUDA projects require an NVIDIA GPU and CUDA Toolkit. A 2014 MacBook Pro's GT 750M is not a supported target for current CUDA releases—use a compatible cloud GPU for the CUDA projects.

## Projects

1. [NIM document Q&A (RAG)](./nvidia-nim-rag/) — Ask questions over local PDF, Markdown, and text files with local embeddings and NVIDIA NIM chat inference.
2. [CUDA image filters](./cuda-image-filters/) — Apply grayscale, Sobel, and box blur kernels to PPM images and compare against CPU implementations.
3. [Tiled matrix multiplication](./cuda-matmul/) — Compare naive and shared-memory tiled CUDA GEMM, including correctness checks and timings.
4. [CUDA ray tracer](./cuda-raytracer/) — Render a small procedural scene in parallel and write a PPM image.
5. [PyTorch CUDA SiLU extension](./pytorch-silu-extension/) — Build a custom CUDA operator and call it from PyTorch.

## Getting started

- Open this repository in VS Code. Install the Microsoft C/C++, Python, and Remote - SSH extensions as appropriate. NVIDIA's CUDA development extension is optional; the CUDA Toolkit and compiler must be installed on the machine that builds/runs CUDA code.
- For cloud GPUs, connect to a machine with a supported NVIDIA GPU and CUDA Toolkit using Remote - SSH. Run `nvidia-smi` and `nvcc --version` in the remote terminal to verify the environment. Avoid putting API keys or cloud credentials in source files.
- For NIM, create an NVIDIA developer API key and export it as `NVIDIA_API_KEY`; see that project's README. Never commit the key.
- Each project has its own instructions and dependencies. CUDA code cannot be compiled with Apple's stock macOS toolchain or run on a Mac GPU.

These are educational starter implementations, not production-optimized libraries. Check NVIDIA's current CUDA and NIM documentation for supported hardware, model identifiers, and API availability.
