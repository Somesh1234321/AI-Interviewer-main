# AI Interview Agent — Implementation TODO

## Backend
- [x] Add `openai` dependency to `requirements.txt`
- [x] Create `backend/app/services/llm_service.py` (OpenAI-compatible client + deterministic fallback)
- [x] Update `backend/app/services/interview_service.py` for LLM-driven interview flow
- [x] Add `GET /api/v1/candidates` endpoint in `backend/app/routes/candidates.py`
- [x] Register candidates router in `backend/app/routes/__init__.py`
- [x] Update backend tests to match new LLM-driven flow (104 tests passing)

## Frontend
- [x] Create `frontend/lib/api.ts` API client helper
- [x] Create `frontend/types/interview.ts` shared types
- [x] Update `frontend/app/interview/page.tsx` with interactive chat UI
- [x] Update `frontend/app/feedback/page.tsx` with feedback display

## Run & Verify
- [x] Install backend deps and run backend tests (104 passed)
- [x] Install frontend deps and type-check (tsc --noEmit passes)
- [x] Fix `Button.tsx` type-narrowing bug (removed build-blocking TS error)
- [x] Start backend server (verified `/api/v1/health` and full interview E2E flow)
- [x] Start frontend dev server (verified `/`, `/interview`, `/feedback` return 200)
- [x] Verify end-to-end flow (interview chat → completion → structured feedback)

