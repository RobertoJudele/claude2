# app/utils/qrcode_utils.py
import qrcode
from io import BytesIO
import base64

def generate_qr_bytes(ticket_code: str) -> bytes:
    """Generate QR PNG bytes from a ticket code."""
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
    )
    qr.add_data(ticket_code)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()