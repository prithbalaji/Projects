# Triton Inference Lab

An HTTP-serving prototype that demonstrates a Triton-style model repository layout, dynamic batching configuration, request tracing, and local load testing.

## Local prototype

```bash
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 8000
python load_test.py --url http://localhost:8000/v2/models/demo/infer --requests 100
```

The Python server is a CPU-compatible stand-in for the Triton HTTP contract. For the real Triton lab, place a model in `model_repository/demo/1/model.py` or `model_repository/demo/1/model.onnx` and use NVIDIA Triton's official container.

## Triton config

The sample `config.pbtxt` demonstrates:

- dynamic batching
- preferred batch sizes
- max queue delay
- model instance concurrency
- CPU and GPU instance placeholders

Do not launch an instance count larger than GPU memory permits.
