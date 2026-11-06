# AI Interview Coach - Backend

FastAPI + SQLAlchemy + SQLite REST API for the AI Interview Coach MCQ practice platform.

## Setup

```bash
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

On startup the app creates the tables and upserts the question bank from `app/db/data/`. Run `python -m app.db.seed` to seed manually.

Run tests with `pytest`.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | `development` or `production` |
| `DATABASE_URL` | `sqlite:///./data/app.db` | SQLAlchemy database URL |
| `CORS_ORIGINS` | `http://localhost:3000` | Comma-separated allowed frontend origins |
| `CORS_ORIGIN_REGEX` | unset | Optional regex for extra origins (e.g. Vercel previews) |

## Project structure

```text
app/
├── main.py              App factory, CORS, lifespan (create tables + seed)
├── api/routes/          health, subjects, questions, interviews
├── core/                config, enums, exception handlers
├── models/              SQLAlchemy models
├── schemas/             Pydantic request/response models
├── services/            question, interview, and scoring logic
└── db/
    ├── database.py      Engine, session factory, get_db dependency
    ├── seed.py          Validates and upserts the question bank
    └── data/            subjects.json and questions.json (single source of questions)
```

## Adding questions

Add entries to `app/db/data/questions.json`. Each subject uses its own ID block (DSA 1001+, LLD 2001+, HLD 3001+, PYTHON 4001+, JAVA 5001+, JAVASCRIPT 6001+, REACT 7001+, NEXTJS 8001+, FASTAPI 9001+). The seed validates the file on startup and fails fast on duplicate IDs, unknown subjects, or malformed options.

```json
{
  "id": 1013,
  "subject": "DSA",
  "topic": "Trees",
  "difficulty": "Medium",
  "question": "…",
  "options": ["…", "…", "…", "…"],
  "correct_answer": "B",
  "explanation": "…"
}
```

## API reference

All endpoints are prefixed with `/api`. Errors use the shape `{"detail": "..."}` (validation errors use FastAPI's standard list format).

Correct answers and explanations are only returned by `/submit`, `/results`, and `/review` after the interview is submitted.

### `GET /api/health`

```json
{ "status": "ok", "database": "ok", "environment": "development" }
```

Returns 503 with `"status": "degraded"` if the database is unreachable.

### `GET /api/subjects`

Subjects grouped by category, with question counts.

```json
{
  "total": 9,
  "categories": [
    {
      "category": "Data Structures & Algorithms",
      "subjects": [
        {
          "code": "DSA",
          "name": "Data Structures & Algorithms",
          "category": "Data Structures & Algorithms",
          "total_questions": 12,
          "difficulty_counts": { "Easy": 4, "Medium": 5, "Hard": 3 }
        }
      ]
    }
  ]
}
```

### `GET /api/questions?subjects=DSA,PYTHON&difficulty=Easy&limit=10`

| Query param | Required | Description |
|---|---|---|
| `subjects` | yes | Comma-separated subject codes |
| `difficulty` | no | `Easy`, `Medium`, `Hard`, or `Mixed` (default) |
| `limit` | no | 1-200 |

```json
{
  "total": 1,
  "questions": [
    {
      "id": 1001,
      "subject": "DSA",
      "topic": "Arrays",
      "difficulty": "Easy",
      "question": "What is the time complexity of accessing an element by its index in an array?",
      "options": ["O(1)", "O(log n)", "O(n)", "O(n log n)"]
    }
  ]
}
```

Unknown subject codes return 422.

### `POST /api/interviews` - 201 Created

Request:

```json
{
  "student_name": "Rahul",
  "subjects": ["DSA", "PYTHON"],
  "num_questions": 10,
  "difficulty": "Mixed"
}
```

- `student_name`: required, trimmed, 1-100 characters.
- `subjects`: at least one valid subject code (case-insensitive, duplicates removed).
- `num_questions`: 1-50, default 10. If fewer questions match the filters, the session uses all of them (`total_questions` reflects the real count).
- `difficulty`: `Easy`, `Medium`, `Hard`, or `Mixed` (default).

Questions are picked randomly and spread evenly across the selected subjects.

Response:

```json
{
  "id": "6f1c2a8e-…",
  "student_name": "Rahul",
  "selected_subjects": ["DSA", "PYTHON"],
  "difficulty": "Mixed",
  "total_questions": 10,
  "status": "in_progress",
  "created_at": "2026-11-06T16:20:00Z",
  "submitted_at": null,
  "questions": [
    {
      "id": 1005,
      "subject": "DSA",
      "topic": "Binary Search Tree",
      "difficulty": "Medium",
      "question": "…",
      "options": ["…", "…", "…", "…"],
      "position": 1,
      "selected_answer": null
    }
  ]
}
```

### `GET /api/interviews/{id}`

Same shape as the create response. After submission, `status` is `completed` and each question's `selected_answer` is filled in. Returns 404 for an unknown id.

### `POST /api/interviews/{id}/submit`

Request:

```json
{
  "answers": [
    { "question_id": 1005, "selected_answer": "B" }
  ]
}
```

Every question in the session must be answered exactly once with `A`-`D`. Missing, duplicate, or foreign question IDs return 422. Submitting an already completed interview returns the stored results without rescoring.

Response (`InterviewResult`, also returned by `/results`):

```json
{
  "session_id": "6f1c2a8e-…",
  "student_name": "Rahul",
  "selected_subjects": ["DSA", "PYTHON"],
  "difficulty": "Mixed",
  "total_questions": 10,
  "attempted": 10,
  "correct_answers": 8,
  "incorrect_answers": 2,
  "score": 8,
  "score_display": "8/10",
  "percentage": 80.0,
  "performance_level": "Good",
  "feedback": "Good performance. Review the questions you missed to sharpen your knowledge.",
  "subject_breakdown": [
    { "subject": "DSA", "total": 5, "correct": 4, "percentage": 80.0 },
    { "subject": "PYTHON", "total": 5, "correct": 4, "percentage": 80.0 }
  ],
  "submitted_at": "2026-11-06T16:30:00Z"
}
```

Performance levels: 90%+ Excellent, 75-89% Good, 50-74% Average, below 50% Needs improvement.

### `GET /api/interviews/{id}/results`

Returns `InterviewResult`. 409 if the interview has not been submitted, 404 if unknown.

### `GET /api/interviews/{id}/review`

409 if the interview has not been submitted, 404 if unknown.

```json
{
  "session_id": "6f1c2a8e-…",
  "student_name": "Rahul",
  "total_questions": 10,
  "correct_answers": 8,
  "percentage": 80.0,
  "items": [
    {
      "position": 1,
      "question_id": 1005,
      "subject": "DSA",
      "topic": "Binary Search Tree",
      "difficulty": "Medium",
      "question": "…",
      "options": ["…", "…", "…", "…"],
      "selected_answer": "B",
      "correct_answer": "B",
      "is_correct": true,
      "explanation": "…"
    }
  ]
}
```

## Deployment (Render)

Configured by `render.yaml` at the repo root (root directory `backend`, free plan). The free plan's filesystem is ephemeral: questions are re-seeded on every boot, but interview sessions are lost on restart or redeploy. For durable sessions, attach a persistent disk and set `DATABASE_URL=sqlite:////var/data/app.db`, or migrate to PostgreSQL.
