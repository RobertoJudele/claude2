from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from pydantic import EmailStr, BaseModel
import os
import base64
import qrcode
from io import BytesIO
import tempfile


conf = ConnectionConfig(
    MAIL_USERNAME = os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD"),
    MAIL_FROM = os.getenv("MAIL_USERNAME"),
    MAIL_PORT = os.getenv("MAIL_PORT"),
    MAIL_SERVER = os.getenv("MAIL_SERVER"),
    MAIL_FROM_NAME="RFF Festival",
    MAIL_STARTTLS=True,       # ✅ new key replaces MAIL_TLS
    MAIL_SSL_TLS=False,       # ✅ new key replaces MAIL_SSL
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_confirmation_email(email: str, token: str):
    link = f"http://localhost:8000/api/confirm/{token}"  # adjust for production
    html = f"""
    <h2>Welcome!</h2>
    <p>Please confirm your account by clicking the link below:</p>
    <a href="{link}">Confirm Account</a>
    """
    message = MessageSchema(
        subject="Confirm your account",
        recipients=[email],
        body=html,
        subtype="html"
    )
    fm = FastMail(conf)
    await fm.send_message(message)


def generate_qr_bytes(ticket_code: str) -> bytes:
    qr = qrcode.QRCode(
        version=1, box_size=10, border=4, error_correction=qrcode.constants.ERROR_CORRECT_H
    )
    qr.add_data(ticket_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

async def send_ticket_email(email: EmailStr, ticket_code: str, event_name: str):
    qr_bytes = generate_qr_bytes(ticket_code)

    # 🔹 Save QR image temporarily (FastAPI-Mail needs a path)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp:
        tmp.write(qr_bytes)
        tmp_path = tmp.name

    html = f"""
    <h3>Your Ticket for {event_name}</h3>
    <p>Scan this QR code at entry:</p>
    <img src="cid:ticket_qr.png" alt="QR Code" width="200" height="200"/>
    <p><b>Ticket code:</b> {ticket_code}</p>
    """

    message = MessageSchema(
        subject=f"Your Ticket for {event_name}",
        recipients=[email],
        body=html,
        subtype="html",
        attachments=[tmp_path],  # ✅ attach by file path
    )

    fm = FastMail(conf)
    await fm.send_message(message)

    # optional: cleanup temp file
    try:
        os.remove(tmp_path)
    except Exception:
        pass