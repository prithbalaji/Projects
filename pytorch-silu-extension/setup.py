from setuptools import setup
from torch.utils.cpp_extension import BuildExtension, CUDAExtension

setup(
    name="silu_cuda",
    version="0.1.0",
    ext_modules=[
        CUDAExtension(
            name="silu_cuda",
            sources=["silu.cpp", "silu_kernel.cu"],
            extra_compile_args={"cxx": ["-O3"], "nvcc": ["-O3"]},
        )
    ],
    cmdclass={"build_ext": BuildExtension},
)
