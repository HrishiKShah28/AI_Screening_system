"""Role API routes."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_role_service
from app.services.role_service import RoleService
from app.schemas.role import RoleListResponse, RoleBase

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=RoleListResponse)
def get_roles(
    db: Session = Depends(get_db),
    role_service: RoleService = Depends(get_role_service),
):
    """Retrieves all available roles with evaluated competency topics."""
    roles = role_service.get_all_roles(db)
    return RoleListResponse(
        roles=[
            RoleBase(
                id=r.id,
                title=r.title,
                description=r.description,
                primary_topics=r.primary_topics or [],
            )
            for r in roles
        ]
    )


@router.get("/{role_id}", response_model=RoleBase)
def get_role_detail(
    role_id: str,
    db: Session = Depends(get_db),
    role_service: RoleService = Depends(get_role_service),
):
    """Retrieves specific role details."""
    r = role_service.get_role_by_id(db, role_id)
    return RoleBase(
        id=r.id,
        title=r.title,
        description=r.description,
        primary_topics=r.primary_topics or [],
    )

