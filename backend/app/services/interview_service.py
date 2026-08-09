"""Interview orchestration service.

Handles the business logic for starting and continuing interviews.

The service uses an LLM-backed client to generate adaptive questions and
structured feedback. When no API key is configured the LLM service falls
back to a deterministic rule-based generator, keeping the application fully
functional offline.
"""

from __future__ import annotations

import logging

from app.config import settings
from app.models.candidate import Candidate
from app.models.interview import Feedback, InterviewResponse
from app.models.session import InterviewSession
from app.services import llm_service
from app.services.session_service import SessionManager

logger = logging.getLogger(__name__)

# Default welcome reply required by the technical specification.
WELCOME_REPLY = "Welcome. Let's begin your interview."

# Day on which to start the interview questions (from the candidate's profile).
FIRST_QUESTION_DAY = 7

# Message marker for the interviewer's welcome line.
ROLE_INTERVIEWER = "interviewer"
ROLE_CANDIDATE = "candidate"


def _format_candidate_profile(candidate: Candidate) -> str:
    member = candidate.member
    return (
        f"{member.name}, {member.jobRole} with {member.yearsExperience} years of "
        f"experience (education: {member.education}). "
        f"Completed {candidate.signals.missionsCompleted} missions across "
        f"{candidate.signals.commitDays} commit days, with "
        f"{candidate.signals.missionsFirstTry} passed on the first try."
    )


def _history_for_llm(session: InterviewSession) -> list[dict[str, str]]:
    """Convert the session's conversation history to an LLM-friendly list."""
    return [
        {"role": "assistant" if m.role == ROLE_INTERVIEWER else "user", "content": m.content}
        for m in session.history
    ]


def start_interview(
    session_id: str,
    candidate: Candidate,
    manager: SessionManager,
) -> InterviewResponse:
    """Start a new interview session and ask the first question.

    Creates the session, records the spec-compliant welcome message, and
    generates the first question from the candidate's profile.
    """
    manager.create_session(candidate, session_id=session_id)
    manager.add_message(session_id, ROLE_INTERVIEWER, WELCOME_REPLY)

    session = manager.get_session(session_id)
    profile = _format_candidate_profile(candidate)
    opening = llm_service.generate_start_message(profile, _history_for_llm(session))

    # Record the generated first question in the conversation and question log.
    manager.add_message(session_id, ROLE_INTERVIEWER, opening)
    manager.add_question(session_id, day=FIRST_QUESTION_DAY, question=opening)

    return InterviewResponse(reply=opening, done=False)


def continue_interview(
    session_id: str,
    message: str,
    manager: SessionManager,
) -> InterviewResponse:
    """Process a follow-up turn in an existing interview.

    Records the candidate's answer, optionally generates feedback, and
    returns either the next question or a completed response.
    """
    session = manager.get_session(session_id)

    # Record the candidate's answer.
    manager.add_message(session_id, ROLE_CANDIDATE, message)
    manager.record_answer(session_id)

    turns = session.progress.questionsAnswered
    max_turns = settings.interview_turns_before_feedback

    if turns >= max_turns:
        # Interview complete — generate structured feedback and mark done.
        history = _history_for_llm(session)
        profile = _format_candidate_profile(session.candidate)
        fb = llm_service.generate_feedback(profile, history, turns)
        feedback = Feedback(
            summary=fb.get("summary", ""),
            strengths=fb.get("strengths", []),
            gaps=fb.get("gaps", []),
            next=fb.get("next", []),
        )
        manager.complete_session(session_id)
        manager.add_message(session_id, ROLE_INTERVIEWER, "Interview completed.")
        reply = (
            f"Thank you — that completes our interview. I've prepared feedback "
            f"covering {len(feedback.strengths)} strengths, {len(feedback.gaps)} focus "
            "areas, and next steps. You can review it on the feedback page."
        )
        return InterviewResponse(reply=reply, done=True, feedback=feedback)

    # Continue the conversation — generate a follow-up question.
    session = manager.get_session(session_id)
    history = _history_for_llm(session)
    profile = _format_candidate_profile(session.candidate)
    reply = llm_service.generate_follow_up(profile, history)

    manager.add_message(session_id, ROLE_INTERVIEWER, reply)
    return InterviewResponse(reply=reply, done=False)

