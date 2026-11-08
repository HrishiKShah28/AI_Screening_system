"""Assessment report schemas."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class QuestionReportItem(BaseModel):
    order: int
    question: str
    topic: str
    candidate_answer: str
    time_taken_seconds: int
    score: float
    feedback: str
    grounded_source: Dict[str, Any]


class CompetencyBreakdown(BaseModel):
    conceptual_accuracy: float = 0.0
    applied_engineering: float = 0.0
    depth_of_knowledge: float = 0.0
    communication_clarity: float = 0.0


class AssessmentReportResponse(BaseModel):
    session_id: str
    candidate_name: Optional[str] = "Candidate"
    role_id: str
    role_title: str
    overall_score: float = Field(..., ge=0.0, le=10.0)
    recommendation: str  # STRONG_HIRE, HIRE, LEANING_NO, NO_HIRE
    executive_summary: str
    competency_breakdown: CompetencyBreakdown
    strengths: List[str]
    areas_for_improvement: List[str]
    questions_summary: List[QuestionReportItem]

