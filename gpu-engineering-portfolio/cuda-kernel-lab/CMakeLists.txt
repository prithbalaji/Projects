cmake_minimum_required(VERSION 3.18)
project(cuda_kernel_lab LANGUAGES CXX)

find_package(CUDAToolkit REQUIRED)
enable_language(CUDA)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CUDA_STANDARD 17)
set(CMAKE_CUDA_ARCHITECTURES native)

add_executable(cuda_kernel_lab main.cu kernels.cuh)
target_include_directories(cuda_kernel_lab PRIVATE ${CMAKE_CURRENT_SOURCE_DIR})
