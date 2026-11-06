from pydantic import BaseModel, Field

from app.core.enums import EvaluationSource
from app.models import InterviewSession
from app.schemas.interview import InterviewEvaluation, QuestionFeedback, WeakArea
from app.services import scoring_service
from app.services.ai import gemini

MAX_STRENGTHS = 3
MAX_WEAK_AREAS = 4
MAX_RECOMMENDATIONS = 5

SYSTEM_INSTRUCTION = (
    "You are a supportive but honest technical interview coach. You review a student's multiple-choice "
    "interview and write feedback in the second person. The score has already been calculated and is final; "
    "never contradict it or re-grade answers. Be specific to the questions asked, keep sentences short, and "
    "avoid generic filler."
)


class _WeakAreaDraft(BaseModel):
    subject: str = Field(description="Subject code exactly as given, e.g. DSA or REACT.")
    topic: str
    advice: str = Field(description="One or two sentences on what to study and why.")


class _QuestionFeedbackDraft(BaseModel):
    position: int = Field(description="Question number as given in the prompt.")
    feedback: str = Field(description="One or two sentences on why the chosen option is wrong.")


class EvaluationDraft(BaseModel):
    summary: str = Field(description="Two or three sentences on overall performance.")
    strengths: list[str] = Field(description="Up to three things the student clearly knows. Empty if none.")
    weak_areas: list[_WeakAreaDraft] = Field(description="Up to four topics to work on, based on wrong answers.")
    recommendations: list[str] = Field(description="Three to five concrete next study steps.")
    question_feedback: list[_QuestionFeedbackDraft] = Field(
        description="Exactly one entry for every incorrectly answered question, and none for correct ones."
    )


def _build_prompt(session: InterviewSession) -> str:
    first_name = session.student_name.split()[0]
    result = scoring_service.build_result(session)
    lines = [
        f"Student: {first_name}",
        f"Score: {result.score_display} ({result.percentage}%), performance band: {result.performance_level}",
        "Per subject: "
        + ", ".join(f"{b.subject} {b.correct}/{b.total}" for b in result.subject_breakdown),
        "",
        "Questions:",
    ]
    for response in session.responses:
        q = response.question
        options = " | ".join(f"{letter}) {text}" for letter, text in zip("ABCD", q.options, strict=True))
        verdict = "correct" if response.is_correct else "incorrect"
        lines += [
            f"Q{response.position} [{q.subject} / {q.topic} / {q.difficulty}] {q.question_text}",
            f"Options: {options}",
            f"Correct answer: {q.correct_answer}. Student chose: {response.selected_answer} ({verdict}).",
            "",
        ]
    lines.append("Write the coaching feedback for this interview.")
    return "\n".join(lines)


def _clean_list(items: list[str], limit: int) -> list[str]:
    cleaned = [item.strip() for item in items if item.strip()]
    return list(dict.fromkeys(cleaned))[:limit]


def evaluate(session: InterviewSession) -> InterviewEvaluation:
    """Ask Gemini for a coach report. Raises AIUnavailableError if the output is unusable."""
    draft = gemini.generate_structured(_build_prompt(session), EvaluationDraft, system_instruction=SYSTEM_INSTRUCTION)
    summary = draft.summary.strip()
    if not summary:
        raise gemini.AIUnavailableError("Gemini returned an empty summary")

    by_position = {r.position: r for r in session.responses}
    feedback: dict[int, str] = {}
    for item in draft.question_feedback:
        response = by_position.get(item.position)
        text = item.feedback.strip()
        if response is not None and not response.is_correct and text and response.question_id not in feedback:
            feedback[response.question_id] = text

    subjects = set(session.selected_subjects)
    weak_areas = [
        WeakArea(subject=area.subject.strip().upper(), topic=area.topic.strip(), advice=area.advice.strip())
        for area in draft.weak_areas
        if area.subject.strip().upper() in subjects and area.topic.strip() and area.advice.strip()
    ][:MAX_WEAK_AREAS]

    return InterviewEvaluation(
        session_id=session.id,
        source=EvaluationSource.AI,
        summary=summary,
        strengths=_clean_list(draft.strengths, MAX_STRENGTHS),
        weak_areas=weak_areas,
        recommendations=_clean_list(draft.recommendations, MAX_RECOMMENDATIONS),
        question_feedback=[QuestionFeedback(question_id=qid, feedback=text) for qid, text in feedback.items()],
    )
