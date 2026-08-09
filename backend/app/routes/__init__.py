from fastapi import APIRouter

from app.routes import candidates, health, interviews

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(candidates.router)

# The interview router is mounted directly at /api in main.py
# (not under the /api/v1 prefix) to match the technical specification.
