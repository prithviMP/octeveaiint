# AI Interview Coach

A web platform for practicing technical interview MCQs. Students enter their name, pick one or more subjects, answer a set of questions, and get a scored performance summary with an answer review.

See [docs/PRD.md](docs/PRD.md) for the full product requirements.

## Repository layout

```text
.
├── backend/      FastAPI + SQLAlchemy + SQLite API (deployed on Render)
├── frontend/     Next.js app (deployed on Vercel) - placeholder until designs land
├── docs/PRD.md   Product requirements
└── render.yaml   Render blueprint for the backend
```

## Local development

### Backend

Requires Python 3.12+.

```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --reload
```

The API runs at http://localhost:8000. Interactive docs are at http://localhost:8000/docs.

Run the tests:

```bash
cd backend
pytest
```

### Frontend

Requires Node.js 22+ (pinned in `frontend/.nvmrc`).

```bash
cd frontend
nvm use
npm install
cp .env.example .env.local
npm run dev
```

The app runs at http://localhost:3000.

## API

All endpoints are prefixed with `/api`. Full reference: [backend/README.md](backend/README.md).

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Backend and database health |
| GET | `/api/subjects` | Available subjects with question counts |
| GET | `/api/questions` | Public questions filtered by subject/difficulty |
| POST | `/api/interviews` | Create an interview session |
| GET | `/api/interviews/{id}` | Retrieve a session and its questions |
| POST | `/api/interviews/{id}/submit` | Submit answers and get results |
| GET | `/api/interviews/{id}/results` | Results of a submitted session |
| GET | `/api/interviews/{id}/review` | Answer review with explanations |

Correct answers and explanations are never returned before a session is submitted.

## Deployment

### Backend on Render

1. In Render, choose **New > Blueprint** and connect this GitHub repository. Render reads [render.yaml](render.yaml).
2. Set `CORS_ORIGINS` to your Vercel URL (for example `https://octeveaiint.vercel.app`). Optionally set `CORS_ORIGIN_REGEX` to allow Vercel preview URLs.
3. Deploy. The health check is `/api/health`.

The service uses Render's free plan, whose filesystem is ephemeral. The question bank is re-seeded on every boot, but interview sessions are lost when the service restarts or redeploys. Attach a persistent disk (paid plan) and point `DATABASE_URL` at it, or move to PostgreSQL, if sessions need to survive restarts.

### Frontend on Vercel

1. In Vercel, import this GitHub repository.
2. Set **Root Directory** to `frontend`. The framework preset is detected as Next.js.
3. Add the environment variable `NEXT_PUBLIC_API_URL` with your Render URL (for example `https://ai-interview-coach-api.onrender.com`).
4. Deploy, then add the Vercel URL to `CORS_ORIGINS` on Render.
