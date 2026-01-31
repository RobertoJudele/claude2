import os
import stripe
from fastapi import APIRouter, Request, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.mailer import send_ticket_email
from app.crud import ticket as crud_ticket
from app.crud import payment as crud_payment

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    if not sig_header or not WEBHOOK_SECRET:
        raise HTTPException(status_code=400, detail="Missing signature/secret")

    try:
        event = stripe.Webhook.construct_event(
            payload=payload,
            sig_header=sig_header,
            secret=WEBHOOK_SECRET,
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid payload")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        session_id = session.get("id")
        payment_intent = session.get("payment_intent")
        session_metadata = session.get("metadata") or {}

        payment = None
        if session_id:
            payment = crud_payment.get_payment_by_stripe_session_id(db, session_id)

        if not payment and session_metadata.get("payment_id"):
            payment = crud_payment.get_payment_by_id(db, int(session_metadata["payment_id"]))

        if payment:
            # Mark paid (idempotent)
            if payment.status != "paid":
                crud_payment.mark_payment_paid(db, payment.id, payment_intent_id=payment_intent)

            # Create tickets only once (idempotent)
            existing = crud_ticket.get_tickets_by_payment_id(db, payment.id)
            if not existing:
                tickets = crud_ticket.create_tickets_from_payment(db, payment)
            else:
                tickets = existing

            # Email user (optional)
            user = db.query(User).filter_by(firebase_uid=payment.firebase_uid).first()
            if user and user.email:
                for t in tickets:
                    background_tasks.add_task(
                        send_ticket_email,
                        user.email,
                        t.ticket_code,
                        t.event_name,
                    )

    return {"received": True}
