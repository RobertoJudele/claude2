from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, func
from app.models.chat import Chat, ChatMessage
from app.models.user import User

def get_existing_chat(db: Session, ride_id: int, driver_uid: str, passenger_uid: str):
    return db.query(Chat).filter(
        Chat.ride_id == ride_id,
        or_(
            and_(Chat.driver_uid == driver_uid, Chat.passenger_uid == passenger_uid),
            and_(Chat.driver_uid == passenger_uid, Chat.passenger_uid == driver_uid)
        )
    ).first()


def create_chat(db: Session, ride_id: int, driver_uid: str, passenger_uid: str):
    chat = Chat(
        ride_id=ride_id,
        driver_uid=driver_uid,
        passenger_uid=passenger_uid
    )
    db.add(chat)
    db.commit()
    db.refresh(chat)
    return chat

def save_message(db: Session, chat_id: int, sender_uid: str, content: str):
    msg = ChatMessage(
        chat_id=chat_id,
        sender_uid=sender_uid,
        content=content
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return msg

def get_chat_messages(
    db: Session,
    chat_id: int,
    limit: int = 30,
    before_id: int | None = None
):
    q = db.query(ChatMessage).filter(ChatMessage.chat_id == chat_id)

    if before_id:
        q = q.filter(ChatMessage.message_id < before_id)

    return (
        q.order_by(ChatMessage.message_id.desc()).limit(limit).all()
    )

def get_user_chats(db: Session, user_uid: str):

    last_message_subq = (
        db.query(
            ChatMessage.chat_id,
            func.max(ChatMessage.timestamp).label("last_ts")
        )
        .group_by(ChatMessage.chat_id)
        .subquery()
    )

    chats = (
        db.query(Chat, last_message_subq.c.last_ts)
        .outerjoin(last_message_subq, Chat.chat_id == last_message_subq.c.chat_id)
        .filter(
            or_(
                Chat.driver_uid == user_uid,
                Chat.passenger_uid == user_uid
            )
        )
        .order_by(desc(last_message_subq.c.last_ts))
        .all()
    )

    result = []

    for chat, last_ts in chats:
        other_uid = chat.passenger_uid if chat.driver_uid == user_uid else chat.driver_uid

        other_user = db.query(User).filter(User.firebase_uid == other_uid).first()
        last_message = (
            db.query(ChatMessage)
            .filter(ChatMessage.chat_id == chat.chat_id)
            .order_by(ChatMessage.message_id.desc())
            .first()
        )

        has_new = last_message is not None and last_message.sender_uid != user_uid

        result.append({
            "chat_id": chat.chat_id,
            "title": other_user.username if other_user else "Unknown",
            "last_message": last_message.content if last_message else None,
            "updated_at": last_message.timestamp if last_message else chat.created_at,
            "has_new": has_new,
        })

    return result