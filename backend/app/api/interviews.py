"""Interview session lifecycle and interaction API routes."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_interview_service, get_evaluation_service
from app.services.interview_service import InterviewService
from app.services.evaluation_service import EvaluationService
from app.schemas.interview import (
    SessionCreateRequest,
    SessionResponse,
    SessionStatusResponse,
    SessionCompleteResponse,
)
from app.schemas.question import NextQuestionResult
from app.schemas.answer import AnswerSubmitRequest, AnswerResponse
from app.schemas.report import AssessmentReportResponse

router = APIRouter(prefix="/interviews", tags=["Interviews"])


@router.post("/sessions", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreateRequest,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
):
    """Initializes a new interview session linking candidate resume and target role."""
    session = interview_service.create_session(
        resume_id=payload.resume_id,
        role_id=payload.role_id,
        total_questions=payload.total_questions or 5,
        db=db,
    )
    return SessionResponse(
        session_id=session.id,
        candidate_id=session.resume_id,
        role_id=session.role_id,
        role_title=session.role.title if session.role else session.role_id,
        status=session.status,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        created_at=session.created_at,
    )


@router.get("/sessions/{session_id}", response_model=SessionStatusResponse)
def get_session_status(
    session_id: str,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
):
    """Retrieves session state, active question index, and completion count."""
    session = interview_service.get_session(session_id, db)
    completed_count = sum(1 for q in session.questions if q.answer is not None)
    return SessionStatusResponse(
        session_id=session.id,
        status=session.status,
        total_questions=session.total_questions,
        current_question_index=session.current_question_index,
        questions_completed=completed_count,
        started_at=session.started_at,
    )


@router.post("/sessions/{session_id}/questions/next", response_model=NextQuestionResult)
def get_next_question(
    session_id: str,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
):
    """
    Dynamically generates the next adaptive interview question grounded in textbook corpus.
    """
    return interview_service.get_next_question(session_id, db)


@router.post("/sessions/{session_id}/answers", response_model=AnswerResponse)
def submit_answer(
    session_id: str,
    payload: AnswerSubmitRequest,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
):
    """
    Submits candidate answer, grades response against textbook reference, and persists evaluation.
    """
    return interview_service.submit_answer(
        session_id=session_id,
        question_id=payload.question_id,
        answer_text=payload.answer_text,
        time_taken_seconds=payload.time_taken_seconds,
        db=db,
    )


@router.post("/sessions/{session_id}/complete", response_model=SessionCompleteResponse)
def complete_interview(
    session_id: str,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
):
    """Concludes session and generates final assessment report."""
    return interview_service.complete_session(session_id, db)


@router.get("/sessions/{session_id}/report", response_model=AssessmentReportResponse)
def get_assessment_report(
    session_id: str,
    db: Session = Depends(get_db),
    interview_service: InterviewService = Depends(get_interview_service),
    eval_service: EvaluationService = Depends(get_evaluation_service),
):
    """Retrieves complete candidate screening evaluation report with radar metrics and feedback."""
    session = interview_service.get_session(session_id, db)
    return eval_service.generate_final_report(session, db)

