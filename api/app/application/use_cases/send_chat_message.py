from typing import Optional, Tuple
from uuid import UUID

from app.application.dtos.chat_dtos import SendMessageDTO
from app.application.ports.chat_responder import ChatResponder
from app.domain.entities.chat_message import ChatMessage
from app.domain.repositories.chat_repository import ChatRepository
from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class SendChatMessageUseCase:
    def __init__(
        self,
        chat_repository: ChatRepository,
        idea_case_repository: IdeaCaseRepository,
        responder: ChatResponder,
    ):
        self.chat_repository = chat_repository
        self.idea_case_repository = idea_case_repository
        self.responder = responder

    async def execute(
        self, dto: SendMessageDTO, case_id: UUID, owner_id: UUID
    ) -> Optional[Tuple[ChatMessage, ChatMessage]]:
        """Persiste el mensaje del usuario y luego la respuesta del asistente.

        El mensaje del usuario se guarda antes de invocar al responder: si el
        responder falla, el mensaje del usuario no se pierde.
        """
        idea_case = await self.idea_case_repository.get_by_id(case_id)
        if idea_case is None or idea_case.owner_id != owner_id:
            return None

        user_message = await self.chat_repository.add(
            ChatMessage(case_id=case_id, role="user", content=dto.content, metadata={})
        )

        reply = await self.responder.reply(
            prompt=dto.content, case_title=idea_case.title
        )

        assistant_message = await self.chat_repository.add(
            ChatMessage(
                case_id=case_id,
                role="assistant",
                content=reply.content,
                metadata=reply.metadata,
            )
        )

        return user_message, assistant_message
