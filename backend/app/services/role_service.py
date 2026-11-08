"""Role service for retrieving competency taxonomies."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.role import Role
from app.core.exceptions import EntityNotFoundException


class RoleService:
    """Manages role retrieval and competency taxonomies."""

    @staticmethod
    def get_all_roles(db: Session) -> List[Role]:
        """Retrieves all registered roles."""
        return db.query(Role).all()

    @staticmethod
    def get_role_by_id(db: Session, role_id: str) -> Role:
        """Retrieves role by ID or raises EntityNotFoundException."""
        role = db.query(Role).filter(Role.id == role_id).first()
        if not role:
            raise EntityNotFoundException("Role", role_id)
        return role

