from celery import Celery
from celery.signals import celeryd_init, setup_logging, task_postrun, task_prerun
from app.core.config import settings
from app.core.logger import configure_logging, request_id_var

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


@setup_logging.connect
def use_app_logging(**kwargs):
    """Log like the API instead of in Celery's own format."""
    configure_logging()


@task_prerun.connect
def bind_task_id(task_id=None, **kwargs):
    """In the worker, the task ID takes the place of the request ID in logs."""
    request_id_var.set(task_id)


@task_postrun.connect
def unbind_task_id(**kwargs):
    request_id_var.set(None)


celery_app.conf.task_routes = {
    # 'app.workers.tasks.*': {'queue': 'main-queue'}
}
