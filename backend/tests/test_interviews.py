from collections import Counter

import pytest

from tests.conftest import wrong_option


def create_interview(client, **overrides):
    payload = {"student_name": "Rahul", "subjects": ["DSA", "PYTHON"], "num_questions": 10}
    payload.update(overrides)
    return client.post("/api/interviews", json=payload)


def answers_for(session, answer_key, wrong_count=0):
    answers = []
    for index, question in enumerate(session["questions"]):
        correct = answer_key[question["id"]]
        selected = wrong_option(correct) if index < wrong_count else correct
        answers.append({"question_id": question["id"], "selected_answer": selected})
    return {"answers": answers}


def test_create_interview_returns_public_questions(client):
    response = create_interview(client, student_name="  Rahul  ")
    assert response.status_code == 201
    body = response.json()

    assert body["student_name"] == "Rahul"
    assert body["status"] == "in_progress"
    assert body["selected_subjects"] == ["DSA", "PYTHON"]
    assert body["difficulty"] == "Mixed"
    assert body["total_questions"] == 10
    assert [q["position"] for q in body["questions"]] == list(range(1, 11))
    assert len({q["id"] for q in body["questions"]}) == 10
    assert all(len(q["options"]) == 4 for q in body["questions"])
    assert all(q["selected_answer"] is None for q in body["questions"])
    assert "correct_answer" not in response.text
    assert "explanation" not in response.text


def test_create_interview_balances_subjects(client):
    body = create_interview(client).json()
    assert Counter(q["subject"] for q in body["questions"]) == {"DSA": 5, "PYTHON": 5}


def test_create_interview_respects_difficulty_and_caps_count(client):
    body = create_interview(client, subjects=["dsa"], difficulty="Hard", num_questions=10).json()
    assert body["total_questions"] == 3
    assert {q["difficulty"] for q in body["questions"]} == {"Hard"}


def test_create_interview_deduplicates_subjects(client):
    body = create_interview(client, subjects=["DSA", "dsa", " DSA "], num_questions=5).json()
    assert body["selected_subjects"] == ["DSA"]


@pytest.mark.parametrize(
    "overrides",
    [
        {"student_name": "   "},
        {"student_name": "x" * 101},
        {"subjects": []},
        {"subjects": ["  "]},
        {"subjects": ["COBOL"]},
        {"num_questions": 0},
        {"num_questions": 51},
        {"difficulty": "Impossible"},
    ],
)
def test_create_interview_validation(client, overrides):
    assert create_interview(client, **overrides).status_code == 422


def test_get_interview_hides_answers(client):
    created = create_interview(client).json()
    response = client.get(f"/api/interviews/{created['id']}")
    assert response.status_code == 200
    assert response.json()["questions"] == created["questions"]
    assert "correct_answer" not in response.text
    assert "explanation" not in response.text


def test_get_unknown_interview_returns_404(client):
    assert client.get("/api/interviews/does-not-exist").status_code == 404


def test_submit_all_correct(client, answer_key):
    session = create_interview(client).json()
    response = client.post(f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key))
    assert response.status_code == 200
    result = response.json()

    assert result["correct_answers"] == 10
    assert result["incorrect_answers"] == 0
    assert result["attempted"] == 10
    assert result["score_display"] == "10/10"
    assert result["percentage"] == 100.0
    assert result["performance_level"] == "Excellent"
    assert {b["subject"]: b["correct"] for b in result["subject_breakdown"]} == {"DSA": 5, "PYTHON": 5}


def test_submit_partial_score(client, answer_key):
    session = create_interview(client).json()
    result = client.post(
        f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key, wrong_count=2)
    ).json()

    assert result["score"] == 8
    assert result["incorrect_answers"] == 2
    assert result["score_display"] == "8/10"
    assert result["percentage"] == 80.0
    assert result["performance_level"] == "Good"


def test_submit_low_score(client, answer_key):
    session = create_interview(client).json()
    result = client.post(
        f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key, wrong_count=6)
    ).json()
    assert result["percentage"] == 40.0
    assert result["performance_level"] == "Needs improvement"


def test_submit_rejects_incomplete_answers(client, answer_key):
    session = create_interview(client).json()
    payload = answers_for(session, answer_key)
    payload["answers"] = payload["answers"][:-1]
    response = client.post(f"/api/interviews/{session['id']}/submit", json=payload)
    assert response.status_code == 422
    assert "1 unanswered" in response.json()["detail"]


def test_submit_rejects_empty_answers(client):
    session = create_interview(client).json()
    response = client.post(f"/api/interviews/{session['id']}/submit", json={"answers": []})
    assert response.status_code == 422


def test_submit_rejects_duplicate_answers(client, answer_key):
    session = create_interview(client).json()
    payload = answers_for(session, answer_key)
    payload["answers"][-1] = payload["answers"][0]
    response = client.post(f"/api/interviews/{session['id']}/submit", json=payload)
    assert response.status_code == 422
    assert "more than once" in response.json()["detail"]


def test_submit_rejects_foreign_question(client, answer_key):
    session = create_interview(client, subjects=["DSA"]).json()
    payload = answers_for(session, answer_key)
    payload["answers"][0]["question_id"] = 9001
    response = client.post(f"/api/interviews/{session['id']}/submit", json=payload)
    assert response.status_code == 422
    assert "9001" in response.json()["detail"]


def test_submit_rejects_invalid_option(client, answer_key):
    session = create_interview(client).json()
    payload = answers_for(session, answer_key)
    payload["answers"][0]["selected_answer"] = "E"
    assert client.post(f"/api/interviews/{session['id']}/submit", json=payload).status_code == 422


def test_submit_unknown_interview_returns_404(client):
    payload = {"answers": [{"question_id": 1001, "selected_answer": "A"}]}
    assert client.post("/api/interviews/nope/submit", json=payload).status_code == 404


def test_submit_is_idempotent(client, answer_key):
    session = create_interview(client).json()
    first = client.post(f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key))
    second = client.post(
        f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key, wrong_count=10)
    )
    assert second.status_code == 200
    assert second.json() == first.json()


def test_results_and_review_require_submission(client):
    session = create_interview(client).json()
    assert client.get(f"/api/interviews/{session['id']}/results").status_code == 409
    assert client.get(f"/api/interviews/{session['id']}/review").status_code == 409


def test_results_and_review_unknown_interview(client):
    assert client.get("/api/interviews/nope/results").status_code == 404
    assert client.get("/api/interviews/nope/review").status_code == 404


def test_results_and_review_after_submission(client, answer_key):
    session = create_interview(client).json()
    submitted = client.post(
        f"/api/interviews/{session['id']}/submit", json=answers_for(session, answer_key, wrong_count=3)
    ).json()

    results = client.get(f"/api/interviews/{session['id']}/results")
    assert results.status_code == 200
    assert results.json() == submitted

    review = client.get(f"/api/interviews/{session['id']}/review")
    assert review.status_code == 200
    body = review.json()
    assert body["correct_answers"] == 7
    assert body["percentage"] == 70.0
    assert [item["position"] for item in body["items"]] == list(range(1, 11))
    for item in body["items"]:
        assert item["correct_answer"] == answer_key[item["question_id"]]
        assert item["is_correct"] == (item["selected_answer"] == item["correct_answer"])
        assert item["explanation"]
    assert sum(not item["is_correct"] for item in body["items"]) == 3

    fetched = client.get(f"/api/interviews/{session['id']}").json()
    assert fetched["status"] == "completed"
    assert all(q["selected_answer"] for q in fetched["questions"])
