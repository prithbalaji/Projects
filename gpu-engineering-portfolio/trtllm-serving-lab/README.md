# TensorRT-LLM Serving Lab

A framework-independent FastAPI scaffold for a local tokenizer, model adapter, dynamic batching queue, and measured TTFT/throughput reporting. It is not a claim that a production TensorRT-LLM model is already packaged.

## Prototype

```bash
pip install -r requirements.txt
python -m uvicorn server:app --host 0.0.0.0 --port 8080
curl -X POST localhost:8080/generate -H 'Content-Type: application/json' \
  -d '{"prompt":"Explain CUDA shared memory","max_tokens":32}'
```

Set `MODEL_BACKEND=tensorrt_llm` only when a real supported engine and runtime are installed. The default backend is a CPU echo simulator so the API and metrics can be exercised before GPU setup. It does not pretend to generate real model output on CPU.

## GPU integration steps

1. Select a model and TensorRT-LLM version officially supported by the target GPU and CUDA environment.
2. Export/build a TensorRT-LLM engine using NVIDIA documentation for that exact release.
3. Implement `TensorRTLLMBackend.generate()` using the installed runtime API.
4. Measure TTFT, inter-token latency, concurrent throughput, KV-cache memory, and output quality.
