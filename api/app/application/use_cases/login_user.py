from app.application.dtos.auth_dtos import LoginUserDTO
from app.domain.entities.user import User
from app.domain.repositories.user_repository import UserRepository
from app.infrastructure.auth.security import verify_password


class InvalidCredentialsError(Exception):
    """Credenciales inválidas (correo o contraseña incorrectos)."""


class LoginUserUseCase:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def execute(self, dto: LoginUserDTO) -> User:
        user = await self.user_repository.get_by_email(dto.email)
        if user is None or not verify_password(dto.password, user.hashed_password):
            raise InvalidCredentialsError()
        if not user.is_active:
            raise InvalidCredentialsError()
        return user
