# app/auth/firebase_verify.py
import firebase_admin
from firebase_admin import credentials, auth
from sqlalchemy.orm import Session
from app.models.user import User
from typing import Optional
from fastapi import Depends, HTTPException, Request, status, Header

from app.database import get_db

# Initialize Firebase Admin once
cred = credentials.Certificate("app/firebase_service_account.json")
firebase_admin.initialize_app(cred)


async def verify_firebase_token(token_or_request: Optional[str | Request] = None):
    """
    Verify Firebase ID token from either:
    - a raw token string, or
    - a FastAPI Request (reads from Authorization header)
    """
    id_token = None

    # Case 1: direct token string
    if isinstance(token_or_request, str):
        id_token = token_or_request

    # Case 2: FastAPI Request with Authorization header
    elif isinstance(token_or_request, Request):
        auth_header = token_or_request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            id_token = auth_header.split("Bearer ")[1]

    if not id_token:
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid Firebase token: {str(e)}")
    



async def get_current_firebase_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")

    id_token = auth_header.split("Bearer ", 1)[1].strip()

    try:
        decoded = auth.verify_id_token(id_token)
        return decoded
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")


async def get_current_user(
    request: Request,
    db: Session = Depends(get_db)
) -> User:
    """Get the actual User model from database based on Firebase token."""
    firebase_data = await get_current_firebase_user(request)
    email = firebase_data.get("email")
    
    if not email:
        raise HTTPException(status_code=401, detail="No email in Firebase token")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    return user