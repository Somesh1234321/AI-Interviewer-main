"""LLM integration service.

Provides an OpenAI-compatible chat client used to generate interview
questions, evaluate answers, and produce structured feedback.

When no ``OPENAI_API_KEY`` is configured, the service transparently falls
back to a deterministic rule-based generator so the application remains
fully functional in local/offline development environments.
"""

from __future__ import annotations

import logging
from typing import Any

from app.config import settings

logger = logging.getLogger(__name__)

DEFAULT_SYSTEM_PROMPT = (
    "You are an expert technical interviewer conducting a structured, "
    "conversational interview. Ask one focused question at a time. Adapt "
    "follow-up questions based on the candidate's background and prior "
    "answers. Be professional, encouraging, and concise."
)


class LLMUnavailableError(RuntimeError):
    """Raised when no LLM backend (API or fallback) is available."""


def _has_api_key() -> bool:
    return bool(settings.openai_api_key)


def _openai_client() -> Any:
    """Build an OpenAI-compatible client from the current settings."""
    try:
        from openai import OpenAI
    except ImportError as exc:  # pragma: no cover - hard dependency
        raise LLMUnavailableError(
            "The 'openai' package is not installed. Run: pip install openai"
        ) from exc

    kwargs: dict[str, Any] = {"api_key": settings.openai_api_key}
    if settings.openai_api_base:
        kwargs["base_url"] = settings.openai_api_base
    return OpenAI(**kwargs)


def _chat_completion(messages: list[dict[str, str]]) -> str:
    """Perform a chat completion and return the assistant's message."""
    client = _openai_client()
    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=settings.llm_temperature,
        timeout=settings.llm_request_timeout,
    )
    content = response.choices[0].message.content
    if not content:
        raise LLMUnavailableError("The LLM returned an empty response.")
    return content.strip()


# ---------------------------------------------------------------------------
# Rule-based fallback used when no API key is configured.
# ---------------------------------------------------------------------------

_FALLBACK_QUESTIONS = [
    "Can you tell me about your most relevant professional experience and how it maps to this role?",
    "Walk me through a recent project where you had to make a significant technical decision. What trade-offs did you consider?",
    "How do you approach breaking down a large, ambiguous problem into manageable pieces?",
    "Describe a time you received critical feedback or faced a setback. How did you respond and grow?",
    "What emerging technology or skill are you most excited to learn next, and why?",
]

_FALLBACK_FOLLOW_UPS = [
    "That's helpful. Could you elaborate on how you prioritized your actions there?",
    "Interesting. What was the most challenging part of that approach, and how did you handle it?",
    "Thanks for sharing. How would you apply that experience in a new team environment?",
    "I appreciate the detail. What would you do differently if you faced a similar situation again?",
    "Great answer. Can you give a concrete example of the outcome or impact of that decision?",
]

_FALLBACK_STRENGTH_POOL = [
    "Clear and structured communication",
    "Good technical depth and domain awareness",
    "Ability to articulate decisions with trade-offs",
    "Strong problem-solving mindset",
    "Thoughtful reflection on past experience",
]

_FALLBACK_GAP_POOL = [
    "Could provide more specific metrics or measurable outcomes",
    "Consider adding more concrete technical examples",
    "Try to be more concise while keeping key details",
    "Explore connecting answers to the target role more explicitly",
    "Could go deeper on how you'd collaborate in a team setting",
]

_FALLBACK_NEXT_POOL = [
    "Practice telling a STAR-structured story for each major project",
    "Prepare concrete metrics (time saved, scale, performance gains) for key achievements",
    "Rehearse a concise 90-second professional introduction",
    "Research the company's tech stack and align answers to it",
    "Prepare thoughtful questions to ask the interviewer at the end",
]


def _fallback_start_message(candidate_profile: str) -> str:
    return (
        f"Welcome! I've reviewed your profile as {candidate_profile or 'a candidate'}.\n\n"
        "Let's begin your interview. I'll ask a series of questions one at a time and "
        "give you structured feedback at the end.\n\n"
        f"{_FALLBACK_QUESTIONS[0]}"
    )


