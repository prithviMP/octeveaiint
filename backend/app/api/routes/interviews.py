from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.interview import (
    InterviewCreate,
    InterviewEvaluation,
    InterviewResult,
    InterviewReview,
    InterviewSessionOut,
    InterviewSubmit,
)
from app.services import evaluation_service, interview_service

router = APIRouter(prefix="/interviews", tags=["interviews"])

NOT_FOUND = {404: {"description": "Interview session not found"}}
NOT_SUBMITTED = {409: {"description": "Interview has not been submitted yet"}}


@router.post(
    "",
    response_model=InterviewSessionOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create an interview session",
)
def create_interview(payload: InterviewCreate, db: Session = Depends(get_db)) -> InterviewSessionOut:
    session = interview_service.create_interview(db, payload)
    return interview_service.to_session_out(session)


@router.get(
    "/{session_id}",
    response_model=InterviewSessionOut,
    responses=NOT_FOUND,
    summary="Retrieve an interview session and its questions",
)
def get_interview(session_id: str, db: Session = Depends(get_db)) -> InterviewSessionOut:
    return interview_service.to_session_out(interview_service.get_interview(db, session_id))


@router.post(
    "/{session_id}/submit",
    response_model=InterviewResult,
    responses=NOT_FOUND,
    summary="Submit answers and score the interview (idempotent)",
)
def submit_interview(
    session_id: str, payload: InterviewSubmit, db: Session = Depends(get_db)
) -> InterviewResult:
    return interview_service.submit_interview(db, session_id, payload)


@router.get(
    "/{session_id}/results",
    response_model=InterviewResult,
    responses={**NOT_FOUND, **NOT_SUBMITTED},
    summary="Retrieve the results of a submitted interview",
)
def get_results(session_id: str, db: Session = Depends(get_db)) -> InterviewResult:
    return interview_service.get_results(db, session_id)


@router.get(
    "/{session_id}/review",
    response_model=InterviewReview,
    responses={**NOT_FOUND, **NOT_SUBMITTED},
    summary="Retrieve answer review with correct answers and explanations",
)
def get_review(session_id: str, db: Session = Depends(get_db)) -> InterviewReview:
    return interview_service.get_review(db, session_id)


@router.get(
    "/{session_id}/evaluation",
    response_model=InterviewEvaluation,
    responses={**NOT_FOUND, **NOT_SUBMITTED},
    summary="Retrieve the AI coach evaluation (rule-based if Gemini is unavailable)",
)
def get_evaluation(session_id: str, db: Session = Depends(get_db)) -> InterviewEvaluation:
    return evaluation_service.get_evaluation(db, session_id)
