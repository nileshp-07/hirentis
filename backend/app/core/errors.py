import logging
from typing import Any, Mapping, Optional

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError, TimeoutError as PoolTimeoutError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.ai.llm.openai_client import LLMError

logger = logging.getLogger(__name__)

STATUS_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    422: "validation_error",
    429: "rate_limited",
    500: "internal_error",
    502: "ai_unavailable",
    503: "service_unavailable",
}

# Where FastAPI found the bad value; not a field name the user would recognise
REQUEST_PARTS = {"body", "query", "path", "header", "cookie"}


def _error(
    status_code: int,
    detail: str,
    headers: Optional[Mapping[str, str]] = None,
    **extra: Any,
) -> JSONResponse:
    code = STATUS_CODES.get(status_code, "error")
    return JSONResponse(
        status_code=status_code,
        content={"detail": detail, "code": code, **extra},
        headers=dict(headers) if headers else None,
    )


def _readable(error: dict) -> str:
    message = error.get("msg", "Invalid value").removeprefix("Value error, ")
    field = next(
        (
            part
            for part in reversed(error.get("loc", ()))
            if isinstance(part, str) and part not in REQUEST_PARTS
        ),
        None,
    )
    if field is None:
        return message
    return f"{field.replace('_', ' ').capitalize()}: {message}"


async def _http_error(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return _error(exc.status_code, str(exc.detail), headers=exc.headers)


async def _validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    errors = exc.errors()
    detail = _readable(errors[0]) if errors else "The request is invalid."
    return _error(422, detail, errors=jsonable_encoder(errors))


async def _llm_error(request: Request, exc: LLMError) -> JSONResponse:
    logger.error(f"Unhandled LLM error on {request.method} {request.url.path}: {exc}")
    return _error(
        502, "Our AI service is busy right now. Please try again in a moment."
    )


async def _database_unavailable(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Database unavailable on {request.method} {request.url.path}: {exc}")
    return _error(503, "We're having trouble connecting. Please try again shortly.")


async def _catch_unhandled(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        logger.exception(f"Unhandled error on {request.method} {request.url.path}")
        return _error(500, "Something went wrong on our side. Please try again.")


def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(StarletteHTTPException, _http_error)
    app.add_exception_handler(RequestValidationError, _validation_error)
    app.add_exception_handler(LLMError, _llm_error)
    app.add_exception_handler(OperationalError, _database_unavailable)
    app.add_exception_handler(PoolTimeoutError, _database_unavailable)
    app.middleware("http")(_catch_unhandled)
