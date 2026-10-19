from typing import List, Tuple
from uuid import UUID

from app.domain.entities.idea_case import IdeaCase
from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class ListIdeaCasesUseCase:
    def __init__(self, idea_case_repository: IdeaCaseRepository):
        self.idea_case_repository = idea_case_repository

    async def execute(self, owner_id: UUID, limit: int, offset: int) -> Tuple[List[IdeaCase], int]:
        """Lista los casos del propietario con paginación; devuelve (casos, total)."""
        cases = await self.idea_case_repository.list_by_owner(owner_id, limit, offset)
        total = await self.idea_case_repository.count_by_owner(owner_id)
        return cases, total
