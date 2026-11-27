import argparse
import json
from pathlib import Path

import torch
import torchvision.models as models


@torch.inference_mode()
def export(path: str) -> None:
    model = models.resnet18(weights=None).eval().cpu()
    dummy = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy,
        path,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=17,
    )
    print(f"Exported ONNX model to {path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="model.onnx")
    args = parser.parse_args()
    export(args.output)
