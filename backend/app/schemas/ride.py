from pydantic import BaseModel, Field, conint, confloat
from datetime import datetime
from enum import Enum
from typing import Literal, Optional

class RideStatus(str, Enum):
    open = "open"
    full = "full"
    completed = "completed"
    cancelled = "cancelled"


class BookingStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"
    cancelled = "cancelled"


# --- Ride schemas ---
class RideBase(BaseModel):
    origin: str
    destination: str
    price: float
    available_seats: int


class RideCreate(BaseModel):
    origin: str
    destination: str
    price: float
    available_seats: int

class RideUpdate(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    price: Optional[float] = None
    available_seats: Optional[int] = None
    status: Optional[str] = None

class RideCreateRequest(BaseModel):
    origin: str = Field(min_length=1, max_length=100)
    destination: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    seats: int = Field(ge=1, le=8)

class BookRideRequest(BaseModel):
    seats: int = Field(ge=1, le=8)

class RideUpdate(BaseModel):
    available_seats: int
    status: RideStatus


class RideOut(RideBase):
    ride_id: int
    driver_id: int
    departure_time: datetime
    status: RideStatus

    class Config:
        orm_mode = True


# --- Booking schemas ---
class BookingBase(BaseModel):
    seats_reserved: int


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    status: BookingStatus


class BookingOut(BookingBase):
    booking_id: int
    ride_id: int
    rider_id: int
    status: BookingStatus

    class Config:
        orm_mode = True



class ManageBookingRequest(BaseModel):
    action: Literal["accept", "reject"]