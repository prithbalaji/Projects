# TensorRT Optimization Lab

A reproducible mini-lab for exporting a vision model to ONNX, building TensorRT engines, and comparing FP32, FP16, and INT8-like configurations.

## Prototype

`benchmark.py` exports a ResNet18 model, builds one or more TensorRT engines when TensorRT is available, and otherwise performs a PyTorch baseline benchmark. It stores run metadata and timing JSON rather than making unsupported claims.

## Requirements

```bash
pip install -r requirements.txt
python export_model.py
python benchmark.py --onnx model.onnx --precision fp32 fp16 --batch-sizes 1 4
```

For GPU execution, install a TensorRT build compatible with the installed CUDA/PyTorch versions. TensorRT host or GPU support cannot be inferred from Python package presence; verify both `import tensorrt` and `nvidia-smi`.

## What to improve

- Add calibration data and INT8 calibration.
- Add dynamic shapes and serialized engine caching.
- Compare output errors for every precision.
- Profile the engine with Nsight Systems.
