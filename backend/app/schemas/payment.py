# app/schemas/checkout.py
from pydantic import BaseModel, Field

class CartItem(BaseModel):
    event_name: str
    ticket_type: str = "standard"
    date: str  # ISO string, or change to datetime in schema
    price_cents: int
    quantity: int = 1

class CartCheckoutRequest(BaseModel):
    items: list[CartItem]



class PaymentCreate(BaseModel):
    event_id: int
    ticket_type: str | None = None
    quantity: int = 1
