import random
from collections import Counter

from sqlalchemy import select

from app.core.enums import DifficultyFilter
from app.models import Question
from app.models.question import AI_QUESTION_ID_START
from app.services.ai.question_generator import GeneratedQuestion, _clean
from tests.conftest import wrong_option


def create_interview(client, **overrides):
    payload = {"student_name": "Rahul Sharma", "subjects": ["DSA", "PYTHON"], "num_questions": 6}
    payload.update(overrides)
    response = client.post("/api/interviews", json=payload)
    assert response.status_code == 201, response.text
    return response.json()


def answer_key(session_factory, session):
    ids = [q["id"] for q in session["questions"]]
    with session_factory() as db:
        return {q.id: q.correct_answer for q in db.scalars(select(Question).where(Question.id.in_(ids)))}


def submit(client, session_factory, session, wrong_count=0):
    key = answer_key(session_factory, session)
    answers = [
        {"question_id": q["id"], "selected_answer": wrong_option(key[q["id"]]) if i < wrong_count else key[q["id"]]}
        for i, q in enumerate(session["questions"])
    ]
    response = client.post(f"/api/interviews/{session['id']}/submit", json={"answers": answers})
    assert response.status_code == 200, response.text
    return response.json()


def test_health_reports_ai_flag(client, fake_gemini):
    assert client.get("/api/health").json()["ai"] == "enabled"


def test_health_reports_ai_disabled_without_key(client):
    assert client.get("/api/health").json()["ai"] == "disabled"


def test_ai_generation_creates_ai_session(client, session_factory, fake_gemini):
    session = create_interview(client)

    assert session["question_source"] == "ai"
    assert session["total_questions"] == 6
    assert all(q["id"] >= AI_QUESTION_ID_START for q in session["questions"])
    assert Counter(q["subject"] for q in session["questions"]) == {"DSA": 3, "PYTHON": 3}
    assert "correct_answer" not in str(session)

    result = submit(client, session_factory, session)
    assert result["score"] == 6


def test_ai_ids_keep_increasing_across_sessions(client, fake_gemini):
    first = {q["id"] for q in create_interview(client)["questions"]}
    second = {q["id"] for q in create_interview(client)["questions"]}
    assert not first & second
    assert min(second) > max(first)


def test_invalid_items_are_topped_up_from_bank(client, fake_gemini):
    fake_gemini.bad_every = 2
    session = create_interview(client)

    assert session["question_source"] == "mixed"
    assert session["total_questions"] == 6
    ids = [q["id"] for q in session["questions"]]
    assert any(i >= AI_QUESTION_ID_START for i in ids)
    assert any(i < AI_QUESTION_ID_START for i in ids)
    assert Counter(q["subject"] for q in session["questions"]) == {"DSA": 3, "PYTHON": 3}


def test_difficulty_mismatch_is_rejected(client, fake_gemini):
    fake_gemini.question_difficulty = "Easy"
    session = create_interview(client, subjects=["DSA"], difficulty="Hard", num_questions=3)

    assert session["question_source"] == "bank"
    assert {q["difficulty"] for q in session["questions"]} == {"Hard"}


def test_falls_back_to_bank_when_gemini_fails(client, fake_gemini):
    fake_gemini.fail_questions = True
    session = create_interview(client)

    assert session["question_source"] == "bank"
    assert session["total_questions"] == 6
    assert all(q["id"] < AI_QUESTION_ID_START for q in session["questions"])


def test_uses_bank_without_calling_gemini_when_disabled(client, monkeypatch):
    from app.services.ai import gemini

    def boom(*_args, **_kwargs):
        raise AssertionError("Gemini should not be called")

    monkeypatch.setattr(gemini, "generate_structured", boom)
    session = create_interview(client)
    assert session["question_source"] == "bank"


def test_subject_counts_exclude_ai_questions(client, fake_gemini):
    before = client.get("/api/subjects").json()
    create_interview(client, num_questions=10)
    after = client.get("/api/subjects").json()
    assert after == before


def test_clean_shuffles_options_and_keeps_correct_answer():
    item = GeneratedQuestion(
        topic="Stacks",
        difficulty="Easy",
        question="Which structure is LIFO?",
        options=["A) Queue", "B. Stack", "Heap", "Tree"],
        correct_answer="B",
        explanation="Stacks pop the newest item first.",
    )
    letters = set()
    for seed in range(20):
        question = _clean(item, "DSA", DifficultyFilter.MIXED, random.Random(seed))
        assert question is not None
        assert question.options[ord(question.correct_answer) - ord("A")] == "Stack"
        assert "Queue" in question.options
        letters.add(question.correct_answer)
    assert len(letters) > 1


def test_clean_rejects_duplicate_options():
    item = GeneratedQuestion(
        topic="Stacks",
        difficulty="Easy",
        question="Which structure is LIFO?",
        options=["Stack", "stack", "Heap", "Tree"],
        correct_answer="A",
        explanation="Stacks pop the newest item first.",
    )
    assert _clean(item, "DSA", DifficultyFilter.MIXED, random.Random(0)) is None


def test_evaluation_requires_submission(client, fake_gemini):
    session = create_interview(client)
    assert client.get(f"/api/interviews/{session['id']}/evaluation").status_code == 409


def test_evaluation_is_generated_once_and_cached(client, session_factory, fake_gemini):
    session = create_interview(client)
    submit(client, session_factory, session, wrong_count=2)
    wrong_ids = {q["id"] for q in session["questions"][:2]}

    first = client.get(f"/api/interviews/{session['id']}/evaluation").json()
    assert first["source"] == "ai"
    assert first["strengths"] == ["Fundamentals"]
    assert {f["question_id"] for f in first["question_feedback"]} == wrong_ids
    assert first["weak_areas"][0]["topic"] == "Graphs"

    calls = fake_gemini.calls.count("EvaluationDraft")
    second = client.get(f"/api/interviews/{session['id']}/evaluation").json()
    assert second == first
    assert fake_gemini.calls.count("EvaluationDraft") == calls

    review = client.get(f"/api/interviews/{session['id']}/review").json()
    feedback = {item["question_id"]: item["ai_feedback"] for item in review["items"]}
    assert all(feedback[qid] for qid in wrong_ids)
    assert all(feedback[qid] is None for qid in feedback if qid not in wrong_ids)


def test_evaluation_falls_back_without_caching(client, session_factory, fake_gemini):
    session = create_interview(client)
    submit(client, session_factory, session, wrong_count=3)

    fake_gemini.fail_evaluation = True
    fallback = client.get(f"/api/interviews/{session['id']}/evaluation").json()
    assert fallback["source"] == "rule_based"
    assert fallback["summary"]
    assert fallback["weak_areas"]
    assert fallback["question_feedback"] == []

    fake_gemini.fail_evaluation = False
    assert client.get(f"/api/interviews/{session['id']}/evaluation").json()["source"] == "ai"


def test_rule_based_evaluation_when_ai_disabled(client, session_factory):
    session = create_interview(client)
    submit(client, session_factory, session)
    evaluation = client.get(f"/api/interviews/{session['id']}/evaluation").json()
    assert evaluation["source"] == "rule_based"
    assert evaluation["weak_areas"] == []
    assert len(evaluation["strengths"]) == 2
