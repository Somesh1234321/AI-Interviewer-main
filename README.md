# AI Interview Agent

Monorepo for an AI-powered interview platform.

## Project Structure

```
AI-Interviewer/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── main.py             # Application entry point
│   │   ├── config.py           # Environment & app settings
│   │   ├── routes/             # API route handlers
│   │   ├── services/           # Business logic layer
│   │   ├── models/             # Pydantic schemas & data models
│   │   ├── prompts/            # LLM prompt templates
│   │   └── data/               # Static data, fixtures, seed files
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                   # Next.js (App Router) + Tailwind CSS
│   ├── app/                    # App Router pages & layouts
│   ├── components/
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── layout/             # Layout components (header, footer, etc.)
│   │   └── interview/          # Interview-specific components
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Utilities & API client helpers
│   ├── types/                  # Shared TypeScript types
│   ├── public/                 # Static assets
│   └── .env.example
│
├── PROMPTS.md                  # Prompt design notes
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).  
The backend runs at [http://localhost:8000](http://localhost:8000).

## Deploying the Backend to Render

The backend is provided with Render-ready configuration. The key fix is in
`app/config.py`: the app now reads the platform-injected `PORT` environment
variable, so it binds to whatever port Render assigns (no more
`address already in use` startup crashes).

### Option A — Render Blueprint (recommended, auto-deploys everything)

1. Push this repository to GitHub.
2. In Render, go to **New → Blueprint** and connect your repo.
3. Render picks up `backend/render.yaml`, creates a web service
   (`ai-interviewer-backend`), installs deps, and serves the API.
4. Fill in the required environment variables (Render prompts for them):
   - `OPENAI_API_KEY` — optional. Leave blank to use the built-in
     rule-based fallback (no AI questions).
   - `CORS_ORIGINS` — your deployed frontend URL(s), comma-separated
     (e.g. `https://your-app.vercel.app`).

### Option B — Manual web service

1. In Render, **New → Web Service**, connect your GitHub repo.
2. Set **Root Directory** to `backend`.
3. **Build Command**: `pip install -r requirements.txt`
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Select a free/paid plan. The app auto-reads Render's `PORT`.
6. Add environment variables as above. Deploy.

The API will be reachable at `https://<your-service>.onrender.com`.
Health check: `GET https://<your-service>.onrender.com/api/v1/health`.

### Connecting the Vercel frontend to Render

Deploy the `frontend/` folder to Vercel, then set its env var:

```
NEXT_PUBLIC_API_URL=https://<your-service>.onrender.com
```

Also add your Vercel URL to the backend's `CORS_ORIGINS` so the browser
allows cross-origin API calls.

## Conventions

| Layer | Purpose |
|-------|---------|
| `routes/` | HTTP endpoints — thin handlers that delegate to services |
| `services/` | Business logic, orchestration, external API calls |
| `models/` | Request/response schemas and domain types |
| `prompts/` | Version-controlled LLM prompt templates |
| `data/` | Seed data, fixtures, and static reference files |
| `components/ui/` | Generic, reusable UI building blocks |
| `components/layout/` | Page structure components |
| `components/interview/` | Domain-specific interview UI |
