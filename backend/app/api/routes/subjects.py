from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.question import SubjectList
from app.services import question_service

router = APIRouter(tags=["subjects"])


@router.get("/subjects", response_model=SubjectList, summary="List available subjects grouped by category")
def list_subjects(db: Session = Depends(get_db)) -> SubjectList:
    return question_service.list_subjects(db)
