from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID

class CreateIdeaCaseDTO(BaseModel):
    owner_id: UUID
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
