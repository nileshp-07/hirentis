import logging
import uuid

from app.ai.llm.openai_client import LLMError
from app.services.report_service import ReportNotReady, generate_report, mark_failed
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

MAX_WAIT_RETRIES = 20
WAIT_SECONDS = 15
MAX_LLM_RETRIES = 3
LLM_BACKOFF_SECONDS = 15


@celery_app.task(bind=True, name="reports.generate", max_retries=MAX_WAIT_RETRIES)
def generate_report_task(self, session_id: str):
    session_uuid = uuid.UUID(session_id)
    try:
        generate_report(session_uuid)
    except ReportNotReady as e:
        if self.request.retries < MAX_WAIT_RETRIES:
            raise self.retry(exc=e, countdown=WAIT_SECONDS)
        logger.warning(f"Report for {session_id} built while unscored: {e}")
        try:
            generate_report(session_uuid, allow_partial=True)
        except (ReportNotReady, LLMError) as final:
            mark_failed(session_uuid, str(final))
    except LLMError as e:
        if self.request.retries < MAX_LLM_RETRIES:
            raise self.retry(
                exc=e, countdown=LLM_BACKOFF_SECONDS * (2**self.request.retries)
            )
        logger.error(f"Report generation gave up for session {session_id}: {e}")
        mark_failed(session_uuid, str(e))
