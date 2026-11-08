# AI-Powered Role-Based Candidate Screening System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18/19-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-orange.svg)](https://www.trychroma.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-f55036.svg)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Repository**: [https://github.com/HrishiKShah28/AI_Screening_system](https://github.com/HrishiKShah28/AI_Screening_system)  
> **Assignment**: AI/ML & Backend Engineering Intern Assignment (PG-AGI)

---

## 1. Overview

The **AI-Powered Role-Based Candidate Screening System** is an intelligent technical assessment platform. Instead of generic question banks or ungrounded conversational loops, this system conducts structured, role-specific technical interviews dynamically grounded in:
1. **The Candidate's Resume**: Parsed skills, frameworks, tools, and domain exposure.
2. **The Target Role**: Pre-configured competency profiles (e.g. AI/ML Engineer, Data Science / Applied ML, Backend Engineer).
3. **Authoritative Textbook Knowledge Base (RAG)**: Ingested technical literature (Tom Mitchell, Andriy Burkov, Müller & Guido, Jason Brownlee, Christopher Bishop) indexed in ChromaDB.

Every generated question links directly to source citations (book title, author, page number, and chunk ID) for complete academic grounding and traceability.

---

## 2. Architecture & Design Documentation

Comprehensive design specifications are available in the [`docs/`](docs/) directory:

- [**PRD (Product Requirements Document)**](docs/PRD.md): Functional and non-functional requirements, acceptance criteria, and system flow.
- [**System Architecture**](docs/ARCHITECTURE.md): Component diagrams, sequence flow, and service boundaries.
- [**API Contracts**](docs/API_CONTRACTS.md): RESTful endpoints, request/response DTO schemas.
- [**Database Schema**](docs/DATABASE_SCHEMA.md): Entity-relationship diagrams and SQLite table specifications.
- [**Development Plan**](docs/DEVELOPMENT_PLAN.md): 48-hour phased roadmap and milestone tracking.
- [**Architecture Decision Records (ADRs)**](docs/DECISIONS.md): 8 key engineering trade-offs and rationale.
- [**Agent Operational Guidelines**](AGENTS.md): Coding rules, layer separation, and development standards.

---

## 3. Technology Stack

- **Frontend**: React, Vite, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend**: Python 3.10+, FastAPI, Pydantic V2, SQLAlchemy 2.0.
- **Relational Storage**: SQLite 3 (`data/screening_system.db`).
- **Vector Storage**: ChromaDB (`data/chroma_db`).
- **Embeddings**: Sentence-Transformers (`all-MiniLM-L6-v2`) running locally.
- **LLM Gateway**: Groq Cloud with Meta Llama 3.3 70B (ultra-fast inference, free-tier tier, high reasoning).
- **PDF Extraction**: PyMuPDF (`fitz`).

---

## 4. Quickstart Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm
- Free Groq API Key ([https://console.groq.com](https://console.groq.com))

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Groq API key in `.env`:
```env
LLM_PROVIDER=groq
GROQ_API_KEY=your_actual_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

---

## 5. Development Status

| Phase | Milestone | Status |
|---|---|---|
| **Phase 1** | Architecture, Database Models & Scaffolding | In Progress |
| **Phase 2** | Knowledge Ingestion & ChromaDB RAG Pipeline | Upcoming |
| **Phase 3** | Resume Ingestion & Dynamic Query Synthesizer | Upcoming |
| **Phase 4** | Grounded Question Generator & Adaptive Interview | Upcoming |
| **Phase 5** | Grounded Answer Evaluation & Final Report | Upcoming |
| **Phase 6** | Modern React + Vite Frontend Interface | Upcoming |
| **Phase 7** | Verification, Seed Resumes & Demo Video | Upcoming |
