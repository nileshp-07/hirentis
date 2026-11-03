import logging
import time
from functools import lru_cache
from typing import Any, Dict, List, Optional, Type, TypeVar

from openai import OpenAI, OpenAIError
from pydantic import BaseModel

from app.ai.llm import tracing
from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)

MAX_LOGGED_ERROR_CHARS = 300


class LLMError(Exception):
    """Raised when an LLM call fails or returns no usable output."""


@lru_cache(maxsize=1)
def get_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise LLMError("OPENAI_API_KEY is not configured.")

    if tracing.is_enabled():
        tracing.instrument_openai()

    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
        max_retries=settings.OPENAI_MAX_RETRIES,
    )


def _log_call(
    purpose: str,
    model: str,
    started: float,
    outcome: str,
    usage: Any = None,
    error: Optional[str] = None,
) -> None:
    """One line per model call: what it was for, how long it took, tokens used."""
    details = getattr(usage, "prompt_tokens_details", None)
    fields = {
        "purpose": purpose,
        "model": model,
        "outcome": outcome,
        "duration_ms": round((time.perf_counter() - started) * 1000),
        "prompt_tokens": getattr(usage, "prompt_tokens", None),
        "cached_tokens": getattr(details, "cached_tokens", None),
        "completion_tokens": getattr(usage, "completion_tokens", None),
    }
    if error:
        fields["error"] = error[:MAX_LOGGED_ERROR_CHARS]

    message = " ".join(f"{k}={v}" for k, v in fields.items() if v is not None)
    level = {"ok": logging.INFO, "error": logging.ERROR}.get(outcome, logging.WARNING)
    logger.log(level, f"llm_call {message}", extra={"event": "llm_call", **fields})


def _trace_kwargs(purpose: str) -> Dict[str, str]:
    return {"name": purpose} if tracing.is_enabled() else {}


def generate_structured(
    messages: List[Dict[str, str]],
    schema: Type[T],
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> T:
    """Call the model with Structured Outputs and return a validated `schema` instance."""
    purpose, model = schema.__name__, model or settings.OPENAI_MODEL
    client = get_client()
    started = time.perf_counter()
    try:
        with tracing.call_attributes(purpose):
            completion = client.chat.completions.parse(
                model=model,
                messages=messages,
                response_format=schema,
                temperature=temperature,
                **_trace_kwargs(purpose),
            )
    except OpenAIError as e:
        _log_call(purpose, model, started, "error", error=str(e))
        raise LLMError(str(e)) from e

    message = completion.choices[0].message
    if message.refusal:
        _log_call(purpose, model, started, "refused", completion.usage, message.refusal)
        raise LLMError(f"Model refused the request: {message.refusal}")
    if message.parsed is None:
        _log_call(purpose, model, started, "empty", completion.usage)
        raise LLMError(f"Model returned no parsable {purpose} output.")

    _log_call(purpose, model, started, "ok", completion.usage)
    return message.parsed


def generate_text(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: Optional[int] = None,
) -> str:
    model = model or settings.OPENAI_MODEL
    client = get_client()
    started = time.perf_counter()
    try:
        with tracing.call_attributes("text"):
            completion = client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                **_trace_kwargs("text"),
            )
    except OpenAIError as e:
        _log_call("text", model, started, "error", error=str(e))
        raise LLMError(str(e)) from e

    content = completion.choices[0].message.content
    if not content:
        _log_call("text", model, started, "empty", completion.usage)
        raise LLMError("Model returned an empty response.")

    _log_call("text", model, started, "ok", completion.usage)
    return content
