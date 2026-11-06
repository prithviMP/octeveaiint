import logging
from functools import lru_cache

from google import genai
from google.genai import types
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings

logger = logging.getLogger(__name__)


class AIUnavailableError(Exception):
    """Gemini could not produce a usable response. Callers fall back to non-AI behaviour."""


@lru_cache
def _client() -> genai.Client:
    settings = get_settings()
    return genai.Client(
        api_key=settings.gemini_api_key,
        http_options=types.HttpOptions(
            timeout=int(settings.ai_timeout_seconds * 1000),
            retry_options=types.HttpRetryOptions(attempts=2, http_status_codes=[429, 500, 503]),
        ),
    )


def generate_structured[T: BaseModel](prompt: str, schema: type[T], *, system_instruction: str) -> T:
    """Ask Gemini for JSON matching `schema` and return it parsed."""
    settings = get_settings()
    if not settings.ai_enabled:
        raise AIUnavailableError("GEMINI_API_KEY is not configured")

    try:
        response = _client().models.generate_content(
            model=settings.gemini_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=schema,
                thinking_config=types.ThinkingConfig(thinking_level=types.ThinkingLevel.LOW),
            ),
        )
    except Exception as exc:  # network errors, timeouts, and google.genai API errors
        logger.warning("Gemini request failed: %s", exc)
        raise AIUnavailableError(str(exc)) from exc

    parsed = response.parsed
    if isinstance(parsed, schema):
        return parsed
    try:
        return schema.model_validate_json(response.text or "")
    except ValidationError as exc:
        logger.warning("Gemini returned output that does not match %s", schema.__name__)
        raise AIUnavailableError("Gemini returned malformed output") from exc
