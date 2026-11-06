# AI Interview Coach - Frontend

Next.js 16 (App Router, Cache Components) + TypeScript + Tailwind CSS v4, in a light glassmorphism style. Deployed on Vercel.

## Setup

Requires Node 22 (see `.nvmrc`).

```bash
npm install
cp .env.example .env.local
npm run dev
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the FastAPI backend, e.g. `http://localhost:8000` |

This is the only frontend variable. The Gemini key lives on the backend only; never add it here, since `NEXT_PUBLIC_` values are shipped to the browser.

See [../backend/README.md](../backend/README.md) for the API reference.

## Routes

| Route | Purpose |
|---|---|
| `/` | Landing page: hero, live subject grid, how it works, quick start |
| `/user-details` | Setup step 1: candidate name |
| `/subjects` | Setup step 2: pick one or more subjects |
| `/configure` | Setup step 3: question count and difficulty, then start the interview (Gemini generates the questions) |
| `/interview/[id]` | One question at a time, navigator, submit confirmation, AI or curated source badge |
| `/results/[id]` | Score ring, totals, per-subject breakdown, AI coach report, retry |
| `/review/[id]` | Every question with your answer, the correct answer, the explanation, and a coach note on wrong answers |

The setup draft (name, subjects, count, difficulty) and in-progress answers are kept in `localStorage`, so a refresh doesn't lose progress. The header status pill and the cold-start banner reflect the real `GET /api/health` result, which also reports whether AI is enabled (`useAIEnabled()`). When AI is off or Gemini fails, the UI labels questions as coming from the curated bank and the coach report as rule-based.

## Structure

```
app/                 routes (thin pages that compose feature components)
components/
  ui/                reusable primitives: GlassPanel, Button, Badge, TextField, SegmentedControl,
                     RangeStepper, SelectableCard, Modal, ProgressBar, SectionHeader, Skeleton, ...
  layout/            site chrome: SiteHeader, SiteFooter, HealthPill, ColdStartBanner,
                     WizardStepper, WizardActionBar
  landing/           landing page sections
  setup/             the three setup steps
  subjects/          SubjectCard, SubjectCategorySection
  interview/         OptionList, QuestionCard, QuestionNavigator, QuestionSourceBadge, SubmitConfirmModal, InterviewView
  results/           ScoreRing, StatTile, SubjectBreakdownList, AICoachReport, ReviewItemCard, ResultsView, ReviewView
hooks/               useAsync, useSubjects, useHealth, useInterviewDraft, useInterviewAnswers
services/api.ts      typed fetch client for the backend
types/api.ts         TypeScript mirrors of the backend schemas
lib/                 cn, formatting helpers, subject metadata, localStorage-backed store
```

Glass surfaces come from four Tailwind utilities defined in `app/globals.css`: `glass-deck`, `glass-card`, `glass-capsule`, and `glass-inset`.
