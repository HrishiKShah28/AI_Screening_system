# REST API Contracts Specification

## Project: AI-Powered Role-Based Candidate Screening System

All API endpoints follow RESTful standards, return JSON responses, and use HTTP status codes consistently.

Base URL: `http://localhost:8000/api`

---

## 1. System & Roles API

### 1.1 Health Check
**Endpoint**: `GET /health`  
**Description**: Verifies backend, database connection, vector store availability, and LLM gateway status.

**Response `200 OK`**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "components": {
    "database": "connected",
    "vector_store": "ready",
    "embedding_model": "loaded",
    "llm_gateway": "configured"
  },
  "timestamp": "2026-11-08T22:40:00Z"
}
```

---

### 1.2 Get Available Roles
**Endpoint**: `GET /roles`  
**Description**: Returns supported technical roles along with their core competency domains and associated textbook knowledge bases.

**Response `200 OK`**:
```json
{
  "roles": [
    {
      "id": "ai_ml_engineer",
      "title": "AI / Machine Learning Engineer",
      "description": "Evaluates foundational ML algorithms, neural architectures, training dynamics, loss optimization, and feature engineering.",
      "primary_topics": [
        "Supervised & Unsupervised Learning",
        "Gradient Descent & Backpropagation",
        "Overfitting & Regularization",
        "Evaluation Metrics (ROC, AUC, F1, Log-Loss)",
        "Decision Trees & Ensemble Methods"
      ],
      "knowledge_sources": [
        "Machine Learning — Tom Mitchell",
        "The Hundred-Page Machine Learning Book — Andriy Burkov",
        "Machine Learning for Absolute Beginners"
      ]
    },
    {
      "id": "data_science_applied_ml",
      "title": "Data Science / Applied ML Engineer",
      "description": "Focuses on applied machine learning pipelines, scikit-learn implementations, data preprocessing, and algorithm selection.",
      "primary_topics": [
        "Feature Preprocessing & Scaling",
        "Cross-Validation & Hyperparameter Tuning",
        "Scikit-Learn Model Selection",
        "Practical ML Algorithms (SVM, Random Forests, XGBoost)",
        "Error Analysis & Diagnostic Strategies"
      ],
      "knowledge_sources": [
        "Introduction to Machine Learning with Python — Andreas Müller & Sarah Guido",
        "Master Machine Learning Algorithms — Jason Brownlee"
      ]
    },
    {
      "id": "backend_engineer",
      "title": "Backend Systems Engineer",
      "description": "Focuses on API design, database schemas, distributed systems, concurrency, and caching architectures.",
      "primary_topics": [
        "REST & GraphQL Architecture",
        "Relational & NoSQL Database Indexing",
        "Caching Strategies & Invalidation",
        "Concurrency & Async Programming",
        "API Security & Rate Limiting"
      ],
      "knowledge_sources": [
        "Designing Data-Intensive Applications — Martin Kleppmann"
      ]
    }
  ]
}
```

---

## 2. Resume Processing API

### 2.1 Upload and Parse Resume (PDF)
**Endpoint**: `POST /resumes/upload`  
**Content-Type**: `multipart/form-data`  
**Description**: Accepts a PDF file, extracts text via PyMuPDF, performs structured NER via the LLM to extract candidate skills, tools, and domains, and creates a resume record.

**Request**:
- `file`: Binary file (`application/pdf`, max 10MB)

**Response `201 Created`**:
```json
{
  "id": "res_8f39b1a0",
  "filename": "john_doe_resume.pdf",
  "candidate_name": "John Doe",
  "contact": {
    "email": "john.doe@example.com",
    "github": "github.com/johndoe",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "extracted_data": {
    "summary": "AI/ML Engineer with 2 years experience building computer vision and PyTorch training pipelines.",
    "skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "SQL", "Docker"],
    "technologies": ["FastAPI", "Pandas", "NumPy", "PostgreSQL", "ChromaDB"],
    "domain_exposure": ["Computer Vision", "Deep Learning", "Data Pipelines"],
    "experience_level": "Junior to Mid-Level"
  },
  "created_at": "2026-11-08T22:42:00Z"
}
```

**Error `400 Bad Request`**:
```json
{
  "detail": "Invalid file format. Only PDF files are supported."
}
```

---

### 2.2 Parse Resume (Raw Text Fallback)
**Endpoint**: `POST /resumes/parse-text`  
**Content-Type**: `application/json`  
**Description**: Fallback endpoint allowing candidates to paste plain text or markdown resumes directly.

**Request Body**:
```json
{
  "candidate_name": "John Doe",
  "raw_text": "Experienced Machine Learning engineer with deep expertise in gradient boosting, feature pipelines, and PyTorch..."
}
```

**Response `201 Created`**: (Identical schema to `POST /resumes/upload`)

---

## 3. Interview Lifecycle API

### 3.1 Initialize Interview Session
**Endpoint**: `POST /interviews/sessions`  
**Content-Type**: `application/json`  
**Description**: Creates a new structured interview session linking the candidate resume and target role.

**Request Body**:
```json
{
  "resume_id": "res_8f39b1a0",
  "role_id": "ai_ml_engineer",
  "total_questions": 5
}
```

**Response `201 Created`**:
```json
{
  "session_id": "sess_417e29cb",
  "candidate_id": "res_8f39b1a0",
  "role_id": "ai_ml_engineer",
  "role_title": "AI / Machine Learning Engineer",
  "status": "INITIALIZED",
  "total_questions": 5,
  "current_question_index": 0,
  "created_at": "2026-11-08T22:45:00Z"
}
```

---

### 3.2 Get Session Status
**Endpoint**: `GET /interviews/sessions/{session_id}`  
**Description**: Retrieves current state of the interview session, including completed questions and remaining counts.

**Response `200 OK`**:
```json
{
  "session_id": "sess_417e29cb",
  "status": "IN_PROGRESS",
  "total_questions": 5,
  "current_question_index": 2,
  "questions_completed": 1,
  "started_at": "2026-11-08T22:45:10Z"
}
```

---

### 3.3 Generate / Fetch Next Question
**Endpoint**: `POST /interviews/sessions/{session_id}/questions/next`  
**Description**: Dynamically constructs a targeted RAG query using resume competencies and previous answers, queries ChromaDB for textbook context, and uses the LLM to generate the next grounded question.

**Response `200 OK`**:
```json
{
  "question_id": "q_7a2f1c84",
  "session_id": "sess_417e29cb",
  "question_index": 1,
  "total_questions": 5,
  "question_text": "In your resume, you highlighted experience optimizing training pipelines in PyTorch. In gradient descent optimization, what is the theoretical distinction between Batch Gradient Descent, Stochastic Gradient Descent (SGD), and Mini-batch SGD regarding convergence behavior and variance of gradient updates?",
  "topic": "Optimization & Gradient Descent",
  "difficulty": "intermediate",
  "target_competency": "Theoretical understanding of loss surface optimization",
  "source_traceability": {
    "book_title": "The Hundred-Page Machine Learning Book",
    "author": "Andriy Burkov",
    "chapter": "Chapter 3: Fundamental Algorithms",
    "page_number": 38,
    "chunk_id": "burkov_ch3_p38_chunk2",
    "similarity_score": 0.84
  }
}
```

**Response `200 OK (Completed)`**:
```json
{
  "status": "ALL_QUESTIONS_COMPLETED",
  "message": "All 5 questions have been completed. Please submit session to generate final evaluation."
}
```

---

### 3.4 Submit Candidate Answer
**Endpoint**: `POST /interviews/sessions/{session_id}/answers`  
**Content-Type**: `application/json`  
**Description**: Submits the candidate's response to the active question. Evaluates the response against the grounded context chunk and persists the score.

**Request Body**:
```json
{
  "question_id": "q_7a2f1c84",
  "answer_text": "Batch gradient descent calculates the gradient over the entire dataset before making an update, leading to smooth convergence but high computational cost per step. SGD updates weights after each single sample, which introduces high variance and oscillates heavily, but can escape local minima. Mini-batch strikes a balance by taking small batches (e.g., 32 or 64 samples), leveraging vectorized GPU compute while maintaining stable gradient estimates.",
  "time_taken_seconds": 94
}
```

**Response `200 OK`**:
```json
{
  "answer_id": "ans_93b8e11a",
  "question_id": "q_7a2f1c84",
  "status": "EVALUATED",
  "evaluation": {
    "score": 9.0,
    "conceptual_accuracy": 9.5,
    "practical_depth": 8.5,
    "strengths": [
      "Accurately articulated trade-offs between sample variance and computational cost",
      "Mentioned GPU vectorization benefits of mini-batch sizes"
    ],
    "areas_for_improvement": [
      "Could have mentioned learning rate scheduling considerations in noisy SGD regimes"
    ],
    "feedback": "Strong, precise explanation capturing both theoretical nuances and practical engineering trade-offs."
  },
  "next_action": "FETCH_NEXT_QUESTION"
}
```

---

### 3.5 Complete Interview & Generate Report
**Endpoint**: `POST /interviews/sessions/{session_id}/complete`  
**Description**: Closes the session, aggregates all evaluated answers, triggers LLM synthesis for executive summary, and generates the final screening report.

**Response `200 OK`**:
```json
{
  "session_id": "sess_417e29cb",
  "status": "COMPLETED",
  "completed_at": "2026-11-08T23:05:00Z",
  "report_url": "/api/interviews/sessions/sess_417e29cb/report"
}
```

---

### 3.6 Get Assessment Report
**Endpoint**: `GET /interviews/sessions/{session_id}/report`  
**Description**: Returns full structured assessment report, including overall score, radar chart competency metrics, question-level breakdowns with source citations, and hiring recommendations.

**Response `200 OK`**:
```json
{
  "session_id": "sess_417e29cb",
  "candidate_name": "John Doe",
  "role_title": "AI / Machine Learning Engineer",
  "overall_score": 8.6,
  "recommendation": "STRONG_HIRE",
  "executive_summary": "Candidate demonstrated solid command over foundational machine learning principles, particularly loss optimization, gradient backpropagation, and regularization techniques.",
  "competency_breakdown": {
    "conceptual_accuracy": 8.8,
    "applied_engineering": 8.4,
    "depth_of_knowledge": 8.5,
    "communication_clarity": 8.7
  },
  "strengths": [
    "Clear understanding of SGD vs Mini-batch gradient convergence",
    "Detailed intuition on bias-variance trade-offs in ensemble models"
  ],
  "areas_for_improvement": [
    "Deepen mathematical rigor around kernel methods and margin bounds"
  ],
  "questions_summary": [
    {
      "order": 1,
      "question": "In gradient descent optimization...",
      "candidate_answer": "Batch gradient descent calculates...",
      "score": 9.0,
      "grounded_source": {
        "book": "The Hundred-Page Machine Learning Book",
        "author": "Andriy Burkov",
        "page": 38
      }
    }
  ]
}
```

---

## 4. Knowledge Base Management API

### 4.1 Get Ingestion Status
**Endpoint**: `GET /knowledge/status`  
**Description**: Lists indexed books, chunk counts, and collection partitions in ChromaDB.

**Response `200 OK`**:
```json
{
  "collections": [
    {
      "name": "ai_ml_corpus",
      "total_chunks": 1420,
      "documents": [
        {
          "title": "The Hundred-Page Machine Learning Book",
          "author": "Andriy Burkov",
          "pages": 160,
          "chunks": 480
        },
        {
          "title": "Machine Learning",
          "author": "Tom Mitchell",
          "pages": 432,
          "chunks": 940
        }
      ]
    },
    {
      "name": "data_science_corpus",
      "total_chunks": 1150,
      "documents": [
        {
          "title": "Introduction to Machine Learning with Python",
          "author": "Andreas Müller & Sarah Guido",
          "pages": 390,
          "chunks": 1150
        }
      ]
    }
  ]
}
```

### 4.2 Ingest Document / Book
**Endpoint**: `POST /knowledge/ingest`  
**Description**: Triggers background ingestion of a textbook PDF into ChromaDB.

