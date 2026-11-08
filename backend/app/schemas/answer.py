"""Interview answer and evaluation schemas."""

from typing import List, Optional
from pydantic import BaseModel, Field


class AnswerSubmitRequest(BaseModel):
    question_id: str
    answer_text: str = Field(..., min_length=1, description="Candidate's answer text")
    time_taken_seconds: int = Field(default=0, ge=0)


class EvaluationDetail(BaseModel):
    score: float = Field(..., ge=0.0, le=10.0)
    conceptual_accuracy: float = Field(..., ge=0.0, le=10.0)
    practical_depth: float = Field(..., ge=0.0, le=10.0)
    feedback: str
    strengths: List[str] = Field(default_factory=list)
    areas_for_improvement: List[str] = Field(default_factory=list)


class AnswerResponse(BaseModel):
    answer_id: str
    question_id: str
    status: str = "EVALUATED"
    evaluation: EvaluationDetail
    next_action: str = Field(default="FETCH_NEXT_QUESTION", description="FETCH_NEXT_QUESTION or COMPLETE_SESSION")

