# AI-Powered Role-Based Candidate Screening System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-orange.svg)](https://www.trychroma.com)
[![Groq](https://img.shields.io/badge/Groq-Free_LLM_Inference-f55036.svg)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **GitHub Repository**: [https://github.com/HrishiKShah28/AI_Screening_system](https://github.com/HrishiKShah28/AI_Screening_system)  
> **Assignment**: AI/ML & Backend Engineering Intern Assignment (PG-AGI)

---

## 1. Executive Summary

The **AI-Powered Role-Based Candidate Screening System** is a production-quality, multi-stage assessment platform that conducts structured technical interviews. Unlike static question banks or ungrounded chatbots, this system dynamically synthesizes technically rigorous interview questions derived from:

1. **Candidate Resume**: Parsed technical competencies, tools, frameworks, and domain exposure.
2. **Target Job Role**: Pre-configured competency profiles (AI/ML Engineer, Data Science / Applied ML, Backend Engineer).
3. **Role-Specific Authoritative Knowledge Base (RAG)**: Ingested textbook literature (Tom Mitchell, Andriy Burkov, Andreas Müller & Sarah Guido, Martin Kleppmann) indexed in persistent ChromaDB collections.

Every question generated features complete **academic source traceability** (book title, author, page number, and similarity score) to guarantee factual grounding and prevent hallucination.

```
Resume Upload ──▶ Parsing & NER ──▶ Role Selection ──▶ Context Formulation ──▶ ChromaDB Retrieval
                                                                                      │
                                                                                      ▼
Final Report ◀── Session Aggregation ◀── Rubric Grading ◀── Interactive Console ◀── Grounded Question
```

---

## 2. Architecture & Design Documentation

Comprehensive architectural blueprints and technical specifications are committed in [`docs/`](docs/):

- [**PRD (Product Requirements Document)**](docs/PRD.md): Mandatory and extension requirements, acceptance criteria, and system flow.
- [**System Architecture**](docs/ARCHITECTURE.md): Component diagrams, sequence flow, and service boundaries.
- [**API Contracts**](docs/API_CONTRACTS.md): Detailed REST endpoints, request payloads, and response DTO schemas.
- [**Database Schema**](docs/DATABASE_SCHEMA.md): Entity-relationship diagrams and SQLite table specifications.
- [**Development Plan**](docs/DEVELOPMENT_PLAN.md): 48-hour phased roadmap with milestone verification gates.
- [**Architecture Decision Records (ADRs)**](docs/DECISIONS.md): 8 key engineering trade-offs and rationale.
- [**Agent Operational Guidelines**](AGENTS.md): Coding rules, layer separation, and development standards.

---

## 3. Technology Stack

| Layer | Technology | Role & Justification |
|---|---|---|
| **Frontend** | React 19 + Vite + TypeScript + Tailwind CSS | Responsive 4-stage wizard UI, typed API client, single-question focus mode. |
| **Backend API** | FastAPI (Python 3.10+) | Asynchronous request handling, Pydantic V2 schema validation, OpenAPI docs at `/docs`. |
| **Relational Database** | SQLite 3 + SQLAlchemy 2.0 | Transactional persistence (`data/screening_system.db`) for resumes, sessions, questions, and answers. |
| **Vector Database** | ChromaDB (`PersistentClient`) | On-disk persistent collections (`data/chroma_db`) partitioned by role domain. |
| **Embeddings** | Sentence-Transformers (`all-MiniLM-L6-v2`) | Local 384-dimensional dense vectors with sub-20ms inference latency. |
| **LLM Gateway** | Groq Cloud (`openai/gpt-oss-120b` / `qwen/qwen3.8-27b`) | High-speed, free-tier LLM inference for candidate NER, grounded questioning, and rubric evaluations. |
| **PDF Extraction** | PyMuPDF (`fitz`) | High-performance C-based text extraction from technical textbooks and resumes. |

---

## 4. Quickstart Guide (Local Setup)

### 4.1 Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Free Groq API Key ([https://console.groq.com](https://console.groq.com))

### 4.2 Clone & Configure Environment
```bash
git clone https://github.com/HrishiKShah28/AI_Screening_system.git
cd AI_Screening_system

# Copy environment template
cp .env.example .env
```

Open `.env` and insert your Groq API key:
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
```

### 4.3 Initialize Database & Ingest Knowledge Base
```bash
# Initialize SQLite database and seed roles
python backend/scripts/init_db.py

# Ingest foundational reference literature into ChromaDB
python backend/scripts/ingest_books.py --curated-only
```

*(Optional: Place additional textbook PDFs in `data/knowledge_base/ai_ml/` or `data/knowledge_base/data_science/` and run `python backend/scripts/ingest_books.py` to index full books).*

### 4.4 Run Backend Server
```bash
# From workspace root
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at `http://127.0.0.1:8000/docs`.

### 4.5 Run Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 5. End-to-End System Walkthrough

1. **Role Selection**: Select target position (**AI / Machine Learning Engineer**, **Data Science / Applied ML**, or **Backend Systems Engineer**).
2. **Resume Ingestion**: Upload a resume PDF (sample provided at `data/sample_resumes/alex_rivera_ai_engineer.pdf`) or paste text. The system automatically extracts skills, tools, and experience level.
3. **Interactive Screening**:
   - Single-question focus interface with a live response timer.
   - Dynamic difficulty indicator (`beginner`, `intermediate`, `advanced`) adaptively calibrated by previous answers.
   - Expandable **Grounded Knowledge Source** badge displaying the textbook title, author, page number, and relevant excerpt.
   - Instant rubric-based evaluation card displaying Conceptual Accuracy, Practical Depth, and constructive feedback.
4. **Assessment Report**:
   - Executive evaluation summary.
   - Hiring recommendation badge (`STRONG_HIRE`, `HIRE`, `LEANING_NO`, `NO_HIRE`).
   - Dimensional competency breakdown (Conceptual Accuracy, Applied Engineering, Depth of Knowledge, Communication Clarity).
   - Question-by-question audit history with candidate answers, evaluator feedback, and grounded citations.

---

## 6. Running Tests & Pipeline Verification

To verify the entire screening pipeline end-to-end programmatically:
```bash
python backend/tests/test_pipeline.py
```

---

## 7. Submission Checklist

- [x] Full Git repository with clean commit history.
- [x] Comprehensive documentation in `docs/` (PRD, Architecture, API Contracts, Database Schema, Development Plan, Decisions).
- [x] Decoupled backend service layer and AI/ML RAG pipeline.
- [x] Persistent ChromaDB vector index with textbook citations.
- [x] Functional React + TypeScript + Vite frontend with Tailwind CSS.
- [x] Out-of-the-box local reproducibility with benchmark sample resumes.
- [ ] End-to-end demonstration video recording (Mandatory for final submission).
