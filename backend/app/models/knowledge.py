"""Knowledge document metadata SQLAlchemy model."""

from datetime import datetime
import uuid
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_doc_id() -> str:
    return f"doc_{uuid.uuid4().hex[:8]}"


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id = Column(String(36), primary_key=True, default=generate_doc_id)
    role_id = Column(String(64), ForeignKey("roles.id"), nullable=False, index=True)
    book_title = Column(String(255), nullable=False)
    author = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_hash = Column(String(64), nullable=False)  # SHA-256 for change detection
    total_pages = Column(Integer, nullable=False, default=0)
    total_chunks = Column(Integer, nullable=False, default=0)
    ingested_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    role = relationship("Role", back_populates="knowledge_documents")

    def __repr__(self) -> str:
        return f"<KnowledgeDocument id={self.id} title={self.book_title} chunks={self.total_chunks}>"

