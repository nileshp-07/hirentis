# FastAPI Production Backend

This is a production-ready FastAPI backend skeleton, powered by Python, SQLAlchemy, PostgreSQL, Redis, and Celery.

## Prerequisite
Ensure the following are installed on your machine:
* Python 3.11+
* [uv](https://github.com/astral-sh/uv) (Extremely fast Python package manager)
* PostgreSQL running locally or remotely
* Redis running locally or remotely

---

## 🚀 1. Setup & Installation

We manage all dependencies inside our `pyproject.toml` file. With `uv`, you can install everything rapidly and keep environments isolated.

1. **Create and Activate a Virtual Environment:**
   ```bash
   uv venv
   # On Windows
   .venv\Scripts\activate
   # On macOS/Linux
   source .venv/bin/activate
   ```

2. **Install Project Dependencies:**
   ```bash
   uv pip install -e .
   ```
   *To add a new package later:*
   ```bash
   uv pip install package-name
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `backend/` root directory and modify it based on your actual configuration.
   ```dotenv
   ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/db
   REDIS_URL=redis://localhost:6379/0
   OPENAI_API_KEY=your_key_here
   ```
   Per-user rate limits on the AI endpoints are counted in Redis and are on by
   default. Set `RATE_LIMIT_ENABLED=false` to turn them off while developing. If
   Redis is down, requests are allowed rather than blocked.

---

## 🗄️ 2. Database Migrations (Alembic)

We use SQLAlchemy as our ORM. To manage migrations safely (akin to Django's `makemigrations` and `migrate`), you will use **Alembic**.

**Initialize Alembic (One-time setup):**
```bash
alembic init alembic
```

**How to generate a migration ("makemigrations"):**
When you add or update a SQLAlchemy model inside `app/models/`, you instruct Alembic to detect the changes and create a revision file.
```bash
alembic revision --autogenerate -m "added user model"
```

**How to apply migrations ("migrate"):**
This physically creates or updates the tables inside PostgreSQL.
```bash
alembic upgrade head
```

---

## 🏃 3. Running the FastAPI Server

To start your API server in development with live-reloading:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
* Once running, visit **http://127.0.0.1:8000/docs** to see the interactive Swagger UI.
* Use **http://127.0.0.1:8000/health** to run a quick health check.

---

## ⚙️ 4. Running the Celery Background Workers

Celery is an asynchronous task queue. Answer scoring runs here, so a worker must be
running for interview answers to be evaluated.

**Start Redis (if you don't have it running):**
```bash
docker run -d --name hirentis-redis -p 6379:6379 redis:7-alpine
```

**Run the Celery Worker:**
```bash
# On Windows, you typically need to run this with 'solo' pooling
celery -A app.workers.celery_app worker --loglevel=info --pool=solo

# On macOS/Linux
celery -A app.workers.celery_app worker --loglevel=info
```

---

## 🔊 5. Interviewer Voice (Text-to-Speech)

Questions are read aloud with [Piper](https://github.com/OHF-Voice/piper1-gpl), which runs
locally on the CPU. Download the voice model once (about 60 MB, saved under
`storage/voices`, which git ignores):

```bash
python -m piper.download_voices en_US-ljspeech-medium --download-dir storage/voices
```

To use another voice, set `TTS_VOICE` (and optionally `TTS_VOICES_DIR`) in `.env` and
download it the same way. Check the voice's dataset license first:
`en_US-ljspeech-medium` and `en_US-kristin-medium` are public domain, but popular voices
such as `lessac` and `ryan` are licensed for non-commercial use only.

If the model is missing, the API logs the download command and the browser's built-in
voice reads the questions instead.

---

## 📝 6. Logging

The API and the Celery worker log to stdout, one line per event. Every line carries a
request ID (the task ID in the worker), and the API returns it in the `X-Request-ID`
header and in error responses, so a failed request can be found in the logs.

* `LOG_LEVEL` sets the level (default `INFO`).
* `LOG_FORMAT` is `text` (readable, the default when `ENV=development`) or `json`
  (one JSON object per line, the default in other environments).

---

## 📂 Project Flow Checklist
When actively developing on this server, follow this general flow:

1. **Endpoint/Logic Changes:** Create models in `app/models/`, routers/endpoints in `app/api/v1/`, and integrate them inside `app/main.py`.
2. **Schema Validity:** Keep Pydantic Input/Output classes organized inside `app/schemas/`.
3. **Tasks:** Heavy or asynchronous processes (such as calling AI tools) trace down to `app/ai/` and get executed by background wrappers in `app/workers/tasks/`.
