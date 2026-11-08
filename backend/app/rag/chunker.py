"""Text chunker with page-awareness and metadata preservation."""

from dataclasses import dataclass
from typing import List, Optional
import uuid
from app.rag.document_loader import DocumentPage


@dataclass
class DocumentChunk:
    """Represents a discrete semantic chunk of text with complete provenance."""
    chunk_id: str
    book_title: str
    author: str
    role_id: str
    page_number: int
    text: str
    token_count: int


class RecursiveTextChunker:
    """
    Recursively splits pages into bounded chunks with overlap,
    respecting paragraph and sentence boundaries.
    """

    def __init__(
        self,
        chunk_size_chars: int = 1800,   # approx 450 tokens
        chunk_overlap_chars: int = 250,  # approx 60 tokens
    ):
        self.chunk_size = chunk_size_chars
        self.chunk_overlap = chunk_overlap_chars
        self.separators = ["\n\n", "\n", ". ", "? ", "! ", " "]

    def _split_text(self, text: str) -> List[str]:
        """Splits text recursively until all pieces are under chunk_size."""
        if len(text) <= self.chunk_size:
            return [text.strip()] if text.strip() else []

        # Find best separator
        split_sep = " "
        for sep in self.separators:
            if sep in text:
                split_sep = sep
                break

        parts = text.split(split_sep)
        chunks: List[str] = []
        current_chunk = []
        current_len = 0

        for part in parts:
            part_len = len(part) + len(split_sep)
            if current_len + part_len > self.chunk_size and current_chunk:
                merged = split_sep.join(current_chunk).strip()
                if merged:
                    chunks.append(merged)

                # Keep overlap pieces from the end of current_chunk
                overlap_chunk = []
                overlap_len = 0
                for prev in reversed(current_chunk):
                    if overlap_len + len(prev) + len(split_sep) <= self.chunk_overlap:
                        overlap_chunk.insert(0, prev)
                        overlap_len += len(prev) + len(split_sep)
                    else:
                        break

                current_chunk = overlap_chunk
                current_len = overlap_len

            current_chunk.append(part)
            current_len += part_len

        if current_chunk:
            merged = split_sep.join(current_chunk).strip()
            if merged:
                chunks.append(merged)

        return chunks

    def chunk_pages(
        self,
        pages: List[DocumentPage],
        book_title: str,
        author: str,
        role_id: str,
    ) -> List[DocumentChunk]:
        """
        Chunks a collection of document pages, keeping provenance metadata intact.
        """
        all_chunks: List[DocumentChunk] = []

        for page in pages:
            if not page.text.strip():
                continue

            split_pieces = self._split_text(page.text)
            for idx, piece in enumerate(split_pieces):
                clean_piece = piece.strip()
                if len(clean_piece) < 50:
                    continue  # Filter out trivial fragments

                chunk_id = f"{role_id[:6]}_{page.page_number:04d}_{idx:02d}_{uuid.uuid4().hex[:6]}"
                est_tokens = max(1, len(clean_piece) // 4)

                all_chunks.append(
                    DocumentChunk(
                        chunk_id=chunk_id,
                        book_title=book_title,
                        author=author,
                        role_id=role_id,
                        page_number=page.page_number,
                        text=clean_piece,
                        token_count=est_tokens,
                    )
                )

        return all_chunks

