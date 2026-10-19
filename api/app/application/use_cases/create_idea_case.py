from uuid import UUID
from app.application.dtos.idea_case_dtos import CreateIdeaCaseDTO
from app.domain.entities.idea_case import IdeaCase
from app.domain.repositories.idea_case_repository import IdeaCaseRepository

class CreateIdeaCaseUseCase:
    def __init__(self, idea_case_repository: IdeaCaseRepository):
        self.idea_case_repository = idea_case_repository

    async def execute(self, dto: CreateIdeaCaseDTO) -> IdeaCase:
        new_case = IdeaCase(
            owner_id=dto.owner_id,
            title=dto.title,
            description=dto.description,
            category=dto.category,
            metadata=dto.metadata or {}
        )
        return await self.idea_case_repository.create(new_case)
