from sqlalchemy import func, select

from app.db.seed import load_questions, seed_database
from app.models import Question


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "ok"


def test_subjects_grouped_with_counts(client):
    response = client.get("/api/subjects")
    assert response.status_code == 200
    body = response.json()

    assert body["total"] == 9
    categories = {c["category"]: c["subjects"] for c in body["categories"]}
    assert list(categories) == [
        "Data Structures & Algorithms",
        "System Design",
        "Programming Languages",
        "Frameworks",
    ]
    assert [s["code"] for s in categories["System Design"]] == ["LLD", "HLD"]

    all_subjects = [s for subjects in categories.values() for s in subjects]
    assert sum(s["total_questions"] for s in all_subjects) == len(load_questions())
    dsa = next(s for s in all_subjects if s["code"] == "DSA")
    assert dsa["difficulty_counts"] == {"Easy": 4, "Medium": 5, "Hard": 3}


def test_question_bank_has_balanced_answer_keys():
    questions = load_questions()
    assert len(questions) == 108
    per_option = {opt: sum(1 for q in questions if q.correct_answer == opt) for opt in "ABCD"}
    assert all(count >= 15 for count in per_option.values()), per_option


def test_seed_is_idempotent(db):
    seed_database(db)
    seed_database(db)
    assert db.scalar(select(func.count()).select_from(Question)) == 108


def test_questions_endpoint_filters_and_hides_answers(client):
    response = client.get("/api/questions", params={"subjects": "dsa,PYTHON", "difficulty": "Easy"})
    assert response.status_code == 200
    body = response.json()

    assert body["total"] == 8
    assert {q["subject"] for q in body["questions"]} == {"DSA", "PYTHON"}
    assert {q["difficulty"] for q in body["questions"]} == {"Easy"}
    assert "correct_answer" not in response.text
    assert "explanation" not in response.text


def test_questions_endpoint_limit(client):
    response = client.get("/api/questions", params={"subjects": "REACT", "limit": 3})
    assert response.status_code == 200
    assert len(response.json()["questions"]) == 3


def test_questions_endpoint_rejects_unknown_subject(client):
    response = client.get("/api/questions", params={"subjects": "DSA,COBOL"})
    assert response.status_code == 422
    assert "COBOL" in response.json()["detail"]


def test_cors_allows_configured_origin(client):
    response = client.options(
        "/api/subjects",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:3000"


def test_cors_rejects_unknown_origin(client):
    response = client.options(
        "/api/subjects",
        headers={"Origin": "https://evil.example.com", "Access-Control-Request-Method": "GET"},
    )
    assert "access-control-allow-origin" not in response.headers
