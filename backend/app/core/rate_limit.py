"""Per-user limits on the endpoints that call the LLM, counted in Redis."""

import logging
import math
import time
from functools import lru_cache
from typing import Callable, Tuple

import redis
from fastapi import Depends, HTTPException, status

from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

HOUR = 3600
# After Redis fails, skip the checks for a while instead of waiting on it every request
REDIS_RETRY_SECONDS = 30

_redis_down_until = 0.0


@lru_cache(maxsize=1)
def _client() -> redis.Redis:
    return redis.Redis.from_url(
        settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1
    )


def _count_request(key: str, window_seconds: int) -> Tuple[int, int]:
    """Add one request to the current window; return (count, seconds left)."""
    pipe = _client().pipeline()
    pipe.set(key, 0, ex=window_seconds, nx=True)
    pipe.incr(key)
    pipe.ttl(key)
    _, count, ttl = pipe.execute()
    return count, ttl


def _wait_text(seconds: int) -> str:
    minutes = max(1, math.ceil(seconds / 60))
    return f"{minutes} minute{'' if minutes == 1 else 's'}"


def rate_limit(
    name: str, limit: int, window_seconds: int, message: str
) -> Callable[..., User]:
    """A dependency that allows each user `limit` requests per window, then 429s."""

    def check(current_user: User = Depends(get_current_user)) -> User:
        global _redis_down_until
        if not settings.RATE_LIMIT_ENABLED or time.monotonic() < _redis_down_until:
            return current_user

        try:
            count, ttl = _count_request(
                f"ratelimit:{name}:{current_user.id}", window_seconds
            )
        except redis.RedisError as e:
            _redis_down_until = time.monotonic() + REDIS_RETRY_SECONDS
            logger.warning(
                f"Rate limits skipped for {REDIS_RETRY_SECONDS}s, Redis unavailable: {e}"
            )
            return current_user

        if count > limit:
            retry_after = ttl if ttl > 0 else window_seconds
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=message.format(wait=_wait_text(retry_after)),
                headers={"Retry-After": str(retry_after)},
            )
        return current_user

    return check


limit_resume_upload = rate_limit(
    "resume_upload",
    limit=10,
    window_seconds=HOUR,
    message="You've uploaded a lot of resumes recently. Please try again in {wait}.",
)
limit_interview_write = rate_limit(
    "interview_write",
    limit=30,
    window_seconds=HOUR,
    message="You've created or edited a lot of interviews recently. "
    "Please try again in {wait}.",
)
limit_session_start = rate_limit(
    "session_start",
    limit=15,
    window_seconds=HOUR,
    message="You've started a lot of interviews recently. Please try again in {wait}.",
)
limit_answer_submit = rate_limit(
    "answer_submit",
    limit=150,
    window_seconds=HOUR,
    message="You've submitted a lot of answers in the last hour. Please try again "
    "in {wait}. Your answer is still here.",
)
