# NCCL and Nsight Profiling Lab

A two-part lab for distributed collectives and profiling evidence.

## NCCL prototype

The NCCL program prints a 1024-element AllReduce result on each rank and uses NCCL's unique-ID bootstrap. The first-run note is important: NCCL requires multiple GPUs or processes with a supported topology and matching driver/runtime stack.

```bash
cd nccl
mkdir build && cd build
cmake ..
cmp --build . -j
mpirun -np 2 ./nccl_allreduce --count 1024
```

MPI and NCCL are prerequisites. The program initializes one GPU per rank; the all-reduce sum of rank-specific values is then checked by every rank.

## Nsight

```bash
nsys profile --trace=cuda,nvtx,mpi ./nccl_allreduce --count 1048576
ncu --set full --kernel-name vector_add_kernel ./nccl_allreduce
```

Capture configuration and GPU topology before interpreting results.

## Safety and interpretation

Do not claim linear scaling without repeating runs and reporting message sizes, topology, and launched process/GPU count. This starter is not an MPI launch solution for every scheduler or cluster.
