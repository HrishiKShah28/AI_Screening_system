"""Interview question schemas."""

from datetime import datetime
from typing import Any, Dict, Optional
from pydantic import BaseModel, ConfigDict, Field


class SourceTraceability(BaseModel):
    book_title: str
    author: Optional[str] = None
    chapter: Optional[str] = None
    page_number: Optional[int] = None
    chunk_id: Optional[str] = None
    similarity_score: Optional[float] = None
    excerpt: Optional[str] = None


class QuestionResponse(BaseModel):
    question_id: str
    session_id: str
    question_index: int
    total_questions: int
    question_text: str
    topic: str
    difficulty: str
    target_competency: Optional[str] = None
    source_traceability: SourceTraceability

    model_config = ConfigDict(from_attributes=True)


class NextQuestionResult(BaseModel):
    status: str = Field(..., description="'QUESTION_GENERATED' or 'ALL_QUESTIONS_COMPLETED'")
    question: Optional[QuestionResponse] = None
    message: Optional[str] = None

