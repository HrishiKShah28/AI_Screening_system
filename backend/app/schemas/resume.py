"""Resume schemas."""

from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ExtractedData(BaseModel):
    summary: Optional[str] = None
    skills: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    domain_exposure: List[str] = Field(default_factory=list)
    experience_level: Optional[str] = None


class ResumeTextRequest(BaseModel):
    candidate_name: Optional[str] = None
    raw_text: str = Field(..., min_length=20, description="Raw text of the resume")


class ResumeResponse(BaseModel):
    id: str
    filename: str
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    extracted_data: ExtractedData
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

