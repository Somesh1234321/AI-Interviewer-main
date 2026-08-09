"""Candidate listing API route — GET /api/v1/candidates."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.exceptions import CandidateNotFoundError
from app.models.candidate import Candidate
from app.services.candidate_service import get_candidate_by_id, get_candidates

router = APIRouter(tags=["candidates"])


@router.get("/candidates", response_model=list[Candidate])
def list_candidates() -> list[Candidate]:
    """Return all available candidates for the interview selector."""
    return get_candidates()


@router.get("/candidates/{candidate_id}", response_model=Candidate)
def fetch_candidate(candidate_id: str) -> Candidate:
    """Return a single candidate by ID."""
    try:
        return get_candidate_by_id(candidate_id)
    except CandidateNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

