from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.workers.tasks.evaluation_tasks",
        "app.workers.tasks.report_tasks",
    ],
)

# We never read task results, and a slow broker must not delay an API request
celery_app.conf.update(
    task_ignore_result=True,
    broker_connection_retry_on_startup=True,
    broker_connection_timeout=1,
    broker_connection_max_retries=0,
    broker_transport_options={
        "socket_connect_timeout": 1,
        "socket_timeout": 1,
        "retry_policy": {"max_retries": 0},
    },
)

celery_app.conf.task_routes = {
    # 'app.workers.tasks.*': {'queue': 'main-queue'}
}
