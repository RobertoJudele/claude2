from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP, text, Index
from sqlalchemy.orm import relationship
from app.database import Base


class Chat(Base):
    __tablename__ = "Chats"

    chat_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ride_id = Column(Integer, ForeignKey("Rides.ride_id"), nullable=False)
    driver_uid = Column(String(50), nullable=False)
    passenger_uid = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete")

    __table_args__ = (
        Index("idx_chat_users_ride", "ride_id", "driver_uid", "passenger_uid"),
    )


class ChatMessage(Base):
    __tablename__ = "ChatMessages"

    message_id = Column(Integer, primary_key=True, autoincrement=True)
    chat_id = Column(Integer, ForeignKey("Chats.chat_id"), nullable=False, index=True)
    sender_uid = Column(String(50), nullable=False)
    content = Column(String(500), nullable=False)
    timestamp = Column(TIMESTAMP, server_default=text("CURRENT_TIMESTAMP"))

    chat = relationship("Chat", back_populates="messages")

    __table_args__ = (
        Index("idx_chatmessage_chatid_ts", "chat_id", "timestamp"),
    )

class Ride(Base):
    __tablename__ = "Rides"

    ride_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    description = Column(String(255), nullable=True)