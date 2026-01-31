from sqlalchemy import ForeignKey, DateTime, Float, Column , Integer, String, Boolean
from datetime import datetime
from app.database import Base
from sqlalchemy.orm import relationship

class Ride(Base):
    __tablename__ = "Rides"

    ride_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    driver_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    origin = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(DateTime, default=datetime.utcnow)
    available_seats = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(String(20), default="open")


    driver = relationship("User", backref="rides_created")

class Booking(Base):
    __tablename__ = "Bookings"

    booking_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    ride_id = Column(Integer, ForeignKey("Rides.ride_id"), nullable=False)
    rider_id = Column(Integer, ForeignKey("Users.user_id"), nullable=False)
    seats_reserved = Column(Integer, default=1)
    status = Column(String(20), default="pending")

    ride = relationship("Ride", backref="bookings")
    rider = relationship("User", backref="my_bookings")