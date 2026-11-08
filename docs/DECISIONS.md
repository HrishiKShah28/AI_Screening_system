# Architecture Decision Records (ADRs)

## Project: AI-Powered Role-Based Candidate Screening System

This document outlines key technical decisions, context, evaluated alternatives, and rationales for the screening system architecture.

---

### ADR 001: Monolith with Strict Layer Separation vs. Microservices

- **Status**: Accepted
- **Context**: The assignment specifies building an end-to-end MVP within a 48-hour timeline with clear separation of concerns, robust error handling, and local reproducibility.
- **Decision**: Build a modular monolithic FastAPI backend with strict service-layer isolation (`api/`, `services/`, `rag/`, `models/`) and a decoupled React Vite frontend.
- **Rationale**:
  - Microservices introduce unnecessary network serialization overhead, multi-service Docker orchestration, and distributed transaction complexity without adding value for this evaluation scope.
  - A modular monolith enforces high cohesion and loose coupling within a single deployable process, ensuring straightforward local reproduction and rapid iteration.
- **Alternatives Considered**:
  - *Microservices (separate RAG service, Resume service, Interview service)*: Rejected due to operational complexity and failure risk under tight time constraints.

---

### ADR 002: ChromaDB Persistent Client vs. Cloud Vector Stores

- **Status**: Accepted
- **Context**: The system must store textbook vector embeddings locally and support partitioned collections for different roles.
- **Decision**: Use ChromaDB (`chromadb.PersistentClient`) with local on-disk storage (`./data/chroma_db`).
- **Rationale**:
  - Zero external network dependencies, zero monthly infrastructure costs, and zero cloud API key requirements for vector search.
  - ChromaDB provides rich metadata filtering (e.g. filtering chunks by book title, author, or role partition) and integrates seamlessly with Python.
  - Persistence to disk guarantees that once books are ingested, the vector database remains available across backend server restarts.
- **Alternatives Considered**:
  - *Pinecone / Qdrant Cloud*: Requires external network calls, API keys, and Internet connectivity; introduces latency and rate limiting risks.
  - *FAISS*: Fast, but lacks native metadata persistence and document management out of the box without building custom wrappers.

---

### ADR 003: Local Sentence-Transformers Embeddings vs. External API Embeddings

- **Status**: Accepted
- **Context**: Textbooks contain hundreds of pages requiring thousands of chunk embeddings during ingestion and query processing.
- **Decision**: Use Hugging Face's `sentence-transformers/all-MiniLM-L6-v2` (or `BAAI/bge-small-en-v1.5`) running locally on CPU/GPU.
- **Rationale**:
  - **Zero Cost & No Rate Limits**: Ingesting multiple 300+ page textbooks would quickly exceed free-tier API limits on hosted embedding endpoints.
  - **High Performance**: `all-MiniLM-L6-v2` produces compact 384-dimensional vectors with sub-20ms inference latency per query on standard consumer CPUs.
  - **Deterministic & Offline**: Embeddings are 100% reproducible across developer machines without cloud dependencies.
- **Alternatives Considered**:
  - *OpenAI `text-embedding-3-small`*: High quality, but requires paid API keys and introduces rate-limiting bottlenecks during large-scale book ingestion.

---

### ADR 004: Provider-Agnostic LLM Gateway (Groq Llama / Gemini / OpenAI Adapter)

- **Status**: Accepted
- **Context**: The system requires an LLM for structured resume parsing, question generation, and candidate answer evaluation.
- **Decision**: Implement a unified `LLMGateway` interface with **Groq (Llama-3.3-70b-versatile / Llama-3.1-8b-instant)** as the primary free-tier provider, with fallback compatibility for Google Gemini and OpenAI-compatible endpoints.
- **Rationale**:
  - Groq Cloud provides free-tier API access with ultra-fast token generation speed (over 200-300 tokens/sec), ensuring near-instant response times for interactive interview turns.
  - Meta Llama 3.3 70B exhibits state-of-the-art reasoning on technical question formulation and rubric-based code/text evaluation.
  - Decoupling via a gateway interface isolates provider SDK details from domain services, adhering to the Dependency Inversion Principle.
