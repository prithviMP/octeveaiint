from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.orm import Session, selectinload

from app.core.enums import SessionStatus
from app.core.exceptions import ConflictError, InvalidRequestError, NotFoundError
from app.models import InterviewResponse, InterviewSession
from app.schemas.interview import (
    InterviewCreate,
    InterviewQuestion,
    InterviewResult,
    InterviewReview,
    InterviewSessionOut,
    InterviewSubmit,
    ReviewItem,
)
from app.services import question_service, scoring_service


def create_interview(db: Session, payload: InterviewCreate) -> InterviewSession:
    subjects = question_service.validate_subject_codes(db, payload.subjects)
    questions = question_service.select_questions(db, subjects, payload.difficulty, payload.num_questions)

    session = InterviewSession(
        student_name=payload.student_name,
        selected_subjects=subjects,
        difficulty=payload.difficulty.value,
        total_questions=len(questions),
        status=SessionStatus.IN_PROGRESS.value,
    )
    session.responses = [
        InterviewResponse(question_id=question.id, position=index, question=question)
        for index, question in enumerate(questions, start=1)
    ]
    db.add(session)
    db.commit()
    return session


def get_interview(db: Session, session_id: str) -> InterviewSession:
    session = db.scalar(
        select(InterviewSession)
        .where(InterviewSession.id == session_id)
        .options(selectinload(InterviewSession.responses).joinedload(InterviewResponse.question))
        .execution_options(populate_existing=True)
    )
    if session is None:
        raise NotFoundError("Interview session not found")
    return session


def to_session_out(session: InterviewSession) -> InterviewSessionOut:
    return InterviewSessionOut(
        id=session.id,
        student_name=session.student_name,
        selected_subjects=session.selected_subjects,
        difficulty=session.difficulty,
        total_questions=session.total_questions,
        status=session.status,
        created_at=session.created_at,
        submitted_at=session.submitted_at,
        questions=[
            InterviewQuestion(
                id=r.question.id,
                subject=r.question.subject,
                topic=r.question.topic,
                difficulty=r.question.difficulty,
                question=r.question.question_text,
                options=r.question.options,
                position=r.position,
                selected_answer=r.selected_answer,
            )
            for r in session.responses
        ],
    )


def _validate_answers(session: InterviewSession, payload: InterviewSubmit) -> dict[int, str]:
    answers: dict[int, str] = {}
    for answer in payload.answers:
        if answer.question_id in answers:
            raise InvalidRequestError(f"Question {answer.question_id} was answered more than once")
        answers[answer.question_id] = answer.selected_answer.value

    expected = {r.question_id for r in session.responses}
    foreign = sorted(set(answers) - expected)
    if foreign:
        raise InvalidRequestError(
            f"Question(s) {', '.join(map(str, foreign))} do not belong to this interview"
        )

    missing = expected - set(answers)
    if missing:
        raise InvalidRequestError(
            f"All questions must be answered before submitting ({len(missing)} unanswered)"
        )
    return answers


def submit_interview(db: Session, session_id: str, payload: InterviewSubmit) -> InterviewResult:
    session = get_interview(db, session_id)
    if session.status == SessionStatus.COMPLETED:
        return scoring_service.build_result(session)

    answers = _validate_answers(session, payload)

    # Claim the session atomically so concurrent submissions cannot both score it.
    claimed = db.execute(
        update(InterviewSession)
        .where(InterviewSession.id == session_id, InterviewSession.status == SessionStatus.IN_PROGRESS.value)
        .values(status=SessionStatus.COMPLETED.value)
    ).rowcount
    if not claimed:
        db.rollback()
        return scoring_service.build_result(get_interview(db, session_id))

    correct = 0
    for response in session.responses:
        response.selected_answer = answers[response.question_id]
        response.is_correct = response.selected_answer == response.question.correct_answer
        correct += response.is_correct

    session.status = SessionStatus.COMPLETED.value
    session.score = correct
    session.percentage = scoring_service.calculate_percentage(correct, session.total_questions)
    session.submitted_at = datetime.now(UTC)
    db.commit()

    return scoring_service.build_result(session)


def _get_completed(db: Session, session_id: str) -> InterviewSession:
    session = get_interview(db, session_id)
    if session.status != SessionStatus.COMPLETED:
        raise ConflictError("Interview has not been submitted yet")
    return session


def get_results(db: Session, session_id: str) -> InterviewResult:
    return scoring_service.build_result(_get_completed(db, session_id))


def get_review(db: Session, session_id: str) -> InterviewReview:
    session = _get_completed(db, session_id)
    items = [
        ReviewItem(
            position=r.position,
            question_id=r.question.id,
            subject=r.question.subject,
            topic=r.question.topic,
            difficulty=r.question.difficulty,
            question=r.question.question_text,
            options=r.question.options,
            selected_answer=r.selected_answer,
            correct_answer=r.question.correct_answer,
            is_correct=bool(r.is_correct),
            explanation=r.question.explanation,
        )
        for r in session.responses
    ]
    correct = sum(1 for item in items if item.is_correct)
    return InterviewReview(
        session_id=session.id,
        student_name=session.student_name,
        total_questions=session.total_questions,
        correct_answers=correct,
        percentage=scoring_service.calculate_percentage(correct, session.total_questions),
        items=items,
    )
