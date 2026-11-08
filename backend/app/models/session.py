"""InterviewSession SQLAlchemy model."""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_session_id() -> str:
    return f"sess_{uuid.uuid4().hex[:8]}"


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(String(36), primary_key=True, default=generate_session_id)
    resume_id = Column(String(36), ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id = Column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    status = Column(String(32), nullable=False, default="INITIALIZED")  # INITIALIZED, IN_PROGRESS, COMPLETED, ABANDONED
    total_questions = Column(Integer, nullable=False, default=5)
    current_question_index = Column(Integer, nullable=False, default=0)
    overall_score = Column(Float, nullable=True)
    recommendation = Column(String(32), nullable=True)  # STRONG_HIRE, HIRE, LEANING_NO, NO_HIRE
    executive_summary = Column(Text, nullable=True)
    competency_breakdown = Column(JSON, nullable=True)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="sessions")
    role = relationship("Role", back_populates="sessions")
    questions = relationship(
        "InterviewQuestion",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewQuestion.question_order",
    )

    def __repr__(self) -> str:
        return f"<InterviewSession id={self.id} role={self.role_id} status={self.status}>"

