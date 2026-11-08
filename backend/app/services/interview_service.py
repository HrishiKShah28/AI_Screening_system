"""Interview orchestration service managing session lifecycle, adaptive questioning, and persistence."""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.config import settings
from app.core.exceptions import (
    EntityNotFoundException,
    SessionStateConflictException,
    ValidationException,
)
from app.models.session import InterviewSession
from app.models.question import InterviewQuestion
from app.models.answer import InterviewAnswer
from app.models.role import Role
from app.models.resume import Resume
from app.rag.vector_store import ChromaVectorStore
from app.rag.embedder import SentenceTransformerEmbedder
from app.rag.query_constructor import QueryConstructor
from app.rag.question_generator import QuestionGenerator
from app.services.evaluation_service import EvaluationService
from app.schemas.question import (
    QuestionResponse,
    SourceTraceability,
    NextQuestionResult,
)
from app.schemas.answer import AnswerResponse, EvaluationDetail
from app.schemas.interview import SessionResponse, SessionCompleteResponse


class InterviewService:
    """Orchestrates candidate interview sessions, adaptive questioning, and evaluations."""

    def __init__(
        self,
        vector_store: Optional[ChromaVectorStore] = None,
        embedder: Optional[SentenceTransformerEmbedder] = None,
        question_generator: Optional[QuestionGenerator] = None,
        eval_service: Optional[EvaluationService] = None,
    ):
        self.vector_store = vector_store or ChromaVectorStore.get_instance()
        self.embedder = embedder or SentenceTransformerEmbedder.get_instance()
        self.question_generator = question_generator or QuestionGenerator()
        self.eval_service = eval_service or EvaluationService()

    def create_session(
        self,
        resume_id: str,
        role_id: str,
        total_questions: int,
        db: Session,
    ) -> InterviewSession:
        """Initializes a new interview session."""
        resume = db.query(Resume).filter(Resume.id == resume_id).first()
        if not resume:
            raise EntityNotFoundException("Resume", resume_id)

        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise EntityNotFoundException("Role", role_id)

        session = InterviewSession(
            resume_id=resume.id,
            role_id=role.id,
            total_questions=total_questions or settings.DEFAULT_TOTAL_QUESTIONS,
            status="INITIALIZED",
            current_question_index=0,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def get_session(self, session_id: str, db: Session) -> InterviewSession:
        """Retrieves session or raises EntityNotFoundException."""
        session = db.query(InterviewSession).filter(InterviewSession.id == session_id).first()
        if not session:
            raise EntityNotFoundException("InterviewSession", session_id)
        return session

    def get_next_question(self, session_id: str, db: Session) -> NextQuestionResult:
        """
        Dynamically generates and returns the next adaptive grounded interview question.
        """
        session = self.get_session(session_id, db)

        if session.status == "COMPLETED":
            return NextQuestionResult(
                status="ALL_QUESTIONS_COMPLETED",
                message="This interview session has already been completed.",
            )

        # Check if there is an existing unanswered question
        for q in session.questions:
            if not q.answer:
                return NextQuestionResult(
                    status="QUESTION_GENERATED",
                    question=self._to_question_dto(q, session.total_questions),
                )

        # Check if all questions are finished
        if len(session.questions) >= session.total_questions:
            return NextQuestionResult(
                status="ALL_QUESTIONS_COMPLETED",
                message="All interview questions have been answered. You may now generate your final report.",
            )

        # Update session status to IN_PROGRESS and mark started_at
        if session.status == "INITIALIZED":
            session.status = "IN_PROGRESS"
            session.started_at = datetime.utcnow()

        next_index = len(session.questions) + 1

        # Adaptive difficulty calculation based on previous answer
        difficulty = "intermediate"
        if session.questions and session.questions[-1].answer:
            last_score = session.questions[-1].answer.evaluation_score
            if last_score >= 8.5:
                difficulty = "advanced"
            elif last_score < 6.0:
                difficulty = "beginner"

        # 1. Synthesize targeted semantic query
        query_text = QueryConstructor.construct_query(
            role=session.role,
            resume=session.resume,
            previous_questions=session.questions,
            difficulty=difficulty,
        )

        # 2. Retrieve relevant textbook passage from ChromaDB
        collection_name = session.role.vector_collection_name
        query_vec = self.embedder.embed_query(query_text)
        retrieved_chunks = self.vector_store.query_similar(
            collection_name=collection_name,
            query_embedding=query_vec,
            top_k=settings.RAG_TOP_K_CHUNKS,
            threshold=0.45,
        )

        if retrieved_chunks:
            primary_chunk = retrieved_chunks[0]
        else:
            # Fallback curated context if vector store query returned no threshold matches
            primary_chunk = {
                "book_title": f"{session.role.title} Reference Guide",
                "author": "Technical Review Board",
                "page_number": 1,
                "chunk_id": "fallback_core_01",
                "similarity_score": 0.50,
                "text": f"Foundational competencies and architectural principles governing {session.role.title}, including core data structures, algorithms, scaling trade-offs, and design methodologies.",
            }

        # 3. Generate grounded question via LLM
        q_data = self.question_generator.generate_question(
            retrieved_chunk=primary_chunk,
            role=session.role,
            resume=session.resume,
            difficulty=difficulty,
            question_order=next_index,
        )

        # 4. Save question to database
        new_question = InterviewQuestion(
            session_id=session.id,
            question_order=next_index,
            question_text=q_data["question_text"],
            topic=q_data.get("topic", session.role.title),
            difficulty=difficulty,
            target_competency=q_data.get("target_competency", "Technical Evaluation"),
            source_traceability=q_data.get("source_traceability", {}),
        )
        db.add(new_question)
        session.current_question_index = next_index
        db.commit()
        db.refresh(new_question)

        return NextQuestionResult(
            status="QUESTION_GENERATED",
            question=self._to_question_dto(new_question, session.total_questions),
        )

    def submit_answer(
        self,
        session_id: str,
        question_id: str,
        answer_text: str,
        time_taken_seconds: int,
        db: Session,
    ) -> AnswerResponse:
        """Evaluates candidate response and stores answer record."""
        session = self.get_session(session_id, db)
        question = db.query(InterviewQuestion).filter(
            InterviewQuestion.id == question_id,
            InterviewQuestion.session_id == session_id,
        ).first()

        if not question:
            raise EntityNotFoundException("InterviewQuestion", question_id)

        if question.answer:
            raise SessionStateConflictException(
                session_id=session_id,
                current_state="QUESTION_ALREADY_ANSWERED",
                attempted_action="submit_answer",
            )

        # Evaluate against textbook ground-truth context
        evaluation = self.eval_service.evaluate_answer(
            question=question,
            answer_text=answer_text,
        )

        # Persist answer record
        answer = InterviewAnswer(
            question_id=question.id,
            answer_text=answer_text,
            time_taken_seconds=time_taken_seconds,
            evaluation_score=evaluation.score,
            conceptual_accuracy=evaluation.conceptual_accuracy,
            practical_depth=evaluation.practical_depth,
            feedback=evaluation.feedback,
            strengths=evaluation.strengths,
            areas_for_improvement=evaluation.areas_for_improvement,
        )
        db.add(answer)
        db.commit()
        db.refresh(answer)

        # Check if more questions remain
        has_more = len(session.questions) < session.total_questions
        next_action = "FETCH_NEXT_QUESTION" if has_more else "COMPLETE_SESSION"

        return AnswerResponse(
            answer_id=answer.id,
            question_id=question.id,
            status="EVALUATED",
            evaluation=evaluation,
            next_action=next_action,
        )

    def complete_session(self, session_id: str, db: Session) -> SessionCompleteResponse:
        """Closes session and generates final assessment report."""
        session = self.get_session(session_id, db)
        session.status = "COMPLETED"
        session.completed_at = datetime.utcnow()
        db.commit()

        # Generate report
        self.eval_service.generate_final_report(session, db)

        return SessionCompleteResponse(
            session_id=session.id,
            status="COMPLETED",
            completed_at=session.completed_at,
            report_url=f"/api/interviews/sessions/{session.id}/report",
        )

    @staticmethod
    def _to_question_dto(question: InterviewQuestion, total_questions: int) -> QuestionResponse:
        meta = question.source_traceability or {}
        return QuestionResponse(
            question_id=question.id,
            session_id=question.session_id,
            question_index=question.question_order,
            total_questions=total_questions,
            question_text=question.question_text,
            topic=question.topic,
            difficulty=question.difficulty,
            target_competency=question.target_competency,
            source_traceability=SourceTraceability(
                book_title=meta.get("book_title", "Technical Reference"),
                author=meta.get("author"),
                chapter=meta.get("chapter"),
                page_number=meta.get("page_number"),
                chunk_id=meta.get("chunk_id"),
                similarity_score=meta.get("similarity_score"),
                excerpt=meta.get("excerpt"),
            ),
        )

