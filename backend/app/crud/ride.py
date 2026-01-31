from sqlalchemy.orm import Session
from app import models, schemas


# --- Ride CRUD ---
def get_ride(db: Session, ride_id: int):
    return db.query(models.Ride).filter(models.Ride.ride_id == ride_id).first()


def get_rides(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Ride).offset(skip).limit(limit).all()


def search_rides(
    db: Session,
    origin: str,
    destination: str,
):
    return db.query(models.Ride).filter(
        models.Ride.origin.ilike(f"%{origin}%"),
        models.Ride.destination.ilike(f"%{destination}%"),
        models.Ride.available_seats > 0,
    ).all()


def create_ride(db: Session, ride: schemas.RideCreate, driver_id: int):
    db_ride = models.Ride(
        driver_id=driver_id,
        origin=ride.origin,
        destination=ride.destination,
        price=ride.price,
        available_seats=ride.available_seats,
        status="open",
    )
    db.add(db_ride)
    db.commit()
    db.refresh(db_ride)
    return db_ride


def update_ride(db: Session, ride_id: int, ride: schemas.RideUpdate):
    db_ride = get_ride(db, ride_id)
    if db_ride:
        db_ride.available_seats = ride.available_seats
        db_ride.status = ride.status
        db.commit()
        db.refresh(db_ride)
    return db_ride


def get_driver_rides(db: Session, driver_id: int):
    return db.query(models.Ride).filter(models.Ride.driver_id == driver_id).all()


# --- Booking CRUD ---
def get_booking(db: Session, booking_id: int):
    return db.query(models.Booking).filter(models.Booking.booking_id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Booking).offset(skip).limit(limit).all()


def create_booking(
    db: Session,
    booking: schemas.BookingCreate,
    ride_id: int,
    rider_id: int,
):
    db_booking = models.Booking(
        ride_id=ride_id,
        rider_id=rider_id,
        seats_reserved=booking.seats_reserved,
        status="pending",
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking


def update_booking(db: Session, booking_id: int, booking: schemas.BookingUpdate):
    db_booking = get_booking(db, booking_id)
    if db_booking:
        db_booking.status = booking.status
        db.commit()
        db.refresh(db_booking)
    return db_booking


def get_rider_bookings(db: Session, rider_id: int):
    return db.query(models.Booking).filter(models.Booking.rider_id == rider_id).all()


def get_pending_bookings_for_ride(db: Session, ride_id: int):
    return db.query(models.Booking).filter(
        models.Booking.ride_id == ride_id,
        models.Booking.status == "pending",
    ).all()
