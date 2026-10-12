from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.concurrency import run_in_threadpool
from svix.webhooks import Webhook, WebhookVerificationError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.services import user_service

router = APIRouter()


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    if not settings.CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Clerk Secret is missing")

    headers = request.headers
    svix_id = headers.get("svix-id")
    svix_timestamp = headers.get("svix-timestamp")
    svix_signature = headers.get("svix-signature")

    if not svix_id or not svix_timestamp or not svix_signature:
        raise HTTPException(
            status_code=400, detail="Missing essential Svix verification headers"
        )

    payload = await request.body()
    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)

    try:
        event = wh.verify(payload, headers)
    except WebhookVerificationError:
        raise HTTPException(status_code=400, detail="Invalid cryptographic signature")

    event_type = event.get("type")
    data = event.get("data", {})

    if event_type == "user.created":
        # The DB session is synchronous; keep it off the event loop.
        await run_in_threadpool(user_service.create_from_clerk, db, data)

    return {"success": True}
