# AI Agent Operational Guidelines & Architecture Standards

## Project: AI-Powered Role-Based Candidate Screening System

This document governs the engineering standards, architecture rules, and development protocols for any AI agent or contributor working within this codebase.

---

## 1. Core Engineering Principles

1. **Production-Quality MVP Focus**:
   - Prioritize correctness, functional RAG grounding, modular architecture, and end-to-end user experience.
   - Avoid overengineering. Do not create unnecessary microservices, message queues, or distributed complexity.
   - Stick to the unified monolithic backend (`FastAPI`) and clean frontend (`React + Vite + TypeScript`).

2. **Strict Layer Separation**:
   - **`api/`**: Only handles HTTP requests, status codes, query/body parameter validation, and DTO conversion. No business logic or database queries here.
   - **`services/`**: Encapsulates all domain workflows (session state management, interview orchestration, scoring logic).
   - **`rag/`**: Modular AI/ML components (loaders, chunkers, embedders, vector store, query synthesizer, question generator, LLM gateway).
   - **`models/`**: Pure SQLAlchemy 2.0 ORM models defining the relational database schema.
   - **`schemas/`**: Pydantic V2 schemas for input validation and serialized output responses.

3. **Grounding & Traceability Guarantee**:
   - Questions generated MUST be grounded in the ingested textbook corpus.
   - Every generated question must store metadata linking to the specific source book title, author, chapter, page number, and chunk ID.
   - Never fabricate or guess source citations.

4. **Security & Configuration**:
   - All secrets, API keys, and configurable parameters must be loaded via `backend/app/config.py` using `pydantic-settings`.
   - Never commit API keys or credentials to version control.

---

## 2. Coding Standards & Conventions

### Python Backend
- Python 3.10+ syntax with strict type annotations (`typing.Optional`, `typing.List`, `typing.Dict`, etc.).
- Follow PEP 8 style guidelines.
- Use asynchronous methods (`async def`) for I/O-bound operations (FastAPI endpoints, HTTP requests, LLM API calls).
- Use synchronous methods for CPU-bound computations (Sentence-Transformers inference, PyMuPDF extraction) wrapped with `asyncio.to_thread` when called from async contexts to avoid blocking the event loop.
- Use explicit Pydantic response models (`response_model=...`) on all API endpoints.

### React / TypeScript Frontend
- Functional components with React Hooks (`useState`, `useEffect`, `useContext`, `useCallback`).
- Strict TypeScript (`strict: true` in `tsconfig.json`). No `any` types; all API models must match the backend Pydantic schemas.
- Tailwind CSS for responsive, modern UI design.
- Reusable UI component library (`components/common/`, `components/interview/`, `components/report/`).

---

## 3. Directory Structure Layout

```
screening_system/
├── .env.example
├── .gitignore
├── AGENTS.md
├── README.md
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── API_CONTRACTS.md
│   ├── DATABASE_SCHEMA.md
│   ├── DEVELOPMENT_PLAN.md
│   └── DECISIONS.md
├── data/
│   ├── knowledge_base/        # Textbook PDFs partitioned by role
│   │   ├── ai_ml/
│   │   └── data_science/
│   ├── sample_resumes/        # Benchmark resumes for testing
│   ├── chroma_db/             # Local ChromaDB persistent files
│   └── screening_system.db    # SQLite relational database
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI entry point & CORS
│   │   ├── config.py          # Pydantic Settings
│   │   ├── api/               # API route controllers
│   │   │   ├── deps.py        # Dependency injection
│   │   │   ├── resumes.py     # Resume upload & parsing
│   │   │   ├── interviews.py  # Session lifecycle & questioning
│   │   │   ├── roles.py       # Role catalog & taxonomy
│   │   │   └── knowledge.py   # Ingestion status & triggers
│   │   ├── core/              # Database engine & base classes
│   │   │   ├── database.py
│   │   │   └── exceptions.py
│   │   ├── models/            # SQLAlchemy 2.0 ORM models
│   │   ├── schemas/           # Pydantic V2 DTO schemas
│   │   ├── services/          # Domain business logic
│   │   │   ├── resume_service.py
│   │   │   ├── interview_service.py
│   │   │   ├── evaluation_service.py
│   │   │   └── role_service.py
│   │   └── rag/               # AI/ML & RAG pipeline
│   │       ├── document_loader.py
│   │       ├── chunker.py
│   │       ├── embedder.py
│   │       ├── vector_store.py
│   │       ├── query_constructor.py
│   │       ├── question_generator.py
│   │       └── llm_gateway.py
│   ├── scripts/
│   │   ├── init_db.py         # DB migration & role seeding
│   │   └── ingest_books.py    # Offline CLI textbook ingestion
│   ├── tests/
│   └── requirements.txt
└── frontend/
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── api/               # Typed Axios / Fetch client
        ├── components/        # React components
        ├── context/           # Session context state
        ├── pages/             # Main screen flows
        └── types/             # TypeScript interfaces
```

---

## 4. Development Workflow Protocol

1. **Verify Before Coding**:
   - Check dependencies and environment configurations before invoking commands.
2. **Stepwise Implementation**:
   - Complete one layer and verify it with automated tests or CLI scripts before moving to the next.
3. **No Phantom Requirements**:
   - Adhere strictly to the requirements laid out in the assignment PDF. Do not invent unneeded enterprise frameworks.

