import email
import os
import stripe
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.auth.firebase_verify import get_current_firebase_user
from app.schemas.checkout import CreateCheckoutSessionRequest
from app.crud import payment as crud_payment
from app.crud import product as crud_product
from app.crud import user as crud_user

router = APIRouter(prefix="/api/payment", tags=["Payment"])

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://localhost")

@router.post("/checkout-session")
def create_session(
    payload: CreateCheckoutSessionRequest,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db),
):
    firebase_uid = user_data.get("uid")
    email = user_data.get("email")
    crud_user.upsert_user_from_firebase(db, firebase_uid=firebase_uid, email=email)

    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    skus = [i.sku for i in payload.items]
    products = crud_product.get_active_products_by_skus(db, skus)

    product_by_sku = {p.sku: p for p in products}
    missing = [sku for sku in skus if sku not in product_by_sku]
    if missing:
        raise HTTPException(status_code=400, detail=f"Unknown SKU(s): {', '.join(missing)}")

    # Create pending payment in DB (store totals if you want)
    payment = crud_payment.create_pending_payment_for_cart(
        db=db,
        firebase_uid=firebase_uid,
        items=[{"sku": i.sku, "quantity": i.quantity} for i in payload.items],
    )

    crud_payment.set_payment_items(
        db,
        payment.id,
        [ 
            {
                "ticket_type": product_by_sku[item.sku].name,
                "event_name": "RFF Festival 2025",
                "price": product_by_sku[item.sku].unit_amount_cents / 100,
                "amount_total_cents": product_by_sku[item.sku].unit_amount_cents * item.quantity,
                "quantity": item.quantity,
            }
            for item in payload.items
        ],
    )

    line_items = []
    for item in payload.items:
        p = product_by_sku[item.sku]

        # Best: use Stripe Price ID (stable, less errors)
        if p.stripe_price_id:
            line_items.append({"price": p.stripe_price_id, "quantity": item.quantity})
        else:
            # Fallback: inline price_data (ok for dev)
            line_items.append({
                "price_data": {
                    "currency": p.currency,
                    "product_data": {"name": p.name},
                    "unit_amount": int(p.unit_amount_cents),
                },
                "quantity": item.quantity,
            })

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        line_items=line_items,
        success_url=f"{FRONTEND_URL}/tickets/success?session_id={{CHECKOUT_SESSION_ID}}",
        cancel_url=f"{FRONTEND_URL}/cart",
        client_reference_id=str(payment.id),
        metadata={"payment_id": str(payment.id), "firebase_uid": firebase_uid},
    )

    crud_payment.attach_stripe_session_to_payment(db, payment.id, session.id)

    return {"checkout_url": session.url}

@router.get("/verify-session")
def verify_session(
    session_id: str,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db),
):
    #check logged in user
    firebase_uid = user_data.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=401, detail="Unauthorized")

    #check payment session
    payment = crud_payment.get_payment_by_stripe_session_id(db, session_id)
    if not payment or payment.firebase_uid != firebase_uid:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    #check ownership
    if payment.firebase_uid != firebase_uid:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if payment.status == "paid":
        return {"ok": True, "message": "Payment received! Your tickets should be available now."}
    
        # Optional: double-check Stripe status (helps if webhook is slow)
    try:
        sess = stripe.checkout.Session.retrieve(session_id)
        if sess.get("payment_status") == "paid":
            return {"ok": True, "message": "Payment received! Finalizing tickets..."}

    except Exception:
        pass

    return {"ok": False, "message": "Payment not confirmed yet. Please refresh in a moment."}
