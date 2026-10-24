from typing import Protocol

from uuid import UUID

from app.domain.entities.chat_message import ChatMessage


class ChatRepository(Protocol):
    async def add(self, message: ChatMessage) -> ChatMessage: ...

    async def list_by_case(
        self, case_id: UUID, limit: int, offset: int
    ) -> tuple[list[ChatMessage], int]: ...
