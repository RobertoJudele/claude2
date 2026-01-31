from sqlalchemy import Column, Integer, String, Boolean, TIMESTAMP, text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    email = Column(String(50), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)

    firebase_uid = Column(String(128), unique=True, nullable=True, index=True)

    first_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=True)

    hashed_password = Column(String(255), nullable=True)

    # DB: tinyint(1) NULL default 0
    is_verified = Column(Boolean, nullable=True, server_default=text("0"))

    # DB: varchar(50) NULL default 'user'
    role = Column(String(50), nullable=True, server_default=text("'user'"))

    # DB fields you currently MISS
    refresh_token_hash = Column(String(255), nullable=True)

    created_at = Column(TIMESTAMP, nullable=True, server_default=text("CURRENT_TIMESTAMP"))
    updated_at = Column(
        TIMESTAMP,
        nullable=True,
        server_default=text("CURRENT_TIMESTAMP"),
        server_onupdate=text("CURRENT_TIMESTAMP"),
    )

    refresh_tokens = relationship(
        "RefreshToken",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    tickets = relationship(
        "Ticket",
        back_populates="user",
        cascade="all, delete-orphan",
    )
