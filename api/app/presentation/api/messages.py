from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.chat_dtos import SendMessageDTO
from app.application.ports.chat_responder import ChatResponder
from app.application.use_cases.list_chat_messages import ListChatMessagesUseCase
from app.application.use_cases.send_chat_message import SendChatMessageUseCase
from app.domain.entities.user import User
from app.infrastructure.chat.canned_responder import CannedResponder
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.chat_repository import (
    SQLAlchemyChatRepository,
)
from app.infrastructure.database.repositories.idea_case_repository import (
    SQLAlchemyIdeaCaseRepository,
)
from app.presentation.api.deps import get_current_user
from app.presentation.schemas.chat_schemas import (
    ChatMessageListResponseSchema,
    ChatMessageResponseSchema,
    SendMessageResponseSchema,
)

router = APIRouter(prefix="/cases", tags=["Chat"])


def get_chat_responder() -> ChatResponder:
    # Punto de composición del puerto: acá se cambia por N8nResponder cuando
    # exista, sin tocar routers ni casos de uso.
    return CannedResponder()


@router.get("/{case_id}/messages", response_model=ChatMessageListResponseSchema)
async def list_messages(
    case_id: UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChatMessageListResponseSchema:
    use_case = ListChatMessagesUseCase(
        SQLAlchemyChatRepository(db),
        SQLAlchemyIdeaCaseRepository(db),
    )
    result = await use_case.execute(
        case_id, owner_id=current_user.id, limit=limit, offset=offset
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Idea case not found")

    messages, total = result
    return ChatMessageListResponseSchema(
        data=[ChatMessageResponseSchema.model_validate(m) for m in messages],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post(
    "/{case_id}/messages",
    response_model=SendMessageResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    case_id: UUID,
    dto: SendMessageDTO,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    responder: ChatResponder = Depends(get_chat_responder),
) -> SendMessageResponseSchema:
    use_case = SendChatMessageUseCase(
        SQLAlchemyChatRepository(db),
        SQLAlchemyIdeaCaseRepository(db),
        responder,
    )
    result = await use_case.execute(dto, case_id, owner_id=current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Idea case not found")

    user_message, assistant_message = result
    return SendMessageResponseSchema(
        user_message=ChatMessageResponseSchema.model_validate(user_message),
        assistant_message=ChatMessageResponseSchema.model_validate(assistant_message),
    )
