import os
import tempfile
from collections.abc import Iterator
from pathlib import Path

# Point the app's global engine at a throwaway file before anything imports app.*
_TMP_DIR = Path(tempfile.mkdtemp(prefix="aic-tests-"))
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DIR / 'global.db'}"
os.environ["CORS_ORIGINS"] = "http://localhost:3000"

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
