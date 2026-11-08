"""FastAPI dependency injection providers."""

from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.role_service import RoleService
from app.services.resume_service import ResumeService
from app.services.interview_service import InterviewService
from app.services.evaluation_service import EvaluationService


def get_role_service() -> RoleService:
    return RoleService()


def get_resume_service() -> ResumeService:
    return ResumeService()


def get_interview_service() -> InterviewService:
    return InterviewService()


def get_evaluation_service() -> EvaluationService:
    return EvaluationService()

