# CUDA Image Filters

Apply grayscale, box blur, and Sobel edge detection to a binary PPM (P6) image with CUDA, then compare output with CPU reference kernels. The intentionally simple PPM format avoids an extra image dependency.

## Build and run

On a Linux machine with an NVIDIA GPU and CUDA Toolkit:

```bash
nvcc -O2 -std=c++17 image_filters.cu -o image_filters
./image_filters input.ppm sobel output.ppm
# modes: gray, blur, sobel
```

Input must be an 8-bit P6 PPM (`P6`, width, height, max value 255). `output.ppm` is written in the same format. Check `nvidia-smi` and `nvcc --version` first. The program compares each CUDA output to a CPU reference and reports elapsed kernel time; timing excludes file I/O and transfers. Edge pixels are set to black for Sobel and copied for blur.
