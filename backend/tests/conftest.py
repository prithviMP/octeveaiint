import os
import re
import tempfile
import uuid
from collections.abc import Iterator
from pathlib import Path

# Point the app's global engine at a throwaway file before anything imports app.*
_TMP_DIR = Path(tempfile.mkdtemp(prefix="aic-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DIR / 'global.db'}"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"
# Never call the real Gemini API from tests, even if backend/.env holds a key.
os.environ["GEMINI_API_KEY"] = ""

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import select  # noqa: E402
from sqlalchemy.orm import Session, sessionmaker  # noqa: E402

from app.db.database import Base, build_engine, get_db  # noqa: E402
from app.db.seed import seed_database  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Question  # noqa: E402


@pytest.fixture
def session_factory(tmp_path: Path) -> Iterator[sessionmaker[Session]]:
    engine = build_engine(f"sqlite:///{tmp_path / 'test.db'}")
    Base.metadata.create_all(bind=engine)
    factory = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
    with factory() as db:
        seed_database(db)
    yield factory
    engine.dispose()


@pytest.fixture
def db(session_factory: sessionmaker[Session]) -> Iterator[Session]:
    with session_factory() as session:
        yield session


@pytest.fixture
def client(session_factory: sessionmaker[Session]) -> Iterator[TestClient]:
    def _override_get_db() -> Iterator[Session]:
        with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def answer_key(db: Session) -> dict[int, str]:
    return {q.id: q.correct_answer for q in db.scalars(select(Question)).all()}


def wrong_option(correct: str) -> str:
    return next(option for option in "ABCD" if option != correct)


class FakeGemini:
    """Stands in for `gemini.generate_structured`. Builds valid output from the prompt unless told otherwise."""

    def __init__(self) -> None:
        self.calls: list[str] = []
        self.fail_questions = False
        self.fail_evaluation = False
        self.question_difficulty = "Medium"
        self.bad_every: int | None = None

    def __call__(self, prompt: str, schema: type, *, system_instruction: str):
        from app.services.ai.evaluator import EvaluationDraft
        from app.services.ai.gemini import AIUnavailableError
        from app.services.ai.question_generator import GeneratedQuestionSet

        self.calls.append(schema.__name__)
        if schema is GeneratedQuestionSet:
            if self.fail_questions:
                raise AIUnavailableError("simulated outage")
            return self._questions(prompt)
        if schema is EvaluationDraft:
            if self.fail_evaluation:
                raise AIUnavailableError("simulated outage")
            return self._evaluation(prompt)
        raise AssertionError(f"unexpected schema {schema}")

    def _questions(self, prompt: str):
        from app.services.ai.question_generator import GeneratedQuestionSet

        count = int(re.search(r"Write (\d+) ", prompt).group(1))
        subject = re.search(r"\((\w+)\)", prompt).group(1)
        items = []
        for i in range(count):
            options = [f"{subject} right {i}", f"{subject} wrong a {i}", f"{subject} wrong b {i}", f"{subject} wrong c {i}"]
            if self.bad_every and i % self.bad_every == 0:
                options[1] = options[0]
            items.append(
                {
                    "topic": f"Topic {i}",
                    "difficulty": self.question_difficulty,
                    "question": f"Generated {subject} question {i} {uuid.uuid4().hex[:6]}?",
                    "options": options,
                    "correct_answer": "A",
                    "explanation": "Because it is right.",
                }
            )
        return GeneratedQuestionSet.model_validate({"questions": items})

    def _evaluation(self, prompt: str):
        from app.services.ai.evaluator import EvaluationDraft

        wrong = [int(n) for n in re.findall(r"^Q(\d+) .*$\n.*\n.*\(incorrect\)", prompt, flags=re.MULTILINE)]
        subject = re.search(r"^Q\d+ \[(\w+) /", prompt, flags=re.MULTILINE).group(1)
        return EvaluationDraft.model_validate(
            {
                "summary": "You did reasonably well.",
                "strengths": ["Fundamentals", "Fundamentals", ""],
                "weak_areas": [{"subject": subject, "topic": "Graphs", "advice": "Practise BFS."}],
                "recommendations": ["Revise graphs."],
                "question_feedback": [{"position": n, "feedback": f"Q{n} was wrong because..."} for n in wrong]
                + [{"position": 999, "feedback": "ignored"}],
            }
        )


@pytest.fixture
def fake_gemini(monkeypatch: pytest.MonkeyPatch) -> FakeGemini:
    from app.core.config import get_settings
    from app.services.ai import gemini

    fake = FakeGemini()
    monkeypatch.setattr(get_settings(), "gemini_api_key", "test-key")
    monkeypatch.setattr(gemini, "generate_structured", fake)
    return fake
