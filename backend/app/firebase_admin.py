# backend/app/firebase_admin.py
import firebase_admin
from firebase_admin import credentials, auth
import os

# Path to your Firebase service account JSON
SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(__file__), "firebase_service_account.json"
)

# Initialize only once
if not firebase_admin._apps:
    cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
    firebase_admin.initialize_app(cred)

# Export auth for other modules
__all__ = ["auth"]
