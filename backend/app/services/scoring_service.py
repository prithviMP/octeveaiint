from collections import defaultdict
from dataclasses import dataclass

from app.models import InterviewSession
from app.schemas.interview import InterviewResult, SubjectBreakdown


@dataclass(frozen=True)
class PerformanceBand:
    min_percentage: float
    level: str
    feedback: str


PERFORMANCE_BANDS: tuple[PerformanceBand, ...] = (
    PerformanceBand(90, "Excellent", "Excellent performance! You have a strong command of these topics."),
    PerformanceBand(75, "Good", "Good performance. Review the questions you missed to sharpen your knowledge."),
    PerformanceBand(50, "Average", "Average performance. Focus on your weaker topics and practice again."),
    PerformanceBand(0, "Needs improvement", "Needs improvement. Revisit the fundamentals and try another round."),
)


def calculate_percentage(correct: int, total: int) -> float:
    if total <= 0:
        return 0.0
    return round(correct / total * 100, 2)


def performance_band(percentage: float) -> PerformanceBand:
    for band in PERFORMANCE_BANDS:
        if percentage >= band.min_percentage:
            return band
    return PERFORMANCE_BANDS[-1]


def build_result(session: InterviewSession) -> InterviewResult:
    total = session.total_questions
    attempted = sum(1 for r in session.responses if r.selected_answer is not None)
    correct = sum(1 for r in session.responses if r.is_correct)
    percentage = calculate_percentage(correct, total)
    band = performance_band(percentage)

    per_subject: dict[str, list[int]] = defaultdict(lambda: [0, 0])
    for response in session.responses:
        stats = per_subject[response.question.subject]
        stats[0] += 1
        stats[1] += 1 if response.is_correct else 0

    breakdown = [
        SubjectBreakdown(
            subject=subject,
            total=per_subject[subject][0],
            correct=per_subject[subject][1],
            percentage=calculate_percentage(per_subject[subject][1], per_subject[subject][0]),
        )
        for subject in session.selected_subjects
        if subject in per_subject
    ]

    return InterviewResult(
        session_id=session.id,
        student_name=session.student_name,
        selected_subjects=session.selected_subjects,
        difficulty=session.difficulty,
        total_questions=total,
        attempted=attempted,
        correct_answers=correct,
        incorrect_answers=total - correct,
        score=correct,
        score_display=f"{correct}/{total}",
        percentage=percentage,
        performance_level=band.level,
        feedback=band.feedback,
        subject_breakdown=breakdown,
        submitted_at=session.submitted_at,
    )
