"""Role catalog SQLAlchemy model."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(String(64), primary_key=True)  # e.g. "ai_ml_engineer"
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    primary_topics = Column(JSON, nullable=False, default=list)
    vector_collection_name = Column(String(128), nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    sessions = relationship("InterviewSession", back_populates="role")
    knowledge_documents = relationship("KnowledgeDocument", back_populates="role")

    def __repr__(self) -> str:
        return f"<Role id={self.id} title={self.title}>"

