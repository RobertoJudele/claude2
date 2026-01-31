from sqlalchemy.orm import Session
from typing import Optional

from sqlalchemy import select

from app.models.user import User
from app.schemas.user import UserCreate
from app.auth.auth import hash_password

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate) -> User:
    db_user = User(
        email=user.email,
        username=user.username,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=hash_password(user.password),
        refresh_token=user.refresh_token_hash
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_firebase_uid(db: Session, firebase_uid: str) -> User | None:
    return db.execute(
        select(User).where(User.firebase_uid == firebase_uid)
    ).scalar_one_or_none()

def upsert_user_from_firebase(
    db: Session,
    *,
    firebase_uid: str,
    email: str | None = None,
    username: str | None = None,
    first_name: str | None = None,
    last_name: str | None = None,
) -> User:
    """
    Ensure a SQL User exists for this firebase_uid.
    Safe to call on every request (idempotent).
    """
    user = get_user_by_firebase_uid(db, firebase_uid)

    if user is None:
        user = User(
            firebase_uid=firebase_uid,
            email=email,
            username=username or (email.split("@")[0] if email else None),
            first_name=first_name,
            last_name=last_name,
            is_verified=True,  # if you want; or keep False if you use your own verification
            role="user",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    # Update fields if we got new info (don’t overwrite with None)
    changed = False
    if email and user.email != email:
        user.email = email
        changed = True
    if username and user.username != username:
        user.username = username
        changed = True
    if first_name is not None and user.first_name != first_name:
        user.first_name = first_name
        changed = True
    if last_name is not None and user.last_name != last_name:
        user.last_name = last_name
        changed = True

    if changed:
        db.commit()
        db.refresh(user)

    return user