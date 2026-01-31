from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from sqlalchemy import or_, select, func, desc
from typing import Dict, List

from app.database import get_db
from app.schemas.chat import ChatInitiateRequest, ChatResponse
from app.crud.chat import get_existing_chat, create_chat, save_message, get_chat_messages, get_user_chats
from app.models.user import User
from app.models.chat import Chat, ChatMessage
from app.auth.firebase_verify import get_current_firebase_user, verify_firebase_token
import logging

logger = logging.getLogger("chat")
logger.setLevel(logging.INFO)

router = APIRouter(prefix="/api/chat", tags=["Chat"])
# dict: chat_id -> list of websockets
active_connections: Dict[int, List[WebSocket]] = {}

@router.post("/initiate", response_model=ChatResponse)
async def initiate_chat(
    payload: ChatInitiateRequest,
    current_user: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):

    # check if driver exists
    driver = db.query(User).filter(User.firebase_uid == payload.driver_uid).first()
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")

    # check if passenger exists
    passenger = db.query(User).filter(User.firebase_uid == payload.passenger_uid).first()
    if not passenger:
        raise HTTPException(status_code=404, detail="Passenger not found")

    # only passenger OR driver can initiate — not a random user
    if current_user["uid"] not in [payload.driver_uid, payload.passenger_uid]:
        raise HTTPException(status_code=403, detail="Not allowed to create this chat")

    # check if chat already exists
    existing = get_existing_chat(
        db,
        payload.ride_id,
        payload.driver_uid,
        payload.passenger_uid
    )

    if existing:
        return ChatResponse(chat_id=existing.chat_id)

    # create new chat
    chat = create_chat(
        db,
        payload.ride_id,
        payload.driver_uid,
        payload.passenger_uid
    )

    return ChatResponse(chat_id=chat.chat_id)

@router.get("/users")
def list_users(
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    """
    Return all users from DB except the current logged user.
    Used for selecting who to start a chat with.
    """

    current_email = user_data.get("email")

    users = (
        db.query(User)
        .filter(User.email != current_email)
        .all()
    )

    return [
        {
            "user_id": u.user_id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "firebase_uid": u.firebase_uid,
        }
        for u in users
    ]

@router.websocket("/ws/{chat_id}")
async def chat_websocket(
    websocket: WebSocket,
    chat_id: int,
    db: Session = Depends(get_db)
):
    await websocket.accept()

    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001)
        return

    try:
        token_data = await verify_firebase_token(token)
    except Exception:
        await websocket.close(code=4002)
        return

    user_uid = token_data.get("uid")
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()

    if not chat or user_uid not in [
        chat.driver_uid,
        chat.passenger_uid
    ]:
        await websocket.close(code=4003)
        return

    active_connections.setdefault(chat_id, []).append(websocket)
    logger.info(f"WS connected chat={chat_id} user={user_uid}")

    try:
        while True:
            data = await websocket.receive_json()
            content = data.get("content", "").strip()

            if not content:
                continue

            msg = save_message(db, chat_id, user_uid, content)

            payload = {
                "type": "message",
                "message_id": msg.message_id,
                "sender_uid": user_uid,
                "content": content,
                "timestamp": str(msg.timestamp),
            }

            for conn in active_connections.get(chat_id, []):
                await conn.send_json(payload)

    except WebSocketDisconnect:
        logger.info(f"WS disconnected chat={chat_id} user={user_uid}")

    finally:
        if chat_id in active_connections:
            active_connections[chat_id] = [
                c for c in active_connections[chat_id]
                if c != websocket
            ]
            if not active_connections[chat_id]:
                del active_connections[chat_id]


@router.get("/{chat_id}/messages")
def get_messages(
    chat_id: int,
    limit: int = 30,
    before_id: int | None = None,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    user_uid = user_data["uid"]

    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(404)

    if user_uid not in [chat.driver_uid, chat.passenger_uid]:
        raise HTTPException(403)

    messages = get_chat_messages(db, chat_id, limit, before_id)

    return [
        {
            "message_id": m.message_id,
            "sender_uid": m.sender_uid,
            "content": m.content,
            "timestamp": m.timestamp,
        }
        for m in reversed(messages)  # frontend-friendly
    ]

@router.get("/list")
def list_chats(user_data: dict = Depends(get_current_firebase_user), db: Session = Depends(get_db)):
    uid = user_data["uid"]
    return get_user_chats(db, uid)

@router.get("/{chat_id}/info")
def get_chat_info(chat_id: int, user_data: dict = Depends(get_current_firebase_user), db: Session = Depends(get_db)):
    uid = user_data["uid"]
    chat = db.query(Chat).filter(Chat.chat_id == chat_id).first()
    if not chat:
        raise HTTPException(404, "Chat not found")
    if uid not in [chat.driver_uid, chat.passenger_uid]:
        raise HTTPException(403, "Unauthorized")

    other_uid = chat.passenger_uid if chat.driver_uid == uid else chat.driver_uid
    other_user = db.query(User).filter(User.firebase_uid == other_uid).first()

    return {"chat_id": chat.chat_id, "other_username": other_user.username}
