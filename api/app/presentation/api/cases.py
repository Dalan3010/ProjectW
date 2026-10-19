from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.dtos.idea_case_dtos import CreateIdeaCaseDTO, UpdateIdeaCaseDTO
from app.application.use_cases.create_idea_case import CreateIdeaCaseUseCase
from app.application.use_cases.delete_idea_case import DeleteIdeaCaseUseCase
from app.application.use_cases.get_idea_case import GetIdeaCaseUseCase
from app.application.use_cases.list_idea_cases import ListIdeaCasesUseCase
from app.application.use_cases.update_idea_case import UpdateIdeaCaseUseCase
from app.domain.entities.user import User
from app.infrastructure.database.repositories.idea_case_repository import SQLAlchemyIdeaCaseRepository
from app.infrastructure.database.connection import get_db
from app.presentation.api.deps import get_current_user
from app.presentation.schemas.idea_case_schemas import (
    IdeaCaseListResponseSchema,
    IdeaCaseResponseSchema,
)

router = APIRouter(prefix="/cases", tags=["Cases"])

async def get_idea_case_use_case(db: AsyncSession = Depends(get_db)) -> CreateIdeaCaseUseCase:
    repo = SQLAlchemyIdeaCaseRepository(db)
    return CreateIdeaCaseUseCase(repo)

@router.post("/", response_model=IdeaCaseResponseSchema)
async def create_case(
    dto: CreateIdeaCaseDTO,
    current_user: User = Depends(get_current_user),
    use_case: CreateIdeaCaseUseCase = Depends(get_idea_case_use_case)
) -> IdeaCaseResponseSchema:
    # El propietario sale del token JWT, nunca del body.
    new_case = await use_case.execute(dto, owner_id=current_user.id)
    return new_case


@router.get("/", response_model=IdeaCaseListResponseSchema)
async def list_cases(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> IdeaCaseListResponseSchema:
    use_case = ListIdeaCasesUseCase(SQLAlchemyIdeaCaseRepository(db))
    cases, total = await use_case.execute(owner_id=current_user.id, limit=limit, offset=offset)
    return IdeaCaseListResponseSchema(
        data=[IdeaCaseResponseSchema.model_validate(c) for c in cases],
        total=total,
        limit=limit,
        offset=offset
    )


@router.get("/{case_id}", response_model=IdeaCaseResponseSchema)
async def get_case(
    case_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> IdeaCaseResponseSchema:
    use_case = GetIdeaCaseUseCase(SQLAlchemyIdeaCaseRepository(db))
    idea_case = await use_case.execute(case_id, owner_id=current_user.id)
    if idea_case is None:
        raise HTTPException(status_code=404, detail="Idea case not found")
    return idea_case


@router.patch("/{case_id}", response_model=IdeaCaseResponseSchema)
async def update_case(
    case_id: UUID,
    dto: UpdateIdeaCaseDTO,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> IdeaCaseResponseSchema:
    use_case = UpdateIdeaCaseUseCase(SQLAlchemyIdeaCaseRepository(db))
    updated = await use_case.execute(dto, case_id, owner_id=current_user.id)
    if updated is None:
        raise HTTPException(status_code=404, detail="Idea case not found")
    return updated


@router.delete("/{case_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_case(
    case_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Response:
    use_case = DeleteIdeaCaseUseCase(SQLAlchemyIdeaCaseRepository(db))
    deleted = await use_case.execute(case_id, owner_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Idea case not found")
    return Response(status_code=status.HTTP_204_NO_CONTENT)
