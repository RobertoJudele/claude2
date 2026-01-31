import hashlib
import hmac
import os
from user_agents import parse
import httpx
from fastapi import HTTPException, status
from datetime import datetime, timedelta
from jose import jwt, JWTError

# Use a server-side secret for hashing refresh tokens
REFRESH_TOKEN_SECRET = os.getenv("JWT_REFRESH_SECRET_KEY")
RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")
EMAIL_SECRET_KEY = os.getenv("EMAIL_SECRET_KEY")

def hash_token(token: str) -> str:
    """Return HMAC-SHA256 hash of the given token."""
    return hmac.new(
        REFRESH_TOKEN_SECRET.encode(),
        token.encode(),
        hashlib.sha256
    ).hexdigest()



def parse_device_from_user_agent(ua_string: str) -> str:
    if not ua_string:
        return "Unknown Device"
    ua = parse(ua_string)
    return f"{ua.browser.family} on {ua.os.family}"

async def verify_recaptcha(token: str):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing reCAPTCHA token"
        )

    url = "https://www.google.com/recaptcha/api/siteverify"
    data = {"secret": RECAPTCHA_SECRET_KEY, "response": token}

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, data=data)
        result = resp.json()

    if not result.get("success"):
        raise HTTPException(status_code=400, detail=f"Invalid reCAPTCHA: {result}")
    return True


def create_email_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() +timedelta(minutes=30)
    to_encode.update({"exp" : expire})
    return jwt.encode(to_encode, EMAIL_SECRET_KEY, algorithm="HS256")


def verify_email_token(token: str):
    try:
        payload = jwt.decode(token, EMAIL_SECRET_KEY, algorithms="HS256")
        email = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None