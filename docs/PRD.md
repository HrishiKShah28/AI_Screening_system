# Product Requirements Document (PRD)

## Project: AI-Powered Role-Based Candidate Screening System
**Role**: AI/ML & Backend Engineering Intern Assignment (PG-AGI)  
**Timeline**: 48-Hour Execution Window  
**Target Quality**: Production-Ready MVP  

---

## 1. Executive Summary & Objective

The **AI-Powered Role-Based Candidate Screening System** is an intelligent, multi-stage assessment platform that conducts structured technical interviews. Unlike static questionnaire systems or open-domain chat interviewers, this platform generates highly relevant, technically deep, and grounded interview questions derived dynamically from:

1. **The Candidate's Resume**: Extracting verified skills, tools, frameworks, and domain exposure to tailor the conversation.
2. **The Target Job Role**: Aligning the topical focus with target competency frameworks (e.g., AI/ML Engineer, Data Scientist / Applied ML Engineer, Backend Engineer).
3. **Role-Specific Authoritative Knowledge Base**: Utilizing curated, foundational textbooks (e.g., Tom Mitchell's *Machine Learning*, Andriy Burkov's *The Hundred-Page Machine Learning Book*, Jason Brownlee's *Master Machine Learning Algorithms*, Müller & Guido's *Introduction to Machine Learning with Python*, Bishop's *Pattern Recognition and Machine Learning*), preventing LLM hallucination and enforcing academic and practical rigor.

The system guides the candidate through an interactive interview session, tracks session continuity, dynamically adapts questions based on candidate answers, evaluates responses against reference concepts, and produces a comprehensive assessment report.

---

## 2. Requirements Matrix

### 2.1 Mandatory Requirements (from Assignment Specification)

| ID | Category | Requirement | Acceptance Criteria |
|---|---|---|---|
| **REQ-M1** | Candidate Entry | Dual-input ingestion (PDF or text resume) & role selection | User can drag-and-drop a PDF resume or paste text; user selects from pre-configured technical roles. |
| **REQ-M2** | Resume Processing | Resume parsing and entity extraction | System extracts candidate name, contact info, core technical skills, frameworks, tools, and domain exposure. |
| **REQ-M3** | Context Construction | Role & resume-guided context formulation | System matches extracted resume skills with role competencies to formulate targeted retrieval queries. |
| **REQ-M4** | Knowledge Retrieval | Role-specific RAG knowledge retrieval | System queries a persistent vector database indexed on authoritative textbook corpora, returning top-k relevant chunks with similarity metrics. |
| **REQ-M5** | Question Generation | Grounded, role-specific question generation | Generates non-generic interview questions strictly grounded in retrieved book context while referencing candidate background. |
| **REQ-M6** | Interactive Interview | Multi-turn interview session with state continuity | Maintains active session state in SQLite; serves questions one by one; allows candidate to type answers. |
| **REQ-M7** | Response Handling | Answer storage and evaluation | Persists questions, answers, latency, and evaluation scores in the relational database. |
| **REQ-M8** | Final Output | Detailed evaluation report & session insights | Generates final assessment summary with category breakdowns, conceptual accuracy, practical depth, strengths, and weaknesses. |
| **REQ-M9** | Architecture | Modular separation of concerns | Distinct separation among API routes, service layer, AI/ML RAG pipeline, and persistence layer. |
| **REQ-M10** | Deliverables | GitHub repository + mandatory demo video | Clean repository with complete README, architectural documentation, setup scripts, and working video demo. |

---

### 2.2 AI/ML & RAG Requirements

1. **Document Ingestion**:
   - Ingestion of PDF textbooks using PyMuPDF (`fitz`), preserving structural metadata (book title, chapter/section, page number).
   - Filter out non-content pages (table of contents, index, preface, blank pages).
2. **Chunking Strategy**:
   - Section-aware recursive character chunking with 600–900 token window and 100–150 token overlap.
   - Preservation of semantic coherence, technical equations, code snippets, and conceptual definitions.
3. **Embedding Generation**:
   - Sentence-Transformers (`all-MiniLM-L6-v2` or `BAAI/bge-small-en-v1.5`) generating 384-dimensional dense vectors locally.
   - Fully reproducible, deterministic, and runnable offline without external API rate limits for ingestion.
4. **Vector Storage**:
   - ChromaDB persistent collection partitioned by role domain (`ai_ml_corpus`, `data_science_corpus`).
   - Metadata tagging per chunk: `book_title`, `authors`, `page_number`, `section_heading`, `chunk_id`.
5. **Dynamic Query Construction**:
   - Synthesizer combining candidate resume skills, role taxonomy, and previous interview performance into targeted search queries.
6. **Relevance Filtering & Grounding**:
   - Cosine similarity thresholding ($s \ge 0.60$) with maximum marginal relevance (MMR) or diversity reranking to avoid redundant questions.
7. **Traceability**:
   - Every generated question must store references to its source chunks (book title, page, quote excerpt) in the database for auditing and explainability.
8. **Answer Evaluation**:
   - LLM-assisted rubric grading: Conceptual Accuracy (0–10), Practical Depth (0–10), Relevance (0–10).
   - Generates constructive feedback and identifies gaps.

---

### 2.3 Backend & Systems Requirements

1. **FastAPI Framework**:
   - Asynchronous request handling, Pydantic V2 schemas for request/response validation, OpenAPI/Swagger docs at `/docs`.
2. **Service-Oriented Architecture**:
   - API endpoints (`app/api/`) only handle HTTP protocol concerns and delegate immediately to domain services (`app/services/`).
   - RAG logic encapsulated in `app/rag/`.
3. **Relational Data Layer**:
   - SQLite with SQLAlchemy 2.0 ORM.
   - ACID-compliant transaction boundaries, cascade relationships, and indexed foreign keys.
4. **Configuration & Secrets**:
   - `pydantic-settings` reading from `.env`. Zero hardcoded credentials or API keys.
5. **Error Handling**:
   - Custom exception hierarchy (`AppException`, `EntityNotFoundException`, `RAGRetrievalException`, `LLMGenerationException`) mapped to standardized JSON error responses.

---

### 2.4 Frontend Requirements

1. **Technology Stack**:
   - React 18 / 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons.
2. **Candidate Experience Flow**:
   - **Step 1: Landing & Role Selection**: Role cards detailing target competencies.
   - **Step 2: Resume Upload**: Drag-and-drop PDF uploader, instant parsing status, extracted skill chips display.
   - **Step 3: Interview Console**: Focused single-question interface, countdown timer, markdown editor/textarea for answer, live source citation preview ("Grounded in *The Hundred-Page Machine Learning Book, Ch. 3*").
   - **Step 4: Real-time Feedback & Progression**: Visual progress indicator (Question $N$ of $M$), question difficulty badge, transition states.
   - **Step 5: Assessment Report**: Executive summary, radar chart of competencies, detailed question-by-question breakdown, actionable recommendations.

---

### 2.5 Submission Requirements

1. **GitHub Repository**:
   - Clean commit history.
   - Comprehensive `README.md` with quickstart instructions, environment configuration, system architecture diagrams, and design rationales.
   - Modular, linted codebase following PEP 8 and TypeScript best practices.
2. **Mandatory Video Demo**:
   - End-to-end recording demonstrating resume upload, role selection, dynamic question generation, live answer submission, adaptive follow-up, and final report generation.
