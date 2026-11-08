# End-to-End Demo Video Walkthrough & Presentation Script

## Project: AI-Powered Role-Based Candidate Screening System
**Assignment**: PG-AGI AI/ML & Backend Engineering Internship  
**Recommended Recording Duration**: 3 – 5 Minutes  
**Demo Tools**: Loom / OBS Studio / Windows Screen Recorder (`Win + Alt + R`)

---

## 1. Video Structure & Timeline

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEMO VIDEO TIMELINE                             │
├──────────────┬───────────────────────────────┬─────────────────────────┤
│ Timestamp    │ Segment                       │ Screen Focus            │
├──────────────┼───────────────────────────────┼─────────────────────────┤
│ 0:00 – 0:45  │ Introduction & System Context │ Architecture Slide / UI │
│ 0:45 – 1:30  │ Role Selection & Ingestion    │ Browser (Stage 1 & 2)   │
│ 1:30 – 3:15  │ Interactive Adaptive Screening│ Browser (Stage 3)       │
│ 3:15 – 4:15  │ Assessment Report & Audit     │ Browser (Stage 4)       │
│ 4:15 – 5:00  │ Codebase & Architectural Proof│ VS Code / Terminal      │
└──────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## 2. Step-by-Step Script & Talking Points

### Part 1: Introduction & Problem Statement (0:00 – 0:45)
- **Talking Point**:
  > *"Hello everyone! Today I'm presenting my submission for the PG-AGI AI/ML & Backend Engineering internship assignment: the AI-Powered Role-Based Candidate Screening System."*
  > *"Most candidate screening tools rely on static question banks or ungrounded LLM prompts that hallucinate. This platform solves that by integrating a Retrieval-Augmented Generation (RAG) engine grounded in authoritative textbook literature—such as Tom Mitchell's Machine Learning and Burkov's The Hundred-Page Machine Learning Book—combined with the candidate's parsed resume and target job role."*

---

### Part 2: Stage 1 & 2 — Role Selection & Resume Ingestion (0:45 – 1:30)
- **Actions in UI**:
  1. Open `http://localhost:5173`.
  2. Show the **Role Selection** screen: Hover over the cards (*AI / Machine Learning Engineer*, *Data Science / Applied ML*, *Backend Systems Engineer*). Point out the syllabus topics.
  3. Select **AI / Machine Learning Engineer** and click **Proceed to Resume Ingestion**.
  4. In **Resume Ingestion**, drag and drop `data/sample_resumes/alex_rivera_ai_engineer.pdf` (or click to upload).
- **Talking Point**:
  > *"Here in Stage 1, we select our target competency profile. I'll choose AI / Machine Learning Engineer."*
  > *"In Stage 2, the candidate uploads their resume PDF. Our backend uses PyMuPDF to extract the text stream and Groq with Meta Llama to perform structured Named Entity Recognition (NER), instantly identifying core skills like PyTorch, Stochastic Gradient Descent, Loss Optimization, and experience level."*

---

### Part 3: Stage 3 — Interactive Screening & Textbook Grounding (1:30 – 3:15)
- **Actions in UI**:
  1. Click **Start Technical Interview**.
  2. Point out:
     - The **Question Progress** (`Question 1 of 3`) and **Difficulty Badge** (`intermediate`).
     - The live **Response Timer**.
     - The **Authoritative Textbook Citation** preview card (highlighting *The Hundred-Page Machine Learning Book*, chapter, page number, and similarity score).
  3. In the response textarea, paste a sample answer:
     > *"Batch gradient descent computes the loss gradient over the entire dataset per update, providing a smooth convergence path, but is computationally expensive. Stochastic Gradient Descent (SGD) updates weights per individual sample, introducing high variance that can help escape local minima. Mini-batch gradient descent balances both approaches by taking small batches of 32 or 64 samples, exploiting SIMD GPU parallelism while maintaining moderate gradient stability."*
  4. Click **Submit Answer**.
  5. Show the **Instant Rubric Evaluation Card**:
     - Point out the **Conceptual Accuracy** and **Practical Depth** progress bars.
     - Review the **Evaluator Feedback**, **Key Strengths**, and **Missing Nuances**.
  6. Click **Proceed to Next Question** to show **Adaptive Questioning**:
     - Point out how Question 2 adapts in difficulty based on Question 1's score.
  7. Submit an answer for Question 2 and proceed to completion.
- **Talking Point**:
  > *"Every question is dynamically synthesized from the candidate's resume and authoritative textbook passages retrieved from ChromaDB using 384-dimensional dense vectors."*
  > *"Notice the Citation Preview: it explicitly cites the source book, page number, and excerpt. When the candidate submits an answer, our evaluation service grades it against the textbook reference using a calibrated rubric—scoring Conceptual Accuracy and Practical Depth separately—and provides immediate, actionable feedback."*

---

### Part 4: Stage 4 — Final Assessment Report (3:15 – 4:15)
- **Actions in UI**:
  1. Click **Complete Interview & View Final Report**.
  2. Walk through the dashboard:
     - **Executive Top Banner**: Overall Rating (e.g. `8.4 / 10`) and Decision Badge (`STRONG_HIRE` or `HIRE`).
     - **Executive Assessment Summary**: Synthesized narrative of technical aptitude.
     - **Dimensional Competencies**: Conceptual Accuracy, Applied Engineering, Depth of Knowledge, Communication Clarity.
     - **Strengths & Growth Areas**.
     - **Detailed Question Audit & Grounded Proof**: Expand an item to show the full question, candidate answer, evaluator feedback, and textbook citation proof.
- **Talking Point**:
  > *"The final output is an executive screening report. It provides an overall hiring recommendation, dimensional competency meters, and a transparent, question-by-question audit trail with grounded citations for complete accountability."*

---

### Part 5: Codebase & Architecture Walkthrough (4:15 – 5:00)
- **Actions in VS Code / Terminal**:
  1. Briefly show the clean directory layout:
     - `backend/app/api/` (Clean REST routes)
     - `backend/app/services/` (Isolated business domain logic)
     - `backend/app/rag/` (Modular RAG: loader, chunker, embedder, vector store, generator)
     - `backend/app/models/` (SQLAlchemy 2.0 ORM)
     - `frontend/src/` (React 19 + TypeScript + Tailwind v4)
  2. Show `python backend/tests/test_pipeline.py` running successfully in the terminal.
- **Talking Point**:
  > *"Under the hood, the system is designed with strict separation of concerns. The FastAPI backend isolates business logic from API routes, ChromaDB handles persistent on-disk vector storage, and Groq ensures sub-second LLM inference. All design choices are fully documented in our Architecture Decision Records in docs/DECISIONS.md."*
  > *"Thank you for watching!"*
