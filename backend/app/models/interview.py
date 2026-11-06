import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import JSON, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import SessionQuestionSource, SessionStatus
from app.db.database import Base

if TYPE_CHECKING:
    from app.models.response import InterviewResponse


def _utcnow() -> datetime:
    return datetime.now(UTC)


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_name: Mapped[str] = mapped_column(String(100), nullable=False)
    selected_subjects: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(10), nullable=False)
    total_questions: Mapped[int] = mapped_column(Integer, nullable=False)
    score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    percentage: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default=SessionStatus.IN_PROGRESS)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_utcnow)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    question_source: Mapped[str] = mapped_column(
        String(10), nullable=False, default=SessionQuestionSource.BANK.value,
        server_default=SessionQuestionSource.BANK.value,
    )
    ai_evaluation: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    responses: Mapped[list["InterviewResponse"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="InterviewResponse.position",
    )
