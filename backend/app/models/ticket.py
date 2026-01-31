import uuid
from sqlalchemy import DECIMAL, Column, Integer, String, ForeignKey, Enum, DateTime, func
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class TicketStatus(str, enum.Enum):
    pending = "pending"      # waiting payment confirmation
    active = "active"        # usable
    used = "used"            # scanned
    cancelled = "cancelled"  # cancelled by site owner

class Ticket(Base):
    __tablename__ = "Tickets"

    id = Column(Integer, primary_key=True, index=True)

    # owner
    firebase_uid = Column(String(128), ForeignKey("Users.firebase_uid"), nullable=False, index=True)

    # link to the payment/order (required for "cart")
    payment_id = Column(Integer, ForeignKey("Payments.id"), nullable=False, index=True)

    # ticket data
    event_name = Column(String(255), nullable=False)
    ticket_type = Column(String(100), default="standard")
    date = Column(DateTime, nullable=False)

    # IMPORTANT: store money in minor units ideally, but keeping DECIMAL if you already use it
    price = Column(DECIMAL(10, 2), nullable=False)

    ticket_code = Column(String(32), unique=True, nullable=False, default=lambda: uuid.uuid4().hex)

    purchase_date = Column(DateTime, server_default=func.now())

    # ticket lifecycle (paid -> active; scanned -> used)
    status = Column(Enum(TicketStatus, name="ticketstatus_lower"), nullable=False, default=TicketStatus.pending)

    amount_total_cents = Column(Integer, nullable=False, default=0)

    created_at = Column(DateTime, server_default=func.now())

    stripe_session_id = Column(String(255), nullable=True)
    stripe_payment_intent_id = Column(String(255), nullable=True)


    # relationships
    user = relationship("User", back_populates="tickets")
    payment = relationship("Payment", back_populates="tickets")
