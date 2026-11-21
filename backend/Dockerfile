# One image for the API, the Celery worker and migrations; only the command differs.
FROM python:3.12-slim

COPY --from=ghcr.io/astral-sh/uv:0.9.30 /uv /bin/uv

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_HTTP_TIMEOUT=180 \
    PATH="/app/.venv/bin:$PATH" \
    ENV=production

# Trust X-Forwarded-* from the host's proxy, so redirects keep https
ENV FORWARDED_ALLOW_IPS="*"

WORKDIR /app

# Dependencies first, so code changes don't reinstall them
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Interviewer voice (about 60 MB), baked into the image
ARG TTS_VOICE=en_US-ljspeech-medium
ENV TTS_VOICE=${TTS_VOICE}
RUN python -m piper.download_voices "${TTS_VOICE}" --download-dir storage/voices

COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app
COPY start.sh ./

RUN useradd --system --no-create-home app
USER app

EXPOSE 8000

# Hosts such as Render and Railway pass the port in $PORT
CMD ["sh", "start.sh"]
