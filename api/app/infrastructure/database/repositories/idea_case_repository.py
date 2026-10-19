from typing import List, Optional
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.entities.idea_case import IdeaCase
from app.domain.repositories.idea_case_repository import IdeaCaseRepository
from app.infrastructure.database.models import IdeaCaseORM

class SQLAlchemyIdeaCaseRepository(IdeaCaseRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _to_entity(orm_case: IdeaCaseORM) -> IdeaCase:
        # Mapeo canónico: columna ORM metadata_json <-> campo de entidad metadata.
        return IdeaCase(
            id=orm_case.id,
            owner_id=orm_case.owner_id,
            title=orm_case.title,
            description=orm_case.description,
            category=orm_case.category,
            status=orm_case.status,
            created_at=orm_case.created_at,
            updated_at=orm_case.updated_at,
            metadata=orm_case.metadata_json or {}
        )

    async def get_by_id(self, case_id: UUID) -> Optional[IdeaCase]:
        result = await self.session.execute(select(IdeaCaseORM).where(IdeaCaseORM.id == case_id))
        orm_case = result.scalar_one_or_none()
        if not orm_case:
            return None

        return self._to_entity(orm_case)

    async def get_by_owner(self, owner_id: UUID) -> List[IdeaCase]:
        result = await self.session.execute(select(IdeaCaseORM).where(IdeaCaseORM.owner_id == owner_id))
        orm_cases = result.scalars().all()
        return [self._to_entity(c) for c in orm_cases]

    async def create(self, idea_case: IdeaCase) -> IdeaCase:
        orm_case = IdeaCaseORM(
            id=idea_case.id,
            owner_id=idea_case.owner_id,
            title=idea_case.title,
            description=idea_case.description,
            category=idea_case.category,
            status=idea_case.status,
            created_at=idea_case.created_at,
            updated_at=idea_case.updated_at,
            metadata_json=idea_case.metadata
        )
        self.session.add(orm_case)
        await self.session.commit()
        await self.session.refresh(orm_case)
        return self._to_entity(orm_case)

    async def update(self, idea_case: IdeaCase) -> IdeaCase:
        # Implementation of update
        return idea_case

    async def list_all(self, limit: int = 10, offset: int = 0) -> List[IdeaCase]:
        result = await self.session.execute(select(IdeaCaseORM).offset(offset).limit(limit))
        orm_cases = result.scalars().all()
        return [self._to_entity(c) for c in orm_cases]

    async def delete(self, case_id: UUID) -> bool:
        result = await self.session.execute(select(IdeaCaseORM).where(IdeaCaseORM.id == case_id))
        orm_case = result.scalar_one_or_none()
        if orm_case:
            await self.session.delete(orm_case)
            await self.session.commit()
            return True
        return False
