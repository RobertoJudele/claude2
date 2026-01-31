from sqlalchemy.orm import Session
from app.models.ticket import Ticket, TicketStatus
from app.models.payment import Payment, PaymentStatus   
from app.schemas.ticket import TicketCreate
import uuid
import json
from datetime import datetime
from app.models.ticket import Ticket, TicketStatus

def create_ticket(db: Session, firebase_uid: str, ticket_data: TicketCreate):
    """
    Create a new ticket linked to a Firebase user (mock purchase for now).
    """
    ticket = Ticket(
        firebase_uid=firebase_uid,
        event_name=ticket_data.event_name,
        ticket_type=ticket_data.ticket_type,
        date=ticket_data.date,
        price=ticket_data.price,
        ticket_code=str(uuid.uuid4())[:8].upper(),
        status=TicketStatus.pending,
        #payment_status=PaymentStatus.unpaid,
    )
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket


def confirm_ticket_payment(db: Session, ticket_code: str):
    """
    Mark a ticket as paid and activate it.
    """
    ticket = db.query(Ticket).filter_by(ticket_code=ticket_code).first()
    if not ticket:
        return None
    ticket.payment_status = PaymentStatus.paid
    ticket.status = TicketStatus.active
    db.commit()
    db.refresh(ticket)
    return ticket


# app/crud/ticket.py
def get_user_tickets(db, firebase_uid: str, only_paid: bool = False):
    q = db.query(Ticket).filter(Ticket.firebase_uid == firebase_uid)
    if only_paid:
        q = q.filter(Ticket.status == "paid")
    return q.order_by(Ticket.created_at.desc()).all()

def get_ticket_by_code(db: Session, code: str):
    return db.query(Ticket).filter_by(ticket_code=code).first()


def get_ticket(db: Session, ticket_id: int):
    return db.query(Ticket).filter(Ticket.id == ticket_id).first()


def mark_ticket_used(db: Session, code: str):
    """
    Mark a ticket as used (e.g. after QR scan).
    """
    ticket = get_ticket_by_code(db, code)
    if ticket:
        ticket.status = TicketStatus.used
        db.commit()
        db.refresh(ticket)
    return ticket



def delete_ticket(db: Session, ticket_id: int):
    """
    Delete a ticket (admin only).
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if ticket:
        db.delete(ticket)
        db.commit()
        return True
    return False


def attach_stripe_session_bulk(db: Session, ticket_ids: list[int], session_id: str):
    tickets = db.query(Ticket).filter(Ticket.id.in_(ticket_ids)).all()
    for t in tickets:
        t.stripe_session_id = session_id
    db.commit()
    return tickets


def activate_tickets_for_payment(db: Session, payment_id: int, payment_intent_id: str | None = None):
    tickets = db.query(Ticket).filter(Ticket.payment_id == payment_id).all()
    for t in tickets:
        t.status = TicketStatus.active
        if payment_intent_id:
            t.stripe_payment_intent_id = payment_intent_id
        # If you STILL have ticket.payment_status column in DB, set it too:
        if hasattr(t, "payment_status") and t.payment_status is not None:
            t.payment_status = "paid"
    db.commit()
    return tickets



def create_tickets_from_payment(db: Session, payment: Payment):
    if not getattr(payment, "items_json", None):
        return []

    items = json.loads(payment.items_json)
    created = []

    for it in items:
        qty = int(it["quantity"])
        for _ in range(qty):
          t = Ticket(
              firebase_uid=payment.firebase_uid,
              payment_id=payment.id,
              event_name=it.get("event_name", "RFF Festival 2025"),
              ticket_type=it["ticket_type"],
              date=datetime.utcnow(),
              price=it["price"],
              amount_total_cents=int(it["amount_total_cents"]),
              status=TicketStatus.active,  # paid => active
          )
          db.add(t)
          created.append(t)

    db.commit()
    return created


def get_tickets_by_payment_id(db: Session, payment_id: int):
    return db.query(Ticket).filter(Ticket.payment_id == payment_id).all()