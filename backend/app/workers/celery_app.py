from celery import Celery
from celery.signals import celeryd_init
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


@celeryd_init.connect
def wait_for_broker(conf=None, **kwargs):
    """Runs only in the worker. The settings above make the API fail fast when
    Redis is down; the worker should instead wait for Redis and reconnect."""
    conf.broker_connection_max_retries = None


celery_app.conf.task_routes = {
    # 'app.workers.tasks.*': {'queue': 'main-queue'}
}