- **Alternatives Considered**:
  - *Local LLMs (Ollama / Llama-3)*: Running 70B models locally requires enterprise GPUs; 8B models on CPU have high latency.
  - *Paid OpenAI endpoints*: Introduces per-token credit costs not required for MVP delivery.

---

### ADR 005: Section-Aware Recursive Chunking with Metadata vs. Fixed Character Splitting

- **Status**: Accepted
- **Context**: Technical machine learning textbooks contain algorithmic formulations, mathematical equations, and explanatory code blocks that lose meaning if split arbitrarily.
- **Decision**: Implement a recursive chunker with a 600–900 token window, 120-token overlap, and page-tracking metadata.
- **Rationale**:
  - Splitting recursively on paragraph breaks (`\n\n`), sentence terminators (`. `), and line breaks keeps complete concepts and algorithm steps intact.
  - Storing the book title, author, chapter, and page number with every chunk fulfills the mandatory requirement for source traceability and auditability.
- **Alternatives Considered**:
  - *Fixed 500-character chunking*: Slices words and formulas mid-sentence, causing hallucinated or incoherent question generation.

---

### ADR 006: Dynamic Query Construction Combining Candidate Resume and Role Taxonomy

- **Status**: Accepted
- **Context**: Interview questions must not be static templates. They must bridge the candidate's actual resume background with authoritative textbook knowledge.
- **Decision**: Dynamic Query Synthesizer that combines candidate-claimed skills, target role core competencies, and previous interview turns to retrieve targeted textbook chunks.
- **Rationale**:
  - If a candidate claims PyTorch and computer vision on their resume, the query constructor specifically pulls gradient optimization or convolutional network chunks from the textbook.
  - Inspecting prior questions avoids asking repetitive questions on the same topic and enables adaptive difficulty scaling.
- **Alternatives Considered**:
  - *Predefined question banks*: Violates the assignment requirement for dynamic, resume-influenced question generation.
  - *Raw resume-to-vector search*: Searching the entire resume against the vector store yields diffuse, unfocused retrieval results.

---

### ADR 007: Rubric-Based LLM Answer Evaluation with Grounded Source Context

- **Status**: Accepted
- **Context**: Candidate answers need objective, constructive evaluation and scoring.
- **Decision**: Feed both the candidate's answer and the exact textbook ground-truth passage into the LLM with a structured grading rubric (Conceptual Accuracy, Practical Depth, Strengths, Gaps).
- **Rationale**:
  - Comparing the answer against the specific textbook passage grounds the evaluation in factual truth rather than the LLM's subjective impression.
  - Returning structured feedback with separate scores and actionable advice provides immediate value for both the candidate and the hiring team.
- **Alternatives Considered**:
  - *Cosine similarity between answer and textbook chunk*: Insensitive to nuances, logic flaws, or superficial keyword stuffing.
  - *Open-ended LLM grading without context*: High hallucination rate and inconsistent scoring standards.

---

### ADR 008: PyMuPDF (`fitz`) for PDF Extraction

- **Status**: Accepted
- **Context**: Both resumes and technical textbooks are supplied as PDFs requiring robust, fast text and layout extraction.
- **Decision**: Use `PyMuPDF` (`fitz`) as the standard PDF extraction engine across both resume parsing and knowledge ingestion.
- **Rationale**:
  - PyMuPDF is written in C (MuPDF engine) and is up to 10x faster than pure-Python libraries like `pypdf` or `pdfminer`.
  - Accurately captures page boundaries and font metadata, allowing chapter headers and section boundaries to be detected reliably.
- **Alternatives Considered**:
  - *PyPDF2 / pypdf*: Significantly slower on multi-hundred-page textbooks and prone to text encoding artifacts.
  - *pdfplumber*: Excellent layout extraction, but too slow for full-book ingestion.

