"""Knowledge base schemas."""

from typing import List, Optional
from pydantic import BaseModel


class DocumentMeta(BaseModel):
    title: str
    author: str
    pages: int
    chunks: int


class CollectionInfo(BaseModel):
    name: str
    role_id: str
    total_chunks: int
    documents: List[DocumentMeta]


class KnowledgeStatusResponse(BaseModel):
    collections: List[CollectionInfo]


class IngestRequest(BaseModel):
    role_id: str
    file_path: Optional[str] = None

