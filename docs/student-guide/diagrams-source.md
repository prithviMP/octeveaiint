# Diagram sources (Mermaid)

The guide embeds these as pre-rendered SVGs. To change a diagram, edit it here, render it at https://mermaid.live, and replace the matching SVG in index.html.

## The full pipeline

```mermaid
flowchart TD
  A["ChatGPT<br/>research the idea"] --> B["PRD.md<br/>what to build"]
  B --> C["Cursor · Plan mode<br/>plan the backend"]
  C --> D["Cursor · Agent<br/>build backend + tests"]
  D --> E["GitHub<br/>store the code"]
  B -.-> F["Cursor<br/>write a Stitch prompt"]
  F --> G["Google Stitch<br/>generate screen designs"]
  G --> H["Cursor · Plan + Agent<br/>build the frontend"]
  H --> E
  E --> I["Render<br/>runs the backend"]
  E --> J["Vercel<br/>runs the frontend"]
  K["Connectors (MCP)<br/>let Cursor control Render + Vercel"] -.-> I
  K -.-> J
  L["Gemini API<br/>AI questions + feedback"] -.-> I
```

## How the live app works

```mermaid
flowchart LR
  U["Student's browser"] -->|"opens the website"| V["Vercel<br/>Next.js frontend<br/>(the screens)"]
  V -->|"asks for questions,<br/>sends answers"| R["Render<br/>FastAPI backend<br/>(the brain)"]
  R --> DB[("SQLite database<br/>108 questions")]
  R -.->|"Part 10"| G["Google Gemini<br/>generates questions<br/>and feedback"]
```

## Which mode should I use?

```mermaid
flowchart LR
  S(["What do you want?"]) --> Q1{"Change any code<br/>or files?"}
  Q1 -->|"No, just understand<br/>or learn"| ASK["Ask mode"]
  Q1 -->|Yes| Q2{"Is something broken<br/>and you don't know why?"}
  Q2 -->|Yes| DBG["Debug mode"]
  Q2 -->|No| Q3{"Is it a big feature,<br/>many files, or<br/>you're unsure how?"}
  Q3 -->|Yes| PLAN["Plan mode<br/>then click Build"]
  Q3 -->|"No, small and clear"| AG["Agent mode"]
```

## The Plan → Build loop

```mermaid
sequenceDiagram
  actor You
  participant P as Cursor (Plan mode)
  participant A as Cursor (Agent, building)
  You->>P: Describe what you want + attach PRD/designs
  P->>P: Reads your files and docs
  P->>You: Clarifying questions (multiple choice)
  You->>P: Pick answers
  P->>You: Plan file with a to-do list
  You->>You: Read it. Ask for changes if needed
  You->>A: Click Build
  A->>A: Works through each to-do, runs tests
  A->>You: Summary of what was built
```

## How code travels from your laptop to the internet

```mermaid
flowchart LR
  L["Your laptop<br/>project folder"] -->|"git commit<br/>(save a snapshot)"| L2["Local history"]
  L2 -->|"git push<br/>(upload)"| GH["GitHub<br/>repository"]
  GH -->|"auto-deploy<br/>backend/ folder"| R["Render"]
  GH -->|"auto-deploy<br/>frontend/ folder"| V["Vercel"]
```

## Design loop

```mermaid
flowchart LR
  C["Cursor<br/>knows your API"] -->|"writes"| P["Stitch prompt"]
  P --> S["Google Stitch"]
  I["Reference image<br/>(the look you like)"] --> S
  S -->|"export"| F["Folder:<br/>screen.png + code.html<br/>+ DESIGN.md"]
  F -->|"@ attach"| C2["Cursor builds<br/>the real frontend"]
```

## What a connector does

```mermaid
flowchart LR
  Y["You<br/>'deploy my backend'"] --> C["Cursor agent"]
  C <-->|"tools: create service,<br/>set env vars, read logs"| M1["Render MCP"]
  C <-->|"tools: create project,<br/>deploy, read logs"| M2["Vercel MCP"]
  M1 <--> RA["Your Render account"]
  M2 <--> VA["Your Vercel account"]
```

## The order of deployment (the chicken-and-egg problem)

```mermaid
sequenceDiagram
  participant C as Cursor
  participant R as Render (backend)
  participant V as Vercel (frontend)
  C->>R: 1. Deploy backend from render.yaml (free plan)
  R-->>C: Backend URL: ...onrender.com
  C->>V: 2. Create project, root folder = frontend
  C->>V: 3. Set NEXT_PUBLIC_API_URL = backend URL
  C->>V: 4. Deploy
  V-->>C: Frontend URL: ...vercel.app
  C->>R: 5. Set CORS_ORIGINS = frontend URL, redeploy
  Note over R,V: Now the frontend can talk to the backend
```


(The "Where each setting is stored" diagram is plain HTML in index.html, not Mermaid.)
