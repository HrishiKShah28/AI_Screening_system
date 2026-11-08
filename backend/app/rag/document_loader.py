"""Document loader for PDFs using PyMuPDF (fitz)."""

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional
import re
import fitz  # PyMuPDF


@dataclass
class DocumentPage:
    """Represents a single extracted page from a document."""
    page_number: int
    text: str
    char_count: int
    estimated_tokens: int


class DocumentLoader:
    """Handles extracting and cleaning text from PDF documents."""

    @staticmethod
    def clean_text(text: str) -> str:
        """Normalizes whitespace and removes page artifact noise."""
        if not text:
            return ""
        # Replace multiple horizontal spaces with single space
        text = re.sub(r"[ \t]+", " ", text)
        # Normalize newlines (max 2 consecutive newlines)
        text = re.sub(r"\n\s*\n+", "\n\n", text)
        # Strip trailing/leading spaces on lines
        lines = [line.strip() for line in text.split("\n")]
        return "\n".join(lines).strip()

    @classmethod
    def load_pdf(cls, file_path: str, min_chars_per_page: int = 40) -> List[DocumentPage]:
        """
        Loads a PDF file and returns a list of DocumentPage objects.
        Filters out blank or near-empty pages (e.g. cover/blank divider pages).
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"PDF file not found at: {file_path}")

        doc = fitz.open(str(path))
        pages: List[DocumentPage] = []

        try:
            for page_idx in range(len(doc)):
                page = doc[page_idx]
                raw_text = page.get_text("text")
                cleaned = cls.clean_text(raw_text)

                if len(cleaned) < min_chars_per_page:
                    continue  # Skip blank or trivial pages

                # Approx 4 chars per token rule of thumb
                est_tokens = max(1, len(cleaned) // 4)

                pages.append(
                    DocumentPage(
                        page_number=page_idx + 1,  # 1-indexed
                        text=cleaned,
                        char_count=len(cleaned),
                        estimated_tokens=est_tokens,
                    )
                )
        finally:
            doc.close()

        return pages

    @classmethod
    def extract_text_from_bytes(cls, file_bytes: bytes) -> str:
        """Extracts complete text content from raw PDF bytes (e.g. uploaded resume)."""
        doc = fitz.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        try:
            for page in doc:
                text_parts.append(page.get_text("text"))
        finally:
            doc.close()
        return cls.clean_text("\n\n".join(text_parts))

