"""Knowledge base management and ingestion API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.knowledge import KnowledgeDocument
from app.models.role import Role
from app.rag.vector_store import ChromaVectorStore
from app.schemas.knowledge import KnowledgeStatusResponse, CollectionInfo, DocumentMeta

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


@router.get("/status", response_model=KnowledgeStatusResponse)
def get_knowledge_status(db: Session = Depends(get_db)):
    """Retrieves current vector store collection chunk counts and indexed book metadata."""
    vector_store = ChromaVectorStore.get_instance()
    col_stats = vector_store.get_collection_stats()

    collections_info = []
    for stat in col_stats:
        col_name = stat["name"]
        role = db.query(Role).filter(Role.vector_collection_name == col_name).first()
        role_id = role.id if role else col_name

        docs = db.query(KnowledgeDocument).filter(KnowledgeDocument.role_id == role_id).all()
        doc_metas = [
            DocumentMeta(
                title=d.book_title,
                author=d.author,
                pages=d.total_pages,
                chunks=d.total_chunks,
            )
            for d in docs
        ]

        collections_info.append(
            CollectionInfo(
                name=col_name,
                role_id=role_id,
                total_chunks=stat["total_chunks"],
                documents=doc_metas,
            )
        )

    return KnowledgeStatusResponse(collections=collections_info)

