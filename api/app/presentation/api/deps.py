"""Dependencias compartidas de la capa de presentación."""
from uuid import UUID

import jwt as pyjwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.user import User
from app.infrastructure.auth.security import decode_token
from app.infrastructure.database.connection import get_db
from app.infrastructure.database.repositories.user_repository import SQLAlchemyUserRepository

bearer_scheme = HTTPBearer(auto_error=False)

_AUTH_HEADER = {"WWW-Authenticate": "Bearer"}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extrae y valida el usuario actual a partir del token Bearer.

    Token ausente, inválido o expirado → 401. Usuario inexistente o
    inactivo → 401.
    """
    if credentials is None:
        raise HTTPException(status_code=401, detail="Not authenticated", headers=_AUTH_HEADER)

    try:
        payload = decode_token(credentials.credentials)
        user_id = UUID(payload["sub"])
    except (pyjwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers=_AUTH_HEADER)

    user = await SQLAlchemyUserRepository(db).get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token", headers=_AUTH_HEADER)
    if not user.is_active:
        raise HTTPException(status_code=401, detail="Inactive user", headers=_AUTH_HEADER)
    return user
