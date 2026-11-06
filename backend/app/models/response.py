from sqlalchemy import Boolean, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base
from app.models.interview import InterviewSession
from app.models.question import Question


class InterviewResponse(Base):
    __tablename__ = "interview_responses"
    __table_args__ = (UniqueConstraint("session_id", "question_id", name="uq_response_session_question"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(
        ForeignKey("interview_sessions.id", ondelete="CASCADE"), index=True, nullable=False
    )
    question_id: Mapped[int] = mapped_column(ForeignKey("questions.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    selected_answer: Mapped[str | None] = mapped_column(String(1), nullable=True)
    is_correct: Mapped[bool | None] = mapped_column(Boolean, nullable=True)

    session: Mapped[InterviewSession] = relationship(back_populates="responses")
    question: Mapped[Question] = relationship(lazy="joined")
