#!/bin/sh
# Start command for the API image.
# Set RUN_WORKER=true to also run the Celery worker in this container, for hosts
# (like free tiers) that allow only one service. Otherwise only the API starts.
if [ "$RUN_WORKER" = "true" ]; then
  celery -A app.workers.celery_app worker --loglevel=info --concurrency=1 &
fi
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
