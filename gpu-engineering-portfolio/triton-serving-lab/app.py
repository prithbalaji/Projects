import time
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Triton-compatible demo")

class InferenceRequest(BaseModel):
    inputs: list

@app.get("/v2/health/live")
def live(): return {"status": "live"}

@app.post("/v2/models/demo/infer")
def infer(request: InferenceRequest):
    start = time.perf_counter()
    samples = len(request.inputs)
    output = [[1.0 if i == sample_index % 10 else 0.0 for i in range(10)]
              for sample_index in range(samples)]
    return {"outputs": output, "latency_ms": (time.perf_counter() - start) * 1000}
