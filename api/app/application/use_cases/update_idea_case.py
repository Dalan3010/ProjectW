from typing import Optional
from uuid import UUID

from app.application.dtos.idea_case_dtos import UpdateIdeaCaseDTO
from app.domain.entities.idea_case import IdeaCase
from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class UpdateIdeaCaseUseCase:
    def __init__(self, idea_case_repository: IdeaCaseRepository):
        self.idea_case_repository = idea_case_repository

    async def execute(
        self,
        dto: UpdateIdeaCaseDTO,
        case_id: UUID,
        owner_id: UUID
    ) -> Optional[IdeaCase]:
        """Actualización parcial; None si el caso no existe o no es del propietario."""
        idea_case = await self.idea_case_repository.get_by_id(case_id)
        if idea_case is None or idea_case.owner_id != owner_id:
            return None

        if dto.title is not None:
            idea_case.title = dto.title
        if dto.description is not None:
            idea_case.description = dto.description
        if dto.category is not None:
            idea_case.category = dto.category
        if dto.status is not None:
            idea_case.status = dto.status
        if dto.metadata is not None:
            idea_case.metadata = dto.metadata

        return await self.idea_case_repository.update(idea_case)
