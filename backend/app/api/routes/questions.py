from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.enums import DifficultyFilter
from app.db.database import get_db
from app.schemas.question import QuestionList
from app.services import question_service

router = APIRouter(tags=["questions"])


@router.get(
    "/questions",
    response_model=QuestionList,
    summary="List questions filtered by subject and difficulty (answer keys are never included)",
)
def list_questions(
    subjects: Annotated[str, Query(description="Comma-separated subject codes, e.g. DSA,PYTHON")],
    difficulty: DifficultyFilter = DifficultyFilter.MIXED,
    limit: Annotated[int | None, Query(ge=1, le=200)] = None,
    db: Session = Depends(get_db),
) -> QuestionList:
    codes = question_service.validate_subject_codes(db, subjects.split(","))
    return question_service.list_public_questions(db, codes, difficulty, limit)
