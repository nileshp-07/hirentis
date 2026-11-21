import os
from typing import List

from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "development")
IS_DEVELOPMENT = ENV == "development"

REQUIRED_IN_PRODUCTION = (
    "DATABASE_URL",
    "REDIS_URL",
    "OPENAI_API_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_ISSUER",
)


def _dev_default(name: str, default: str) -> str:
    """The value of `name`, falling back to `default` only in development, so a
    production server never quietly talks to a local or dev service."""
    return os.getenv(name) or (default if IS_DEVELOPMENT else "")


def _list(value: str) -> List[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def _database_url() -> str:
    url = _dev_default("DATABASE_URL", "postgresql://user:password@localhost:5432/db")
    if url.startswith("postgres://"):
        url = "postgresql://" + url.removeprefix("postgres://")
    return url


class Settings:
    ENV: str = ENV
    IS_DEVELOPMENT: bool = IS_DEVELOPMENT
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FORMAT: str = os.getenv(
        "LOG_FORMAT", "text" if IS_DEVELOPMENT else "json"
    ).lower()
    DATABASE_URL: str = _database_url()
    REDIS_URL: str = _dev_default("REDIS_URL", "redis://localhost:6379/0")
    RATE_LIMIT_ENABLED: bool = (
        os.getenv("RATE_LIMIT_ENABLED", "true").lower() != "false"
    )

    CORS_ORIGINS: List[str] = _list(
        _dev_default("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    )

    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    OPENAI_TIMEOUT_SECONDS: float = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "60"))
    OPENAI_MAX_RETRIES: int = int(os.getenv("OPENAI_MAX_RETRIES", "2"))
    LLM_MODEL_PLANNER: str = os.getenv("LLM_MODEL_PLANNER", OPENAI_MODEL)
    LLM_MODEL_INTERVIEWER: str = os.getenv("LLM_MODEL_INTERVIEWER", OPENAI_MODEL)
    LLM_MODEL_EVALUATOR: str = os.getenv("LLM_MODEL_EVALUATOR", OPENAI_MODEL)
    LLM_MODEL_REPORTER: str = os.getenv("LLM_MODEL_REPORTER", OPENAI_MODEL)

    LANGFUSE_PUBLIC_KEY: str = os.getenv("LANGFUSE_PUBLIC_KEY", "")
    LANGFUSE_SECRET_KEY: str = os.getenv("LANGFUSE_SECRET_KEY", "")
    LANGFUSE_BASE_URL: str = os.getenv(
        "LANGFUSE_BASE_URL", "https://cloud.langfuse.com"
    )

    TTS_VOICE: str = os.getenv("TTS_VOICE", "en_US-ljspeech-medium")
    TTS_VOICES_DIR: str = os.getenv("TTS_VOICES_DIR", "storage/voices")

    CLERK_WEBHOOK_SECRET: str = os.getenv("CLERK_WEBHOOK_SECRET", "")
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")
    # Frontend API URL of the Clerk instance; differs between dev and production.
    CLERK_ISSUER: str = _dev_default(
        "CLERK_ISSUER", "https://outgoing-cub-58.clerk.accounts.dev"
    )


settings = Settings()

if not IS_DEVELOPMENT:
    missing = [name for name in REQUIRED_IN_PRODUCTION if not getattr(settings, name)]
    if missing:
        raise RuntimeError(
            f"Missing required settings for ENV={ENV}: {', '.join(missing)}. "
            "See .env.example."
        )
