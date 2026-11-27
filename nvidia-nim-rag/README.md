# NIM Document Q&A (RAG)

A small command-line Retrieval-Augmented Generation example. It extracts text from PDF, Markdown, and plain-text files, chunks it, embeds chunks locally with Sentence Transformers, retrieves the closest chunks, and asks an NVIDIA NIM chat endpoint to answer using those sources. Embedding runs locally; generation uses the hosted NIM API.

## Setup

Requires Python 3.10+ and an NVIDIA API key from the NVIDIA developer portal. From this directory:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
export NVIDIA_API_KEY='your-key'  # PowerShell: $env:NVIDIA_API_KEY='your-key'
python rag.py ./documents/guide.pdf ./notes.md --query "What are the setup steps?"
```

The first run downloads the embedding model from Hugging Face. Override `NIM_MODEL` if your account uses a different available model, for example `meta/llama-3.1-8b-instruct`. The default OpenAI-compatible endpoint is `https://integrate.api.nvidia.com/v1/chat/completions`; override it with `NIM_BASE_URL` when using another compatible deployment.

## Notes

- No document text or API key is written to disk by this script. Only the selected excerpts are sent to the configured model endpoint, so do not query with confidential documents unless your data policy allows it.
- This starter performs an in-memory search, not a persistent vector database. Add a database such as FAISS or Chroma if you want durable indexes.
- PDF extraction requires selectable text; scanned PDFs need OCR. Treat generated answers as untrusted and verify citations against the displayed source excerpts.
