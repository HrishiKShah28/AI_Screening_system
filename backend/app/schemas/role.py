"""Role schemas."""

from typing import List
from pydantic import BaseModel, ConfigDict


class RoleBase(BaseModel):
    id: str
    title: str
    description: str
    primary_topics: List[str]
    knowledge_sources: List[str] = []

    model_config = ConfigDict(from_attributes=True)


class RoleListResponse(BaseModel):
    roles: List[RoleBase]

