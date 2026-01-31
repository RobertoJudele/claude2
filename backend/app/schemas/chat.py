from pydantic import BaseModel

class ChatInitiateRequest(BaseModel):
    ride_id: int
    driver_uid: str
    passenger_uid: str


class ChatResponse(BaseModel):
    chat_id: int

    class Config:
        orm_mode = True
