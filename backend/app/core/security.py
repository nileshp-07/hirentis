import logging
from jose import jwt, JWTError
import httpx
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from typing import Optional

logger = logging.getLogger(__name__)
security = HTTPBearer()

CLERK_ISSUER = "https://outgoing-cub-58.clerk.accounts.dev"
JWKS_URL = f"{CLERK_ISSUER}/.well-known/jwks.json"


class ClerkAuth:
    _jwks: Optional[dict] = None

    @classmethod
    async def get_jwks(cls):
        if cls._jwks is None:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.get(JWKS_URL)
                    # raise an exception if the response status code is not 200
                    response.raise_for_status()
                    cls._jwks = response.json()
            except Exception as e:
                logger.error(f"Failed to fetch JWKS from Clerk: {e}")
                raise HTTPException(
                    status_code=500, detail="Identity provider unavailable"
                )
        return cls._jwks


async def get_current_user(
    auth: HTTPAuthorizationCredentials = Security(security),
    db: Session = Depends(get_db),
) -> User:
    token = auth.credentials
    jwks = await ClerkAuth.get_jwks()

    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token header")

        key = next((k for k in jwks["keys"] if k["kid"] == kid), None)

        if not key:
            raise HTTPException(status_code=401, detail="Invalid token: key not found")

        payload = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER,
            options={"verify_aud": False},
        )

        clerk_user_id = payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(status_code=401, detail="Invalid token claims")

        user = db.query(User).filter(User.auth_provider_id == clerk_user_id).first()
        if not user:
            logger.warning(f"Clerk user {clerk_user_id} authenticated but not in DB.")
            raise HTTPException(status_code=403, detail="User account not synchronized")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTError as e:
        logger.error(f"JWT Verification Error: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    except Exception as e:
        logger.error(f"Unexpected Auth Error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")
