from pydantic import BaseModel
from typing import Optional

class FirebaseUserOut(BaseModel):
    firebase_uid: Optional[str]
    email: str
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class FirebaseAuthResponse(BaseModel):
    ok: bool = True
    user: FirebaseUserOut


class FirebaseRegisterRequest(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
