from fastapi import APIRouter, Request, HTTPException, Depends
from svix.webhooks import Webhook, WebhookVerificationError
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.config import settings
from app.models.user import User

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
        raise HTTPException(status_code=400, detail="Missing essential Svix verification headers")

    payload = await request.body()
    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    
    try:
        event = wh.verify(payload, headers)
    except WebhookVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid cryptographic signature")
    
    event_type = event.get("type")
    data = event.get("data", {})
    
    if event_type == "user.created":
        user_id = data.get("id")
        
        email_addresses = data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address", "") if email_addresses else ""
        username = data.get("username")
        
        existing_user = db.query(User).filter(User.auth_provider_id == user_id).first()
        if not existing_user:
            new_user = User(
                auth_provider="clerk",
                auth_provider_id=user_id,
                email=primary_email,
                username=username,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            
    return {"success": True}
