"""Interview session schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class SessionCreateRequest(BaseModel):
    resume_id: str
    role_id: str
    total_questions: Optional[int] = Field(default=5, ge=1, le=15)


class SessionResponse(BaseModel):
    session_id: str
    candidate_id: str
    role_id: str
    role_title: str
    status: str
    total_questions: int
    current_question_index: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SessionStatusResponse(BaseModel):
    session_id: str
    status: str
    total_questions: int
    current_question_index: int
    questions_completed: int
    started_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SessionCompleteResponse(BaseModel):
    session_id: str
    status: str
    completed_at: datetime
    report_url: str

