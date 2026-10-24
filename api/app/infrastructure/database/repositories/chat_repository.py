from typing import List, Tuple
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.chat_message import ChatMessage
from app.domain.repositories.chat_repository import ChatRepository
from app.infrastructure.database.models import ChatMessageORM


class SQLAlchemyChatRepository(ChatRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _to_entity(orm_message: ChatMessageORM) -> ChatMessage:
        # Mapeo canónico: columna ORM metadata_json <-> campo de entidad metadata.
        return ChatMessage(
            id=orm_message.id,
            case_id=orm_message.case_id,
            role=orm_message.role,
            content=orm_message.content,
            metadata=orm_message.metadata_json or {},
            created_at=orm_message.created_at,
        )

    async def add(self, message: ChatMessage) -> ChatMessage:
        orm_message = ChatMessageORM(
            id=message.id,
            case_id=message.case_id,
            role=message.role,
            content=message.content,
            metadata_json=message.metadata,
            created_at=message.created_at,
        )
        self.session.add(orm_message)
        await self.session.commit()
        await self.session.refresh(orm_message)
        return self._to_entity(orm_message)

    async def list_by_case(
        self, case_id: UUID, limit: int, offset: int
    ) -> Tuple[List[ChatMessage], int]:
        # Orden ascendente: el más viejo primero, como espera el frontend.
        result = await self.session.execute(
            select(ChatMessageORM)
            .where(ChatMessageORM.case_id == case_id)
            .order_by(ChatMessageORM.created_at.asc())
            .offset(offset)
            .limit(limit)
        )
        orm_messages = result.scalars().all()

        count_result = await self.session.execute(
            select(func.count())
            .select_from(ChatMessageORM)
            .where(ChatMessageORM.case_id == case_id)
        )
        total = int(count_result.scalar_one())

        return [self._to_entity(m) for m in orm_messages], total
