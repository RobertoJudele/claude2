from sqlalchemy import Column, Integer, String, Enum, DateTime, func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class PaymentStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    failed = "failed"
    cancelled = "cancelled"


class Payment(Base):
    __tablename__ = "Payments"  # keep your PascalCase style if you already use it

    id = Column(Integer, primary_key=True, index=True)

    firebase_uid = Column(String(128), nullable=False, index=True)  # payer

    # Stripe identifiers
    stripe_session_id = Column(String(255), unique=True, index=True, nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)

    currency = Column(String(3), nullable=False, default="eur")
    status = Column(Enum(PaymentStatus, name="paymentstatus_lower"), nullable=False, default=PaymentStatus.pending)

    created_at = Column(DateTime, server_default=func.now())
    paid_at = Column(DateTime, nullable=True)

    items_json = Column(String(2000), nullable=True)  # or Text if you prefer

    # one payment -> many tickets
    tickets = relationship("Ticket", back_populates="payment", cascade="all, delete-orphan")
