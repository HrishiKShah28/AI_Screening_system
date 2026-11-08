# Development & Execution Plan (48-Hour Roadmap)

## Project: AI-Powered Role-Based Candidate Screening System
**Assignment Window**: 48 Hours  
**Engineering Approach**: Incremental Milestones with Continuous Verification

---

## 1. Timeline & Milestone Overview

```mermaid
gantt
    title 48-Hour Implementation Plan
    dateFormat X
    axisFormat %H h
    section Foundations
    Phase 1: Environment & Data Layer       :p1, 0, 6
    Phase 2: RAG Pipeline & Ingestion       :p2, 6, 14
    section Core AI & Backend
    Phase 3: Resume Parser & Query Engine   :p3, 14, 20
    Phase 4: Adaptive Question Generation   :p4, 20, 26
    Phase 5: Evaluation & Report Engine     :p5, 26, 32
    section Full-Stack & UI
    Phase 6: React Frontend Interface       :p6, 32, 40
    section Delivery
    Phase 7: Testing, Polish & Demo Video   :p7, 40, 48
```

---

## 2. Detailed Phase Breakdown

### Phase 1: Environment, Configuration & Database Foundations (Hours 0 – 6)
- **Deliverables**:
  - Initialize project structure with `backend/` and `frontend/`.
  - Configure `.env` and `pydantic-settings` in `backend/app/config.py`.
  - Implement SQLAlchemy 2.0 models (`resumes`, `roles`, `interview_sessions`, `interview_questions`, `interview_answers`, `knowledge_documents`).
  - Create database engine setup and automated table creation script (`init_db.py`).
  - Seed default roles (`ai_ml_engineer`, `data_science_applied_ml`, `backend_engineer`) with competencies.
- **Verification**:
  - Run database initialization script; verify SQLite database file creation and table schemas.

---

### Phase 2: Knowledge Ingestion & Vector Pipeline (Hours 6 – 14)
- **Deliverables**:
  - Implement `DocumentLoader` using PyMuPDF (`fitz`) to extract clean text from technical PDFs, capturing chapter titles and page numbers.
  - Implement `RecursiveChunker` with token-based boundaries (600–900 tokens) and 120-token overlap, preserving code and math notation.
  - Implement `SentenceTransformerEmbedder` using `all-MiniLM-L6-v2` generating 384-dimensional dense vectors.
  - Build `ChromaVectorStore` wrapper managing persistent collections partitioned by role.
  - Create CLI ingestion tool (`backend/scripts/ingest_books.py`) allowing one-command batch ingestion of textbook PDFs.
- **Verification**:
  - Ingest sample textbook chapters (e.g., from *The Hundred-Page Machine Learning Book* and *Introduction to Machine Learning with Python*).
  - Verify chunk metadata (book, author, page number) in ChromaDB and execute a test query returning top-3 relevant chunks.

---

### Phase 3: Resume Ingestion & Dynamic Query Synthesizer (Hours 14 – 20)
- **Deliverables**:
  - Implement `ResumeService`: PyMuPDF text extractor + structured LLM entity extractor returning parsed skills, frameworks, tools, and domain exposure.
  - Fallback endpoint for raw text/markdown resume input.
  - Build `QueryConstructor`:
    - Combines extracted resume skills with role competencies.
    - Inspects previous questions and answers in the session to avoid duplicate topics.
    - Formulates precise semantic search queries for vector retrieval.
- **Verification**:
  - Test parsing against sample PDF resumes (junior, mid, senior); verify valid Pydantic extraction.
  - Verify query synthesizer produces role-relevant and candidate-specific search queries.

---

### Phase 4: Grounded Question Generator & Adaptive Interview Engine (Hours 20 – 26)
- **Deliverables**:
  - Build `QuestionGenerator`:
    - Ingests top-k retrieved book passages and candidate resume highlights.
    - Generates deep technical questions requiring conceptual understanding or applied reasoning.
    - Captures source traceability metadata (`book_title`, `author`, `page`, `chunk_id`).
  - Implement `InterviewService`:
    - Session state machine (`INITIALIZED` -> `IN_PROGRESS` -> `COMPLETED`).
    - Dynamic difficulty adjustment: if previous answer is rated high ($> 8.0$), increases difficulty to `advanced`; if low, adjusts to `foundational`.
- **Verification**:
  - Unit test question generation prompt with mock chunks; verify questions reference candidate resume context while remaining grounded in the textbook excerpt.

---

### Phase 5: Answer Evaluation & Final Assessment Engine (Hours 26 – 32)
- **Deliverables**:
  - Build `EvaluationService`:
    - Rubric-based LLM grading comparing candidate answer against the textbook ground-truth context.
    - Produces scores for Conceptual Accuracy (0–10), Practical Depth (0–10), and Composite Score (0–10).
    - Generates actionable constructive feedback, strengths, and missing concepts.
  - Build Report Generator:
    - Synthesizes session-wide executive summary.
    - Computes dimensional competency breakdown.
    - Formulates hiring recommendation (`STRONG_HIRE`, `HIRE`, `LEANING_NO`, `NO_HIRE`).
- **Verification**:
  - Run benchmark answers (excellent, average, incorrect); verify evaluator assigns calibrated scores and constructive feedback.

---

### Phase 6: Modern React + Vite Frontend (Hours 32 – 40)
- **Deliverables**:
  - Setup React 18/19 + TypeScript + Vite + Tailwind CSS.
  - Build 4 main views / steps:
    1. **Role Selection**: Interactive cards with topic badges.
    2. **Resume Upload**: Drag-and-drop PDF dropzone with real-time parsing state and extracted skill chip preview.
    3. **Live Interview Console**:
       - Single-question focus mode.
       - Markdown response editor.
       - Real-time timer.
       - "Grounded Knowledge Source" expandable accordion/badge (showing book title, author, and chapter).
       - Question progress bar ($N / M$).
    4. **Comprehensive Assessment Report**:
       - Score badge & hiring recommendation.
       - Competency breakdown with visual progress meters.
       - Question-by-question accordion with candidate answers and evaluator feedback.
- **Verification**:
  - Complete end-to-end user run-through in the browser from resume upload to final report download/view.

---

### Phase 7: Integration, Verification, Polish & Demo Video Prep (Hours 40 – 48)
- **Deliverables**:
  - End-to-end integration tests (`test_interview_flow.py`).
  - Populate `data/sample_resumes/` and sample textbook content for out-of-the-box local testing.
  - Write comprehensive `README.md` with setup guide, architectural diagrams, API examples, and design decisions.
  - Record the mandatory end-to-end demonstration video showcasing the working system.
- **Verification**:
  - Clone/test fresh checkout in clean virtual environment; ensure zero-setup-friction reproducibility.

