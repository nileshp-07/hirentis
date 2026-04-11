import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    ENV: str = os.getenv("ENV", "development")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/db")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    CLERK_WEBHOOK_SECRET: str = os.getenv("CLERK_WEBHOOK_SECRET", "")
    CLERK_SECRET_KEY: str = os.getenv("CLERK_SECRET_KEY", "")

settings = Settings()
