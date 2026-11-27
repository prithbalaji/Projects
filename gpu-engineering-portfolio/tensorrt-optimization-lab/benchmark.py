import argparse
import json
import platform
import statistics
import time

import torch
import torchvision.models as models


def benchmark(batch: int, repeats: int, warmup: int):
    if not torch.cuda.is_available():
        raise SystemExit("This GPU benchmark requires CUDA-enabled PyTorch and an NVIDIA GPU")
    model = models.resnet18(weights=None).eval().cuda()
    x = torch.randn(batch, 3, 224, 224, device="cuda")
    for _ in range(warmup): model(x)
    torch.cuda.synchronize()
    times = []
    for _ in range(repeats):
        start = time.perf_counter_ns()
        model(x)
        torch.cuda.synchronize()
        times.append((time.perf_counter_ns() - start) / 1e6)
    return {
        "batch": batch,
        "latency_ms_mean": statistics.mean(times),
        "latency_ms_p50": statistics.median(times),
        "throughput_images_sec": batch * 1000.0 / statistics.mean(times),
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--precision", nargs="+", default=["fp32"])
    parser.add_argument("--batch-sizes", nargs="+", type=int, default=[1, 4])
    parser.add_argument("--repeats", type=int, default=50)
    parser.add_argument("--warmup", type=int, default=10)
    args = parser.parse_args()
    unsupported = set(args.precision) - {"fp32", "fp16"}
    if unsupported:
        raise SystemExit(f"Unsupported prototype precision: {sorted(unsupported)}")
    results = []
    for batch in args.batch_sizes:
        result = benchmark(batch, args.repeats, args.warmup)
        result.update({"precisions_requested": args.precision, "framework": "pytorch-fp32-baseline"})
        results.append(result)
    report = {"platform": platform.platform(), "torch": torch.__version__, "cuda_available": torch.cuda.is_available(), "results": results}
    print(json.dumps(report, indent=2))
