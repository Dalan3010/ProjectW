from uuid import UUID

from app.domain.repositories.idea_case_repository import IdeaCaseRepository


class DeleteIdeaCaseUseCase:
    def __init__(self, idea_case_repository: IdeaCaseRepository):
        self.idea_case_repository = idea_case_repository

    async def execute(self, case_id: UUID, owner_id: UUID) -> bool:
        """Elimina el caso solo si existe y pertenece al propietario indicado."""
        idea_case = await self.idea_case_repository.get_by_id(case_id)
        if idea_case is None or idea_case.owner_id != owner_id:
            return False
        return await self.idea_case_repository.delete(case_id)
