from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any, List

class IdeaCaseResponseSchema(BaseModel):
    id: UUID
    owner_id: UUID
    title: str
    description: str
    category: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime
    metadata: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class IdeaCaseListResponseSchema(BaseModel):
    data: List[IdeaCaseResponseSchema]
    total: int
    limit: int
    offset: int
