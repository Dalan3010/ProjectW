from fastapi import APIRouter, Depends, HTTPException
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.dtos.idea_case_dtos import CreateIdeaCaseDTO
from app.application.use_cases.create_idea_case import CreateIdeaCaseUseCase
from app.infrastructure.database.repositories.idea_case_repository import SQLAlchemyIdeaCaseRepository
from app.infrastructure.database.connection import get_db
from app.presentation.schemas.idea_case_schemas import IdeaCaseResponseSchema

router = APIRouter(prefix="/cases", tags=["Cases"])

async def get_idea_case_use_case(db: AsyncSession = Depends(get_db)) -> CreateIdeaCaseUseCase:
    repo = SQLAlchemyIdeaCaseRepository(db)
    return CreateIdeaCaseUseCase(repo)

@router.post("/", response_model=IdeaCaseResponseSchema)
async def create_case(
    dto: CreateIdeaCaseDTO,
    use_case: CreateIdeaCaseUseCase = Depends(get_idea_case_use_case)
) -> IdeaCaseResponseSchema:
    try:
        new_case = await use_case.execute(dto)
        return new_case
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
