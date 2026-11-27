import argparse
import asyncio
import statistics
import time

import httpx

async def run(url: str, requests: int, concurrency: int):
    latencies = []
    sem = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient(timeout=30) as client:
        async def one(i):
            async with sem:
                start = time.perf_counter()
                response = await client.post(url, json={"inputs": [[float(i % 784) for _ in range(784)]]})
                response.raise_for_status()
                latencies.append((time.perf_counter() - start) * 1000)
        await asyncio.gather(*(one(i) for i in range(requests)))
    ordered = sorted(latencies)
    p50 = ordered[len(ordered)//2]
    p99 = ordered[min(len(ordered)-1, int(len(ordered)*0.99))]
    print({"requests": requests, "concurrency": concurrency,
           "p50_ms": p50, "p99_ms": p99,
           "mean_ms": statistics.mean(latencies)})

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", default="http://localhost:8000/v2/models/demo/infer")
    parser.add_argument("--requests", type=int, default=100)
    parser.add_argument("--concurrency", type=int, default=10)
    args = parser.parse_args()
    asyncio.run(run(args.url, args.requests, args.concurrency))
