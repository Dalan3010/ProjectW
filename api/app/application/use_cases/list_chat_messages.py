from typing import List, Optional, Tuple
from uuid import UUID

from app.domain.entities.chat_message import ChatMessage
from app.domain.repositories.chat_repository import ChatRepository
from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class ListChatMessagesUseCase:
    def __init__(
        self,
        chat_repository: ChatRepository,
        idea_case_repository: IdeaCaseRepository,
    ):
        self.chat_repository = chat_repository
        self.idea_case_repository = idea_case_repository

    async def execute(
        self, case_id: UUID, owner_id: UUID, limit: int, offset: int
    ) -> Optional[Tuple[List[ChatMessage], int]]:
        """Devuelve los mensajes solo si el caso pertenece al propietario."""
        idea_case = await self.idea_case_repository.get_by_id(case_id)
        if idea_case is None or idea_case.owner_id != owner_id:
            return None
        return await self.chat_repository.list_by_case(case_id, limit, offset)
