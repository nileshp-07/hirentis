import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.ai.llm import tracing
from app.ai.tts import warm_up as warm_up_voice
from app.api.v1.router import api_router
from app.core.errors import register_error_handlers
from app.core.logger import configure_logging
from app.core.request_logging import REQUEST_ID_HEADER, log_requests

configure_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Loading the voice takes a few seconds; do it off the startup path
    threading.Thread(target=warm_up_voice, daemon=True).start()
    yield
    tracing.flush()


app = FastAPI(title="Hirentis API", lifespan=lifespan)

register_error_handlers(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[REQUEST_ID_HEADER],
)

app.middleware("http")(log_requests)

app.include_router(api_router, prefix="/api/v1")


@app.get("/")
def read_root() -> dict:
    return {"message": "Welcome to the Hirentis API"}


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}
