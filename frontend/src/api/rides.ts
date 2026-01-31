import { apiFetch } from "./apiClient";

const BASE = "https://localhost";

export type Ride = {
  ride_id: number;
  driver_id: number;
  origin: string;
  destination: string;
  price: number;
  available_seats: number;
  departure_time: string;
  status: "open" | "full" | "completed" | "cancelled";
};

export type Booking = {
  booking_id: number;
  ride_id: number;
  rider_id: number;
  seats_reserved: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
};

export async function searchRides(
  origin: string,
  destination: string,
): Promise<Ride[]> {
  const url = `${BASE}/api/rides/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`;
  return apiFetch<Ride[]>(url);
}

export async function bookRide(rideId: number, seats: number) {
  const url = `${BASE}/api/rides/book/${rideId}`;
  return apiFetch(url, { method: "POST", body: JSON.stringify({ seats }) });
}

export async function createRide(params: { origin: string; destination: string; price: number; seats: number; }) {
  const url = `${BASE}/api/rides/create`;
  return apiFetch(url, { method: "POST", body: JSON.stringify(params) });
}


export async function getMyBookings(): Promise<Booking[]> {
  const url = `${BASE}/api/rides/my-bookings`;
  return apiFetch<Booking[]>(url);
}

export async function getMyOfferedRides(): Promise<Ride[]> {
  const url = `${BASE}/api/rides/my-offered-rides`;
  return apiFetch<Ride[]>(url);
}

export async function getPendingBookings(rideId: number): Promise<Booking[]> {
  const url = `${BASE}/api/rides/driver/pending-bookings/${rideId}`;
  return apiFetch<Booking[]>(url);
}

export async function manageBooking(bookingId: number, action: "accept" | "reject") {
  const url = `${BASE}/api/rides/driver/manage-booking/${bookingId}`;
  return apiFetch(url, { method: "POST", body: JSON.stringify({ action }) });
}