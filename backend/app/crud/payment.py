from sqlalchemy.orm import Session
from app.models.payment import Payment
from app.models.ticket import Ticket, TicketStatus
import uuid
from datetime import datetime
import json


# -------------------------
# PAYMENT CRUD
# -------------------------

def create_pending_payment_for_cart(db: Session, firebase_uid: str, items: list[dict]):
    """
    Creates a Payment row in pending state.
    'items' is list of {sku, quantity} or anything you want to store later.
    For now we keep it minimal: just create the payment.
    """
    p = Payment(
        firebase_uid=firebase_uid,
        status="pending",
    )
    db.add(p)
    db.commit()
    db.refresh(p)
    return p

def attach_stripe_session_to_payment(db: Session, payment_id: int, session_id: str):
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        return None
    p.stripe_session_id = session_id
    db.commit()
    db.refresh(p)
    return p

def get_payment_by_stripe_session_id(db: Session, session_id: str):
    return db.query(Payment).filter(Payment.stripe_session_id == session_id).first()

def mark_payment_paid(db: Session, payment_id: int, payment_intent_id: str | None = None):
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        return None
    p.status = "paid"
    p.stripe_payment_intent_id = payment_intent_id
    p.paid_at = datetime.utcnow()
    db.commit()
    db.refresh(p)
    return p

def get_payment_by_id(db: Session, payment_id: int):
    return db.query(Payment).filter(Payment.id == payment_id).first()

def set_payment_items(db: Session, payment_id: int, items: list[dict]):
    p = db.query(Payment).filter(Payment.id == payment_id).first()
    if not p:
        return None
    p.items_json = json.dumps(items)
    db.commit()
    db.refresh(p)
    return p

# -------------------------
# TICKET HELPERS (temporary)
# -------------------------

def create_pending_tickets_for_cart(
    db: Session,
    firebase_uid: str,
    payment_id: int,
    items_resolved: list[dict],
):
    """
    items_resolved: list of dicts already validated server-side, e.g.
    [{ "ticket_type": "1-Day Pass", "event_name":"RFF Festival 2025", "date":..., "price":60.00, "amount_total_cents":6000, "quantity":2 }, ...]
    """
    created = []
    for it in items_resolved:
        qty = int(it["quantity"])
        for _ in range(qty):
            t = Ticket(
                firebase_uid=firebase_uid,
                payment_id=payment_id,
                event_name=it["event_name"],
                ticket_type=it["ticket_type"],
                date=it["date"],
                price=it["price"],
                amount_total_cents=int(it["amount_total_cents"]),
                status=TicketStatus.pending,
                ticket_code=uuid.uuid4().hex,
            )
            db.add(t)
            created.append(t)

    db.commit()
    return created




