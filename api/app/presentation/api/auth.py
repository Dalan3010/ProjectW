from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.auth_dtos import LoginUserDTO, RegisterUserDTO
from app.application.use_cases.login_user import InvalidCredentialsError, LoginUserUseCase
from app.application.use_cases.register_user import EmailAlreadyRegisteredError, RegisterUserUseCase
from app.infrastructure.auth.security import create_access_token
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.user_repository import SQLAlchemyUserRepository
from app.presentation.api.deps import get_current_user
from app.presentation.schemas.auth_schemas import (
    LoginRequestSchema,
    RegisterRequestSchema,
    TokenResponseSchema,
    UserResponseSchema,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponseSchema, status_code=201)
async def register(
    body: RegisterRequestSchema,
    db: AsyncSession = Depends(get_db)
) -> TokenResponseSchema:
    use_case = RegisterUserUseCase(SQLAlchemyUserRepository(db))
    dto = RegisterUserDTO(name=body.name, email=body.email, password=body.password)
    try:
        user = await use_case.execute(dto)
    except EmailAlreadyRegisteredError:
        raise HTTPException(status_code=409, detail="Email already registered")
    token = create_access_token(str(user.id))
    return TokenResponseSchema(access_token=token, user=user)


@router.post("/login", response_model=TokenResponseSchema)
async def login(
    body: LoginRequestSchema,
    db: AsyncSession = Depends(get_db)
) -> TokenResponseSchema:
    use_case = LoginUserUseCase(SQLAlchemyUserRepository(db))
    dto = LoginUserDTO(email=body.email, password=body.password)
    try:
        user = await use_case.execute(dto)
    except InvalidCredentialsError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return TokenResponseSchema(access_token=token, user=user)


@router.get("/me", response_model=UserResponseSchema)
async def me(current_user=Depends(get_current_user)) -> UserResponseSchema:
    return current_user
