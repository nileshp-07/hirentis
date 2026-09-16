import logging
import threading
from typing import Optional

import httpx
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.user import User

logger = logging.getLogger(__name__)
security = HTTPBearer()


class ClerkAuth:
    _jwks: Optional[dict] = None
    _lock = threading.Lock()

    @classmethod
    def _fetch_jwks(cls) -> dict:
        try:
            response = httpx.get(
                f"{settings.CLERK_ISSUER}/.well-known/jwks.json", timeout=5.0
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch JWKS from Clerk: {e}")
            raise HTTPException(status_code=503, detail="Identity provider unavailable")

    @classmethod
    def get_signing_key(cls, kid: str) -> Optional[dict]:
        """Return the JWK for `kid`, refetching once if it is not cached (key rotation)."""
        with cls._lock:
            if cls._jwks is None:
                cls._jwks = cls._fetch_jwks()
            key = cls._find_key(kid)
            if key is None:
                cls._jwks = cls._fetch_jwks()
                key = cls._find_key(kid)
            return key

    @classmethod
    def _find_key(cls, kid: str) -> Optional[dict]:
        return next((k for k in cls._jwks.get("keys", []) if k.get("kid") == kid), None)


def get_current_user(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
) -> User:
    token = auth.credentials

    try:
        kid = jwt.get_unverified_header(token).get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token header")

        key = ClerkAuth.get_signing_key(kid)
        if not key:
            raise HTTPException(status_code=401, detail="Invalid token: key not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=settings.CLERK_ISSUER,
            options={"verify_aud": False},
        )
    except HTTPException:
        raise
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError as e:
        logger.warning(f"JWT verification error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")

    clerk_user_id = payload.get("sub")
    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Invalid token claims")

    user = db.query(User).filter(User.auth_provider_id == clerk_user_id).first()
    if not user:
        logger.warning(f"Clerk user {clerk_user_id} authenticated but not in DB.")
        raise HTTPException(status_code=403, detail="User account not synchronized")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="User account is disabled")

    return user
