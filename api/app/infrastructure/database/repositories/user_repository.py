from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.database.models import UserORM


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    @staticmethod
    def _to_entity(orm_user: UserORM) -> User:
        return User(
            id=orm_user.id,
            email=orm_user.email,
            full_name=orm_user.full_name,
            hashed_password=orm_user.hashed_password,
            is_active=orm_user.is_active,
            role=orm_user.role,
            created_at=orm_user.created_at
        )

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        result = await self.session.execute(select(UserORM).where(UserORM.id == user_id))
        orm_user = result.scalar_one_or_none()
        if not orm_user:
            return None
        return self._to_entity(orm_user)

    async def get_by_email(self, email: str) -> Optional[User]:
        result = await self.session.execute(select(UserORM).where(UserORM.email == email))
        orm_user = result.scalar_one_or_none()
        if not orm_user:
            return None
        return self._to_entity(orm_user)

    async def create(self, user: User) -> User:
        orm_user = UserORM(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            hashed_password=user.hashed_password,
            is_active=user.is_active,
            role=user.role,
            created_at=user.created_at
        )
        self.session.add(orm_user)
        await self.session.commit()
        await self.session.refresh(orm_user)
        return self._to_entity(orm_user)

    async def update(self, user: User) -> User:
        result = await self.session.execute(select(UserORM).where(UserORM.id == user.id))
        orm_user = result.scalar_one_or_none()
        if not orm_user:
            raise ValueError(f"User {user.id} not found")
        orm_user.email = user.email
        orm_user.full_name = user.full_name
        orm_user.hashed_password = user.hashed_password
        orm_user.is_active = user.is_active
        orm_user.role = user.role
        await self.session.commit()
        await self.session.refresh(orm_user)
        return self._to_entity(orm_user)