def _fallback_continue_reply(answer: str, turn_count: int) -> str:
    if len(answer.strip()) < 15:
        return (
            "Thanks for sharing. Could you expand a little more with a specific example "
            "or situation you've encountered recently?"
        )
    idx = turn_count % len(_FALLBACK_FOLLOW_UPS)
    return _FALLBACK_FOLLOW_UPS[idx]


def _fallback_feedback(candidate_profile: str, turns: int) -> dict[str, Any]:
    return {
        "summary": (
            f"You completed a {turns}-turn interview for {candidate_profile or 'the target role'} "
            "and showed solid communication throughout. Overall your responses were "
            "relevant and thoughtful."
        ),
        "strengths": list(_FALLBACK_STRENGTH_POOL[: max(2, turns)]),
        "gaps": list(_FALLBACK_GAP_POOL[: max(2, turns)]),
        "next": list(_FALLBACK_NEXT_POOL[: max(2, turns)]),
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def generate_start_message(candidate_profile: str, history: list[dict[str, str]]) -> str:
    """Generate a welcome message and first interview question."""
    if not _has_api_key():
        logger.info("No OPENAI_API_KEY set — using fallback start message.")
        return _fallback_start_message(candidate_profile)

    system_prompt = (
        "You are starting a technical interview. Use the candidate profile to tailor "
        "your opening. Return ONLY the interviewer's opening message including the "
        "first interview question. Keep it under 3 sentences."
    )
    msgs = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"Candidate profile: {candidate_profile}",
        },
    ]
    try:
        return _chat_completion(msgs)
    except Exception as exc:  # pragma: no cover - depends on external API
        logger.warning("LLM start generation failed (%s); using fallback.", exc)
        return _fallback_start_message(candidate_profile)


def generate_follow_up(
    candidate_profile: str,
    history: list[dict[str, str]],
) -> str:
    """Generate the next interviewer question/follow-up based on conversation history."""
    if not _has_api_key():
        logger.info("No OPENAI_API_KEY set — using fallback follow-up.")
        last_answer = history[-1]["content"] if history else ""
        return _fallback_continue_reply(last_answer, len(history))

    system_prompt = (
        "You are a technical interviewer. Review the conversation history and produce "
        "the next single follow-up question. Acknowledge the candidate briefly and ask "
        "one focused follow-up that probes deeper. Return ONLY the interviewer message."
    )
    msgs: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Candidate profile: {candidate_profile}"},
    ]
    msgs.extend(history[-8:])
    try:
        return _chat_completion(msgs)
    except Exception as exc:  # pragma: no cover - depends on external API
        logger.warning("LLM follow-up generation failed (%s); using fallback.", exc)
        last_answer = history[-1]["content"] if history else ""
        return _fallback_continue_reply(last_answer, len(history))


def generate_feedback(
    candidate_profile: str,
    history: list[dict[str, str]],
    turns: int,
) -> dict[str, Any]:
    """Generate structured interview feedback.

    Returns a dict matching the ``Feedback`` model: summary, strengths,
    gaps, next.
    """
    if not _has_api_key():
        logger.info("No OPENAI_API_KEY set — using fallback feedback.")
        return _fallback_feedback(candidate_profile, turns)

    system_prompt = (
        "You are an interview coach. Based on the candidate profile and the full "
        "conversation history, produce concise, actionable feedback. Respond with "
        "strict JSON in this shape (no markdown): "
        '{"summary": string, "strengths": [string], "gaps": [string], "next": [string]}'
    )
    msgs: list[dict[str, str]] = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Candidate profile: {candidate_profile}"},
    ]
    msgs.extend(history)
    msgs.append(
        {
            "role": "user",
            "content": "Return the JSON feedback now.",
        }
    )
    try:
        raw = _chat_completion(msgs)
        import json

        parsed = json.loads(raw)
        return {
            "summary": str(parsed.get("summary", "")),
            "strengths": [str(s) for s in parsed.get("strengths", [])],
            "gaps": [str(g) for g in parsed.get("gaps", [])],
            "next": [str(n) for n in parsed.get("next", [])],
        }
    except Exception as exc:  # pragma: no cover - depends on external API
        logger.warning("LLM feedback generation failed (%s); using fallback.", exc)
        return _fallback_feedback(candidate_profile, turns)

