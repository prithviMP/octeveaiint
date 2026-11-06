# AI Interview Coach - Frontend

Next.js (App Router) + TypeScript + Tailwind CSS. Deployed on Vercel.

This is a placeholder. Pages and components will be built once the UI designs are finalized. The folder layout follows the PRD (section 11.1): `app/`, `components/{ui,interview,subjects,results}`, `services/`, `types/`, `hooks/`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend, e.g. `http://localhost:8000` |

See [../backend/README.md](../backend/README.md) for the API reference.
