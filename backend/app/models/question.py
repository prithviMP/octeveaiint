from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.enums import QuestionSource
from app.db.database import Base

# Generated questions get ids from here up so re-seeding the bank (ids from questions.json) never collides.
AI_QUESTION_ID_START = 1_000_000


class Question(Base):
    __tablename__ = "questions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    subject: Mapped[str] = mapped_column(ForeignKey("subjects.code"), index=True, nullable=False)
    topic: Mapped[str] = mapped_column(String(150), nullable=False)
    difficulty: Mapped[str] = mapped_column(String(10), index=True, nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    option_a: Mapped[str] = mapped_column(String(500), nullable=False)
    option_b: Mapped[str] = mapped_column(String(500), nullable=False)
    option_c: Mapped[str] = mapped_column(String(500), nullable=False)
    option_d: Mapped[str] = mapped_column(String(500), nullable=False)
    correct_answer: Mapped[str] = mapped_column(String(1), nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    source: Mapped[str] = mapped_column(
        String(10), index=True, nullable=False, default=QuestionSource.BANK.value, server_default=QuestionSource.BANK.value
    )

    @property
    def options(self) -> list[str]:
        return [self.option_a, self.option_b, self.option_c, self.option_d]
