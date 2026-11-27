import time
import torch
import torch.nn.functional as F
import silu_cuda

if not torch.cuda.is_available():
    raise SystemExit("A CUDA-enabled PyTorch install and NVIDIA GPU are required.")

x = torch.randn(1_000_000, device="cuda", dtype=torch.float32)
actual = silu_cuda.silu(x)
expected = F.silu(x)
print("max absolute error:", (actual - expected).abs().max().item())
assert torch.allclose(actual, expected, atol=1e-6, rtol=1e-5)

# Warm-up before the simple illustrative timing.
for _ in range(20):
    silu_cuda.silu(x)
    F.silu(x)
torch.cuda.synchronize()
start = time.perf_counter()
for _ in range(100):
    silu_cuda.silu(x)
torch.cuda.synchronize()
custom_ms = (time.perf_counter() - start) * 10
start = time.perf_counter()
for _ in range(100):
    F.silu(x)
torch.cuda.synchronize()
torch_ms = (time.perf_counter() - start) * 10
print(f"100 calls average: custom={custom_ms:.3f} ms, torch={torch_ms:.3f} ms")
