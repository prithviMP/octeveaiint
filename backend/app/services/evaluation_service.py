from collections import Counter

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import EvaluationSource
from app.models import InterviewSession, Subject
from app.schemas.interview import InterviewEvaluation, WeakArea
from app.services import interview_service, scoring_service
from app.services.ai import evaluator, gemini

STRONG_SUBJECT_PERCENTAGE = 75


def _rule_based(db: Session, session: InterviewSession) -> InterviewEvaluation:
    result = scoring_service.build_result(session)
    names = dict(db.execute(select(Subject.code, Subject.name)).all())

    strengths = [
        f"Solid on {names.get(b.subject, b.subject)}: {b.correct} of {b.total} correct."
        for b in result.subject_breakdown
        if b.percentage >= STRONG_SUBJECT_PERCENTAGE
    ][: evaluator.MAX_STRENGTHS]

    missed = Counter((r.question.subject, r.question.topic) for r in session.responses if not r.is_correct)
    weak_areas = [
        WeakArea(
            subject=subject,
            topic=topic,
            advice=f"You missed {count} question{'s' if count > 1 else ''} on {topic}. Revisit the fundamentals here.",
        )
        for (subject, topic), count in missed.most_common(evaluator.MAX_WEAK_AREAS)
    ]

    recommendations = ["Read the explanation for every question you missed in the answer review."]
    weakest = min(result.subject_breakdown, key=lambda b: b.percentage, default=None)
    if weakest is not None and weakest.percentage < 100:
        recommendations.append(f"Run a focused round on {names.get(weakest.subject, weakest.subject)} next.")
    recommendations.append("Retry the interview to check the gaps are closed.")

    return InterviewEvaluation(
        session_id=session.id,
        source=EvaluationSource.RULE_BASED,
        summary=result.feedback,
        strengths=strengths,
        weak_areas=weak_areas,
        recommendations=recommendations,
        question_feedback=[],
    )


def get_evaluation(db: Session, session_id: str) -> InterviewEvaluation:
    """Return the cached Gemini report, generating it on first request. Falls back to a rule-based report."""
    session = interview_service.get_completed_interview(db, session_id)
    if session.ai_evaluation:
        return InterviewEvaluation.model_validate({**session.ai_evaluation, "session_id": session.id})

    try:
        evaluation = evaluator.evaluate(session)
    except gemini.AIUnavailableError:
        return _rule_based(db, session)

    session.ai_evaluation = evaluation.model_dump(mode="json", exclude={"session_id"})
    db.commit()
    return evaluation
