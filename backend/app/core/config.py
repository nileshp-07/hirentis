import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    ENV: str = os.getenv("ENV", "development")
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO").upper()
    LOG_FORMAT: str = os.getenv(
        "LOG_FORMAT", "text" if ENV == "development" else "json"
    ).lower()
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://user:password@localhost:5432/db"
    )
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    RATE_LIMIT_ENABLED: bool = (
        os.getenv("RATE_LIMIT_ENABLED", "true").lower() != "false"
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
    CLERK_ISSUER: str = os.getenv(
        "CLERK_ISSUER", "https://outgoing-cub-58.clerk.accounts.dev"
    )


settings = Settings()
