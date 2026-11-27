# CUDA Ray Tracer

A minimal CUDA path/ray tracing exercise that renders a gradient sky, a large ground sphere, and two spheres using one CUDA thread per pixel. It writes an 8-bit binary PPM image.

```bash
nvcc -O2 -std=c++17 raytracer.cu -o raytracer
./raytracer 800 450 scene.ppm
```

Width and height are optional (defaults 800x450); output path defaults to `scene.ppm`. This compact demo uses deterministic shading rather than stochastic path tracing or `curand`, making the output reproducible and easy to extend. Try adding diffuse bounces, materials, and parallel random sampling as exercises.
