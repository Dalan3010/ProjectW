from app.application.dtos.auth_dtos import RegisterUserDTO
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.auth.security import hash_password


class EmailAlreadyRegisteredError(Exception):
    """El correo ya tiene una cuenta asociada."""

    def __init__(self, email: str):
        self.email = email
        super().__init__(f"Email already registered: {email}")


class RegisterUserUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute(self, dto: RegisterUserDTO) -> User:
        existing = await self.user_repository.get_by_email(dto.email)
        if existing is not None:
            raise EmailAlreadyRegisteredError(dto.email)

        new_user = User(
            email=dto.email,
            full_name=dto.name,
            hashed_password=hash_password(dto.password)
        )
        return await self.user_repository.create(new_user)
