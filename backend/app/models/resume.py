"""Resume SQLAlchemy model."""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_resume_id() -> str:
    return f"res_{uuid.uuid4().hex[:8]}"


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(String(36), primary_key=True, default=generate_resume_id)
    candidate_name = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    filename = Column(String(255), nullable=False)
    raw_text = Column(Text, nullable=False)
    extracted_skills = Column(JSON, nullable=False, default=list)
    extracted_tech = Column(JSON, nullable=False, default=list)
    domain_exposure = Column(JSON, nullable=False, default=list)
    experience_level = Column(String(50), nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    sessions = relationship("InterviewSession", back_populates="resume", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Resume id={self.id} candidate={self.candidate_name}>"

