import logging
from functools import lru_cache
from typing import Dict, List, Optional, Type, TypeVar

from openai import OpenAI, OpenAIError
from pydantic import BaseModel

from app.core.config import settings

logger = logging.getLogger(__name__)

T = TypeVar("T", bound=BaseModel)


class LLMError(Exception):
    """Raised when an LLM call fails or returns no usable output."""


@lru_cache(maxsize=1)
def get_client() -> OpenAI:
    if not settings.OPENAI_API_KEY:
        raise LLMError("OPENAI_API_KEY is not configured.")
    return OpenAI(
        api_key=settings.OPENAI_API_KEY,
        timeout=settings.OPENAI_TIMEOUT_SECONDS,
        max_retries=settings.OPENAI_MAX_RETRIES,
    )


def generate_structured(
    messages: List[Dict[str, str]],
    schema: Type[T],
    model: Optional[str] = None,
    temperature: float = 0.2,
) -> T:
    """Call the model with Structured Outputs and return a validated `schema` instance."""
    try:
        completion = get_client().chat.completions.parse(
            model=model or settings.OPENAI_MODEL,
            messages=messages,
            response_format=schema,
            temperature=temperature,
        )
    except OpenAIError as e:
        logger.error(f"OpenAI structured call failed ({schema.__name__}): {e}")
        raise LLMError(str(e)) from e

    message = completion.choices[0].message
    if message.refusal:
        logger.warning(f"OpenAI refused ({schema.__name__}): {message.refusal}")
        raise LLMError(f"Model refused the request: {message.refusal}")
    if message.parsed is None:
        raise LLMError(f"Model returned no parsable {schema.__name__} output.")

    return message.parsed


def generate_text(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    temperature: float = 0.2,
    max_tokens: Optional[int] = None,
) -> str:
    try:
        completion = get_client().chat.completions.create(
            model=model or settings.OPENAI_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except OpenAIError as e:
        logger.error(f"OpenAI text call failed: {e}")
        raise LLMError(str(e)) from e

    content = completion.choices[0].message.content
    if not content:
        raise LLMError("Model returned an empty response.")
    return content
