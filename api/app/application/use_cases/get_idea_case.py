from typing import Optional
from uuid import UUID

from app.domain.entities.idea_case import IdeaCase
from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class GetIdeaCaseUseCase:
    def __init__(self, idea_case_repository: IdeaCaseRepository):
        self.idea_case_repository = idea_case_repository

    async def execute(self, case_id: UUID, owner_id: UUID) -> Optional[IdeaCase]:
        """Devuelve el caso solo si existe y pertenece al propietario indicado."""
        idea_case = await self.idea_case_repository.get_by_id(case_id)
        if idea_case is None or idea_case.owner_id != owner_id:
            return None
        return idea_case
