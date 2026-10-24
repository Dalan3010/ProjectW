from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, Dict, Any, List


class ChatMessageResponseSchema(BaseModel):
    id: UUID
    case_id: UUID
    role: str
    content: str
    metadata: Optional[Dict[str, Any]]
    created_at: datetime

    class Config:
        from_attributes = True


class ChatMessageListResponseSchema(BaseModel):
    data: List[ChatMessageResponseSchema]
    total: int
    limit: int
    offset: int


class SendMessageResponseSchema(BaseModel):
    user_message: ChatMessageResponseSchema
    assistant_message: ChatMessageResponseSchema
