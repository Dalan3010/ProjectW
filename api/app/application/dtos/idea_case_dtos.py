from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class CreateIdeaCaseDTO(BaseModel):
    # El owner proviene del token JWT, no del body de la petición.
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    category: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class UpdateIdeaCaseDTO(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    category: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
