import logging
from contextlib import contextmanager, nullcontext
from contextvars import ContextVar
from functools import lru_cache
from typing import Any, ContextManager, Dict, Iterator, Optional

from app.core.config import settings
from app.core.logger import request_id_var

logger = logging.getLogger(__name__)

_trace_owner: ContextVar[Dict[str, Optional[str]]] = ContextVar(
    "llm_trace_owner", default={}
)


def is_enabled() -> bool:
    return bool(settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY)


@lru_cache(maxsize=1)
def get_langfuse() -> Any:
    from langfuse import Langfuse

    return Langfuse(
        public_key=settings.LANGFUSE_PUBLIC_KEY,
        secret_key=settings.LANGFUSE_SECRET_KEY,
        base_url=settings.LANGFUSE_BASE_URL,
        environment=settings.ENV,
    )


def instrument_openai() -> None:
    """Start the Langfuse client and patch the OpenAI library to trace every call."""
    get_langfuse()
    import langfuse.openai  # noqa: F401


@contextmanager
def trace_owner(user_id: Any = None, session_id: Any = None) -> Iterator[None]:
    """Tag the AI calls made inside this block with the user and interview session,
    so Langfuse can group a whole interview across requests and worker tasks."""
    token = _trace_owner.set(
        {
            "user_id": str(user_id) if user_id else None,
            "session_id": str(session_id) if session_id else None,
        }
    )
    try:
        yield
    finally:
        _trace_owner.reset(token)


def call_attributes(purpose: str) -> ContextManager[Any]:
    """Trace attributes for one model call; does nothing when tracing is off."""
    if not is_enabled():
        return nullcontext()

    from langfuse import propagate_attributes

    owner = _trace_owner.get()
    request_id = request_id_var.get()
    return propagate_attributes(
        trace_name=purpose,
        user_id=owner.get("user_id"),
        session_id=owner.get("session_id"),
        metadata={"request_id": request_id} if request_id else None,
    )


def flush() -> None:
    """Send buffered traces; call when the API or a worker process shuts down."""
    if not is_enabled():
        return
    try:
        get_langfuse().flush()
    except Exception as e:
        logger.warning(f"Could not flush Langfuse traces: {e}")
