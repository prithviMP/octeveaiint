import random
from collections import defaultdict

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.enums import Difficulty, DifficultyFilter, QuestionSource
from app.core.exceptions import InvalidRequestError
from app.models import Question, Subject
from app.schemas.question import QuestionList, QuestionPublic, SubjectCategory, SubjectList, SubjectOut


def list_subjects(db: Session) -> SubjectList:
    subjects = db.scalars(select(Subject).order_by(Subject.display_order)).all()

    counts: dict[str, dict[str, int]] = defaultdict(lambda: {d.value: 0 for d in Difficulty})
    rows = db.execute(
        select(Question.subject, Question.difficulty, func.count())
        .where(Question.source == QuestionSource.BANK)
        .group_by(Question.subject, Question.difficulty)
    ).all()
    for subject_code, difficulty, count in rows:
        counts[subject_code][difficulty] = count

    categories: dict[str, list[SubjectOut]] = {}
    for subject in subjects:
        difficulty_counts = counts[subject.code]
        categories.setdefault(subject.category, []).append(
            SubjectOut(
                code=subject.code,
                name=subject.name,
                category=subject.category,
                total_questions=sum(difficulty_counts.values()),
                difficulty_counts=difficulty_counts,
            )
        )

    return SubjectList(
        total=len(subjects),
        categories=[SubjectCategory(category=name, subjects=items) for name, items in categories.items()],
    )


def validate_subject_codes(db: Session, codes: list[str]) -> list[str]:
    normalized = list(dict.fromkeys(code.strip().upper() for code in codes if code.strip()))
    if not normalized:
        raise InvalidRequestError("Select at least one subject")

    known = set(db.scalars(select(Subject.code).where(Subject.code.in_(normalized))).all())
    unknown = [code for code in normalized if code not in known]
    if unknown:
        raise InvalidRequestError(f"Unknown subject(s): {', '.join(unknown)}")
    return normalized


def _filtered_query(subjects: list[str], difficulty: DifficultyFilter):
    query = select(Question).where(Question.subject.in_(subjects), Question.source == QuestionSource.BANK)
    if difficulty != DifficultyFilter.MIXED:
        query = query.where(Question.difficulty == difficulty.value)
    return query


def list_public_questions(
    db: Session, subjects: list[str], difficulty: DifficultyFilter, limit: int | None
) -> QuestionList:
    query = _filtered_query(subjects, difficulty).order_by(Question.subject, Question.id)
    if limit is not None:
        query = query.limit(limit)
    questions = db.scalars(query).all()
    return QuestionList(total=len(questions), questions=[QuestionPublic.from_model(q) for q in questions])


def spread_counts(subjects: list[str], count: int, rng: random.Random | None = None) -> dict[str, int]:
    """Split `count` as evenly as possible across subjects; the remainder goes to randomly chosen subjects."""
    rng = rng or random.Random()
    base, remainder = divmod(count, len(subjects))
    extra = set(rng.sample(subjects, remainder))
    return {code: base + (1 if code in extra else 0) for code in subjects}


def select_questions(
    db: Session,
    subjects: list[str],
    difficulty: DifficultyFilter,
    count: int,
    rng: random.Random | None = None,
    exclude_ids: set[int] | None = None,
) -> list[Question]:
    """Randomly pick up to `count` bank questions, spread as evenly as possible across subjects."""
    rng = rng or random.Random()

    pools: dict[str, list[Question]] = defaultdict(list)
    for question in db.scalars(_filtered_query(subjects, difficulty)).all():
        if exclude_ids and question.id in exclude_ids:
            continue
        pools[question.subject].append(question)

    if not pools:
        raise InvalidRequestError("No questions are available for the selected subjects and difficulty")

    for pool in pools.values():
        rng.shuffle(pool)

    subject_order = [code for code in subjects if code in pools]
    rng.shuffle(subject_order)

    selected: list[Question] = []
    while len(selected) < count and any(pools[code] for code in subject_order):
        for code in subject_order:
            if pools[code] and len(selected) < count:
                selected.append(pools[code].pop())

    rng.shuffle(selected)
    return selected
