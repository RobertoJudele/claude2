# app/schemas/ticket.py
from pydantic import BaseModel
from datetime import datetime
from enum import Enum


# --- Enums ---
class TicketStatus(str, Enum):
    pending = "pending"
    active = "active"
    used = "used"
    cancelled = "cancelled"


class PaymentStatus(str, Enum):
    unpaid = "unpaid"
    paid = "paid"
    # keeping 'failed' only if you plan to use it later
    failed = "failed"


# --- Base schemas ---
class TicketBase(BaseModel):
    event_name: str
    ticket_type: str
    date: datetime
    price: float


# --- For ticket creation ---
class TicketCreate(TicketBase):
    pass


# --- For output / response ---
class TicketOut(TicketBase):
    id: int
    firebase_uid: str | None = None
    ticket_code: str
    status: TicketStatus
    #payment_status: PaymentStatus
    purchase_date: datetime
    created_at: datetime | None = None

    class Config:
        orm_mode = True