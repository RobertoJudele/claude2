from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import ticket as crud_ticket
from app.schemas.ticket import TicketCreate, TicketOut
from app.auth.firebase_verify import get_current_firebase_user
from app.utils.mailer import send_ticket_email
from app.utils.qr import generate_qr_bytes
from app.models.ticket import Ticket
from app.models.user import User
from app.deps import dev_only

router = APIRouter(prefix="/api/tickets", tags=["Tickets"])

#backend/app/routers/tickets.py

# Create ticket (development mock purchase)
@router.post("/create", response_model=TicketOut)
def create_ticket(
    ticket_data: TicketCreate,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    """
    Mock ticket creation for testing (without payment).
    Uses Firebase UID as foreign key.
    """
    firebase_uid = user_data.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=400, detail="Missing Firebase UID")

    ticket =  crud_ticket.create_ticket(db, firebase_uid, ticket_data)
    return TicketOut.from_orm(ticket)  #  converts ORM to dict


# Get all tickets for current Firebase user
@router.get("/me", response_model=list[TicketOut])
def get_my_tickets(
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_data.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=400, detail="Missing Firebase UID")

    tickets = crud_ticket.get_user_tickets(db, firebase_uid=firebase_uid)
    # print("DEBUG:", type(tickets), tickets)
    #return [TicketOut.from_orm(ticket) for ticket in tickets]
    return list(map(TicketOut.from_orm, tickets))


# Verify and mark ticket as used (dev only)
@router.post("/verify/{ticket_code}", dependencies=[Depends(dev_only)])
def verify_ticket(ticket_code: str, db: Session = Depends(get_db)):
    ticket = crud_ticket.get_ticket_by_code(db, ticket_code)
    if not ticket:
        raise HTTPException(status_code=404, detail="Invalid ticket code")
    if ticket.status == "used":
        raise HTTPException(status_code=400, detail="Ticket already used")

    updated = crud_ticket.mark_ticket_used(db, ticket_code)
    return {"message": "Ticket verified and marked as used", "ticket_code": updated.ticket_code}


# Mock payment confirmation (dev only)
@router.post("/confirm-payment/{ticket_code}", dependencies=[Depends(dev_only)])
async def confirm_ticket_payment(
    ticket_code: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    ticket = crud_ticket.confirm_ticket_payment(db, ticket_code)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    user = db.query(User).filter_by(firebase_uid=ticket.firebase_uid).first()
    if not user or not user.email:
        raise HTTPException(status_code=400, detail="User email not found")

    # Send email asynchronously
    background_tasks.add_task(
        send_ticket_email,
        user.email,  #  We'll modify mailer soon to resolve by UID → email
        ticket.ticket_code,
        ticket.event_name
    )

    return {"message": "Payment confirmed and ticket emailed", "ticket_code": ticket.ticket_code}


# # Serve QR code as PNG image
# @router.get("/{ticket_code}/qr")
# def get_ticket_qr(ticket_code: str, db: Session = Depends(get_db)):
#     """
#     Return a QR code image (PNG) for the given ticket.
#     Open in dev mode — secure later for staff or ticket owner only.
#     """
#     ticket = db.query(Ticket).filter_by(ticket_code=ticket_code).first()
#     if not ticket:
#         raise HTTPException(status_code=404, detail="Ticket not found")

#     qr_bytes = generate_qr_bytes(ticket.ticket_code)
#     return Response(content=qr_bytes, media_type="image/png")




@router.get("/{ticket_code}/qr")
def get_ticket_qr(
    ticket_code: str,
    user_data: dict = Depends(get_current_firebase_user),
    db: Session = Depends(get_db)
):
    firebase_uid = user_data.get("uid")
    if not firebase_uid:
        raise HTTPException(status_code=400, detail="Missing Firebase UID")

    ticket = db.query(Ticket).filter_by(ticket_code=ticket_code).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    # ownership check
    if ticket.firebase_uid != firebase_uid:
        raise HTTPException(status_code=403, detail="Forbidden")

    # paid check
    if ticket.status != "active":
        raise HTTPException(status_code=403, detail="Ticket not paid")

    qr_bytes = generate_qr_bytes(ticket.ticket_code)
    return Response(content=qr_bytes, media_type="image/png")
