import logging
import re
import time
import uuid

from fastapi import Request

from app.core.logger import request_id_var

logger = logging.getLogger("app.request")

REQUEST_ID_HEADER = "X-Request-ID"
_VALID_REQUEST_ID = re.compile(r"^[A-Za-z0-9-]{8,64}$")


def _log_request(request: Request, status_code: int, started: float) -> None:
    duration_ms = round((time.perf_counter() - started) * 1000)
    user_id = getattr(request.state, "user_id", None)
    method, path = request.method, request.url.path

    message = f"{method} {path} {status_code} {duration_ms}ms"
    if user_id:
        message += f" user={user_id}"

    if method == "OPTIONS" or path == "/health":
        level = logging.DEBUG
    elif status_code >= 500:
        level = logging.WARNING
    else:
        level = logging.INFO

    logger.log(
        level,
        message,
        extra={
            "method": method,
            "path": path,
            "status": status_code,
            "duration_ms": duration_ms,
            "user_id": str(user_id) if user_id else None,
        },
    )


async def log_requests(request: Request, call_next):
    """Add this middleware last, so it is the outermost: it then times the whole
    request, sees the final status, and its request ID reaches every handler."""
    incoming = request.headers.get(REQUEST_ID_HEADER, "")
    request_id = (
        incoming if _VALID_REQUEST_ID.match(incoming) else uuid.uuid4().hex[:16]
    )
    token = request_id_var.set(request_id)
    started = time.perf_counter()
    status_code = 500
    try:
        response = await call_next(request)
        status_code = response.status_code
        response.headers[REQUEST_ID_HEADER] = request_id
        return response
    finally:
        _log_request(request, status_code, started)
        request_id_var.reset(token)
