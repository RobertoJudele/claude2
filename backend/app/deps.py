# app/deps.py
from fastapi import HTTPException
from app.config import ENV

def dev_only():
    if ENV != "dev":
        raise HTTPException(status_code=404, detail="Not found")
