"""Resume upload and parsing API routes."""

from fastapi import APIRouter, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.exceptions import ValidationException
from app.api.deps import get_resume_service
from app.services.resume_service import ResumeService
from app.schemas.resume import ResumeResponse, ResumeTextRequest

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume_pdf(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service),
):
    """
    Uploads and parses a PDF resume, extracting core technical competencies,
    tools, and experience level via LLM analysis.
    """
    if not file.filename.lower().endswith(".pdf"):
        raise ValidationException("Only PDF files are supported for resume upload.")

    contents = await file.read()
    resume = resume_service.process_pdf_resume(
        file_bytes=contents,
        filename=file.filename,
        db=db,
    )
    return resume_service.to_response_dto(resume)


@router.post("/parse-text", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
def parse_resume_text(
    payload: ResumeTextRequest,
    db: Session = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service),
):
    """
    Fallback endpoint allowing candidates to paste plain text or markdown resumes directly.
    """
    resume = resume_service.process_text_resume(
        raw_text=payload.raw_text,
        candidate_name=payload.candidate_name,
        db=db,
    )
    return resume_service.to_response_dto(resume)


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: str,
    db: Session = Depends(get_db),
    resume_service: ResumeService = Depends(get_resume_service),
):
    """Retrieves parsed resume profile by ID."""
    resume = resume_service.get_resume_by_id(resume_id, db)
    return resume_service.to_response_dto(resume)

