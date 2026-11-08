"""InterviewAnswer SQLAlchemy model."""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_answer_id() -> str:
    return f"ans_{uuid.uuid4().hex[:8]}"


class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(String(36), primary_key=True, default=generate_answer_id)
    question_id = Column(
        String(36),
        ForeignKey("interview_questions.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    answer_text = Column(Text, nullable=False)
    time_taken_seconds = Column(Integer, nullable=False, default=0)
    evaluation_score = Column(Float, nullable=False, default=0.0)
    conceptual_accuracy = Column(Float, nullable=False, default=0.0)
    practical_depth = Column(Float, nullable=False, default=0.0)
    feedback = Column(Text, nullable=False, default="")
    strengths = Column(JSON, nullable=False, default=list)
    areas_for_improvement = Column(JSON, nullable=False, default=list)
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    question = relationship("InterviewQuestion", back_populates="answer")

    def __repr__(self) -> str:
        return f"<InterviewAnswer id={self.id} score={self.evaluation_score}>"

