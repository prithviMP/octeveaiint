from typing import Annotated

from pydantic import BaseModel, Field, StringConstraints, field_validator

from app.core.enums import AnswerOption, DifficultyFilter, EvaluationSource, SessionQuestionSource, SessionStatus
from app.schemas.common import UTCDateTime
from app.schemas.question import QuestionPublic

StudentName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=100)]


class InterviewCreate(BaseModel):
    student_name: StudentName
    subjects: list[str] = Field(min_length=1, max_length=20)
    num_questions: int = Field(default=10, ge=1, le=50)
    difficulty: DifficultyFilter = DifficultyFilter.MIXED

    @field_validator("subjects")
    @classmethod
    def normalize_subjects(cls, value: list[str]) -> list[str]:
        normalized = list(dict.fromkeys(code.strip().upper() for code in value if code.strip()))
        if not normalized:
            raise ValueError("Select at least one subject")
        return normalized


class InterviewQuestion(QuestionPublic):
    position: int
    selected_answer: AnswerOption | None = None


class InterviewSessionOut(BaseModel):
    id: str
    student_name: str
    selected_subjects: list[str]
    difficulty: DifficultyFilter
    total_questions: int
    status: SessionStatus
    question_source: SessionQuestionSource
    created_at: UTCDateTime
    submitted_at: UTCDateTime | None
    questions: list[InterviewQuestion]


class AnswerIn(BaseModel):
    question_id: int
    selected_answer: AnswerOption


class InterviewSubmit(BaseModel):
    answers: list[AnswerIn] = Field(min_length=1)


class SubjectBreakdown(BaseModel):
    subject: str
    total: int
    correct: int
    percentage: float


class InterviewResult(BaseModel):
    session_id: str
    student_name: str
    selected_subjects: list[str]
    difficulty: DifficultyFilter
    total_questions: int
    attempted: int
    correct_answers: int
    incorrect_answers: int
    score: int
    score_display: str
    percentage: float
    performance_level: str
    feedback: str
    subject_breakdown: list[SubjectBreakdown]
    submitted_at: UTCDateTime


class ReviewItem(BaseModel):
    position: int
    question_id: int
    subject: str
    topic: str
    difficulty: str
    question: str
    options: list[str]
    selected_answer: AnswerOption | None
    correct_answer: AnswerOption
    is_correct: bool
    explanation: str
    ai_feedback: str | None = None


class InterviewReview(BaseModel):
    session_id: str
    student_name: str
    total_questions: int
    correct_answers: int
    percentage: float
    items: list[ReviewItem]


class WeakArea(BaseModel):
    subject: str
    topic: str
    advice: str


class QuestionFeedback(BaseModel):
    question_id: int
    feedback: str


class InterviewEvaluation(BaseModel):
    session_id: str
    source: EvaluationSource
    summary: str
    strengths: list[str]
    weak_areas: list[WeakArea]
    recommendations: list[str]
    question_feedback: list[QuestionFeedback]
