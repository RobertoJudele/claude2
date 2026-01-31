from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.crud import ride as ride_crud
from app.auth.firebase_verify import get_current_user

router = APIRouter(prefix="/api/rides", tags=["Rides"])


@router.get("/search", response_model=list[schemas.RideOut])
def search_rides(origin: str, destination: str, db: Session = Depends(get_db)):
    """Search for available rides by origin and destination"""
    results = ride_crud.search_rides(db, origin, destination)
    return results

@router.post("/book/{ride_id}")
def request_seat(
    ride_id: int,
    payload: schemas.BookRideRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ride = ride_crud.get_ride(db, ride_id)
    seats = payload.seats

    if not ride or ride.available_seats < seats:
        raise HTTPException(status_code=400, detail="There are no seats available")

    booking_create = schemas.BookingCreate(seats_reserved=seats)
    ride_crud.create_booking(db, booking_create, ride_id, current_user.user_id)
    return {"message": "The request was sent to the driver and is pending."}

@router.get("/driver/pending-bookings/{ride_id}", response_model=list[schemas.BookingOut])
def get_pending_bookings(
    ride_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # optional: verifica daca ride_id apartine driverului
    ride = ride_crud.get_ride(db, ride_id)
    if not ride:
        raise HTTPException(status_code=404, detail="Ride not found")
    if ride.driver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You are not the driver of this ride")

    return ride_crud.get_pending_bookings_for_ride(db, ride_id)


@router.post("/driver/manage-booking/{booking_id}")
def manage_booking(
    booking_id: int,
    payload: schemas.ManageBookingRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    action = payload.action

    booking = ride_crud.get_booking(db, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="The reservation was not found")

    ride = ride_crud.get_ride(db, booking.ride_id)
    if ride.driver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="You are not the driver of this ride")

    if action == "accept":
        ...
    elif action == "reject":
        ...
    else:
        raise HTTPException(status_code=400, detail="Invalid action")



@router.post("/book/{ride_id}")
def request_seat(
    ride_id: int,
    payload: schemas.BookRideRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    ride = ride_crud.get_ride(db, ride_id)
    seats = payload.seats

    if not ride or ride.available_seats < seats:
        raise HTTPException(status_code=400, detail="There are no seats available")

    booking_create = schemas.BookingCreate(seats_reserved=seats)
    ride_crud.create_booking(db, booking_create, ride_id, current_user.user_id)
    return {"message": "The request was sent to the driver and is pending."}



@router.get("/my-bookings", response_model=list[schemas.BookingOut])
def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all bookings made by the current user"""
    bookings = ride_crud.get_rider_bookings(db, current_user.user_id)
    return bookings


@router.get("/my-offered-rides", response_model=list[schemas.RideOut])
def get_my_offered_rides(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Get all rides offered by the current user"""
    rides = ride_crud.get_driver_rides(db, current_user.user_id)
    return rides


