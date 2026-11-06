import json
import logging
from pathlib import Path

from pydantic import BaseModel, Field, TypeAdapter, model_validator
from sqlalchemy.orm import Session

from app.core.enums import AnswerOption, Difficulty, QuestionSource
from app.models import Question, Subject
from app.models.question import AI_QUESTION_ID_START

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).parent / "data"


class SubjectSeed(BaseModel):
    code: str
    name: str
    category: str


class QuestionSeed(BaseModel):
    id: int = Field(gt=0, lt=AI_QUESTION_ID_START)
    subject: str
    topic: str
    difficulty: Difficulty
    question: str = Field(min_length=1)
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: AnswerOption
    explanation: str = Field(min_length=1)

    @model_validator(mode="after")
    def options_are_distinct(self) -> "QuestionSeed":
        if len(set(self.options)) != 4:
            raise ValueError(f"Question {self.id} has duplicate options")
        return self


def load_subjects(path: Path = DATA_DIR / "subjects.json") -> list[SubjectSeed]:
    return TypeAdapter(list[SubjectSeed]).validate_python(json.loads(path.read_text(encoding="utf-8")))


def load_questions(path: Path = DATA_DIR / "questions.json") -> list[QuestionSeed]:
    return TypeAdapter(list[QuestionSeed]).validate_python(json.loads(path.read_text(encoding="utf-8")))


def _validate_dataset(subjects: list[SubjectSeed], questions: list[QuestionSeed]) -> None:
    subject_codes = {s.code for s in subjects}
    if len(subject_codes) != len(subjects):
        raise ValueError("Duplicate subject codes in subjects.json")

    seen_ids: set[int] = set()
    for q in questions:
        if q.id in seen_ids:
            raise ValueError(f"Duplicate question id {q.id} in questions.json")
        seen_ids.add(q.id)
        if q.subject not in subject_codes:
            raise ValueError(f"Question {q.id} references unknown subject {q.subject!r}")


def seed_database(db: Session) -> None:
    """Upsert the bundled subjects and questions. Safe to run on every startup."""
    subjects = load_subjects()
    questions = load_questions()
    _validate_dataset(subjects, questions)

    for order, s in enumerate(subjects):
        db.merge(Subject(code=s.code, name=s.name, category=s.category, display_order=order))
    db.flush()

    for q in questions:
        db.merge(
            Question(
                id=q.id,
                subject=q.subject,
                topic=q.topic,
                difficulty=q.difficulty.value,
                question_text=q.question,
                option_a=q.options[0],
                option_b=q.options[1],
                option_c=q.options[2],
                option_d=q.options[3],
                correct_answer=q.correct_answer.value,
                explanation=q.explanation,
                source=QuestionSource.BANK.value,
            )
        )

    db.commit()
    logger.info("Seeded %d subjects and %d questions", len(subjects), len(questions))


if __name__ == "__main__":
    from app.db.database import Base, SessionLocal, engine

    logging.basicConfig(level=logging.INFO)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_database(session)
