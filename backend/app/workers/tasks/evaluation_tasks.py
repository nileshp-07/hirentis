import logging
import uuid

from app.ai.llm.openai_client import LLMError
from app.services.evaluation_service import mark_failed, score_response
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

MAX_RETRIES = 3
RETRY_BACKOFF_SECONDS = 15


@celery_app.task(bind=True, name="evaluations.score_response", max_retries=MAX_RETRIES)
def score_response_task(self, response_id: str):
    """Score one answer, retrying with backoff when the model call fails."""
    try:
        score_response(uuid.UUID(response_id))
    except LLMError as e:
        if self.request.retries < MAX_RETRIES:
            raise self.retry(
                exc=e, countdown=RETRY_BACKOFF_SECONDS * (2**self.request.retries)
            )
        logger.error(f"Scoring gave up for response {response_id}: {e}")
        mark_failed(uuid.UUID(response_id), str(e))
