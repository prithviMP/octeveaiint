from pydantic import BaseModel, Field

from app.models import Question


class QuestionPublic(BaseModel):
    """A question as shown during an interview. Never carries the answer key."""

    id: int
    subject: str
    topic: str
    difficulty: str
    question: str
    options: list[str] = Field(min_length=4, max_length=4)

    @classmethod
    def from_model(cls, question: Question) -> "QuestionPublic":
        return cls(
            id=question.id,
            subject=question.subject,
            topic=question.topic,
            difficulty=question.difficulty,
            question=question.question_text,
            options=question.options,
        )


class QuestionList(BaseModel):
    total: int
    questions: list[QuestionPublic]


class SubjectOut(BaseModel):
    code: str
    name: str
    category: str
    total_questions: int
    difficulty_counts: dict[str, int]


class SubjectCategory(BaseModel):
    category: str
    subjects: list[SubjectOut]


class SubjectList(BaseModel):
    total: int
    categories: list[SubjectCategory]
