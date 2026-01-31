from pydantic import BaseModel, EmailStr
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    password: str  # plain password

class UserOut(BaseModel):
    user_id: int
    email: EmailStr
    username: str
    first_name: str
    last_name: str
    is_verified: bool
    role: str

    class Config:
        orm_mode = True
