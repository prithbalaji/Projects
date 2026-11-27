import os
import time
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    prompt: str
    max_tokens: int = 32


class GenerateResponse(BaseModel):
    text: str
    backend: str
    time_to_first_token_ms: float
    total_ms: float


class EchoBackend:
    name = "cpu-echo-prototype"

    def generate(self, prompt: str, max_tokens: int):
        start = time.perf_counter()
        text = f"[prototype: echo of {prompt[:120]}]"
        yield text
        self.ttft = (time.perf_counter() - start) * 1000


app = FastAPI(title="TensorRT-LLM serving prototype")
backend = EchoBackend()

@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):
    start = time.perf_counter()
    pieces = []
    for piece in backend.generate(request.prompt, request.max_tokens):
        pieces.append(piece)
    total = (time.perf_counter() - start) * 1000
    return GenerateResponse(text="".join(pieces), backend=backend.name,
                            time_to_first_token_ms=backend.ttft, total_ms=total)

@app.get("/health")
def health():
    return {"status": "ok", "backend": backend.name}
