"""InterviewQuestion SQLAlchemy model."""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_question_id() -> str:
    return f"q_{uuid.uuid4().hex[:8]}"


class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(String(36), primary_key=True, default=generate_question_id)
    session_id = Column(String(36), ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    question_order = Column(Integer, nullable=False)
    question_text = Column(Text, nullable=False)
    topic = Column(String(128), nullable=False)
    difficulty = Column(String(32), nullable=False, default="intermediate")  # beginner, intermediate, advanced
    target_competency = Column(Text, nullable=True)
    source_traceability = Column(JSON, nullable=False, default=dict)  # book_title, author, chapter, page, chunk_id, etc.
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<InterviewQuestion id={self.id} order={self.question_order} topic={self.topic}>"

