import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import {
  searchRides,
  bookRide,
  createRide,
  getMyBookings,
  getMyOfferedRides,
  getPendingBookings,
  manageBooking,
  type Ride,
  type Booking,
} from "../api/rides";

const RidesPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [tab, setTab] = useState(0);

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [results, setResults] = useState<Ride[]>([]);
  const [bookingSeats, setBookingSeats] = useState<Record<number, number>>({});

  const [cOrigin, setCOrigin] = useState("");
  const [cDestination, setCDestination] = useState("");
  const [cPrice, setCPrice] = useState<number>(0);
  const [cSeats, setCSeats] = useState<number>(1);

  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myOffered, setMyOffered] = useState<Ride[]>([]);
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [selectedRideForPending, setSelectedRideForPending] = useState<
    number | null
  >(null);

  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    severity: "success" | "error";
  }>({
    open: false,
    msg: "",
    severity: "success",
  });

  const notify = (msg: string, severity: "success" | "error" = "success") =>
    setToast({ open: true, msg, severity });
  const closeToast = () => setToast({ ...toast, open: false });

  const doSearch = async () => {
    try {
      const data = await searchRides(origin, destination);
      setResults(data);
    } catch (e: any) {
      notify(e.message || "Search failed", "error");
    }
  };

  const doBook = async (rideId: number) => {
    const seats = bookingSeats[rideId] || 1;
    try {
      const res = await bookRide(rideId, seats);
      notify(res.message);
    } catch (e: any) {
      notify(e.message || "Booking failed", "error");
    }
  };

  const doCreateRide = async () => {
    try {
      const res = await createRide({
        origin: cOrigin,
        destination: cDestination,
        price: cPrice,
        seats: cSeats,
      });
      notify(res.message);
      const offered = await getMyOfferedRides();
      setMyOffered(offered);
    } catch (e: any) {
      notify(e.message || "Create ride failed", "error");
    }
  };

  const loadMyBookings = async () => {
    try {
      setMyBookings(await getMyBookings());
    } catch (e: any) {
      notify(e.message || "Failed to load bookings", "error");
    }
  };

  const loadMyOffered = async () => {
    try {
      setMyOffered(await getMyOfferedRides());
    } catch (e: any) {
      notify(e.message || "Failed to load offered rides", "error");
    }
  };

  const loadPendingForRide = async (rideId: number) => {
    try {
      setSelectedRideForPending(rideId);
      setPendingBookings(await getPendingBookings(rideId));
      setTab(4); // Switch to tab 4 (Driver: Pending Bookings)
    } catch (e: any) {
      notify(e.message || "Failed to load pending bookings", "error");
    }
  };

  const doManageBooking = async (
    bookingId: number,
    action: "accept" | "reject",
  ) => {
    try {
      const res = await manageBooking(bookingId, action);
      notify(res.message);
      if (selectedRideForPending)
        await loadPendingForRide(selectedRideForPending);
    } catch (e: any) {
      notify(e.message || "Failed to update booking", "error");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadMyBookings();
      loadMyOffered();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <Box p={3}>
        <Typography variant="h5">Ridesharing</Typography>
        <Typography sx={{ mt: 2 }}>
          Please log in to search, create, and manage rides.
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3} maxWidth={1000} width="100%">
      <Typography variant="h4" gutterBottom>
        Ridesharing
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Search & Book" />
        <Tab label="Create Ride" />
        <Tab label="My Bookings" />
        <Tab label="My Offered Rides" />
        <Tab label="Driver: Pending Bookings" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Origin"
                fullWidth
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                label="Destination"
                fullWidth
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Button
                variant="contained"
                onClick={doSearch}
                fullWidth
                sx={{ height: "56px" }}
              >
                Search
              </Button>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {results.map((ride) => (
              <Grid size={{ xs: 12, md: 6 }} key={ride.ride_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {ride.origin} → {ride.destination}
                    </Typography>
                    <Typography>Price: {ride.price}</Typography>
                    <Typography>
                      Seats available: {ride.available_seats}
                    </Typography>
                    <Typography>Status: {ride.status}</Typography>
                    <TextField
                      label="Seats to book"
                      type="number"
                      inputProps={{ min: 1, max: ride.available_seats }}
                      value={bookingSeats[ride.ride_id] ?? 1}
                      onChange={(e) =>
                        setBookingSeats((prev) => ({
                          ...prev,
                          [ride.ride_id]: Number(e.target.value),
                        }))
                      }
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      disabled={ride.available_seats <= 0}
                      onClick={() => doBook(ride.ride_id)}
                    >
                      Request Seat
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Origin"
                fullWidth
                value={cOrigin}
                onChange={(e) => setCOrigin(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Destination"
                fullWidth
                value={cDestination}
                onChange={(e) => setCDestination(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Price"
                type="number"
                fullWidth
                value={cPrice}
                onChange={(e) => setCPrice(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Seats"
                type="number"
                fullWidth
                value={cSeats}
                onChange={(e) => setCSeats(Number(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="contained" onClick={doCreateRide}>
                Create Ride
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}

      {tab === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            My Bookings
          </Typography>
          <Grid container spacing={2}>
            {myBookings.map((b) => (
              <Grid size={{ xs: 12, md: 6 }} key={b.booking_id}>
                <Card>
                  <CardContent>
                    <Typography>Booking #{b.booking_id}</Typography>
                    <Typography>Ride: {b.ride_id}</Typography>
                    <Typography>Seats: {b.seats_reserved}</Typography>
                    <Typography>Status: {b.status}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            My Offered Rides
          </Typography>
          <Grid container spacing={2}>
            {myOffered.map((r) => (
              <Grid size={{ xs: 12, md: 6 }} key={r.ride_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {r.origin} → {r.destination}
                    </Typography>
                    <Typography>Price: {r.price}</Typography>
                    <Typography>Available: {r.available_seats}</Typography>
                    <Typography>Status: {r.status}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="outlined"
                      onClick={() => loadPendingForRide(r.ride_id)}
                    >
                      View Pending Bookings
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {tab === 4 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Pending Bookings{" "}
            {selectedRideForPending
              ? `for Ride #${selectedRideForPending}`
              : ""}
          </Typography>
          {!selectedRideForPending && (
            <Typography>
              Select a ride in "My Offered Rides" to view pending requests.
            </Typography>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {pendingBookings.map((b) => (
              <Grid size={{ xs: 12, md: 6 }} key={b.booking_id}>
                <Card>
                  <CardContent>
                    <Typography>Booking #{b.booking_id}</Typography>
                    <Typography>Ride: {b.ride_id}</Typography>
                    <Typography>Seats: {b.seats_reserved}</Typography>
                    <Typography>Status: {b.status}</Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={() => doManageBooking(b.booking_id, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => doManageBooking(b.booking_id, "reject")}
                    >
                      Reject
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={closeToast}>
        <Alert severity={toast.severity} onClose={closeToast}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RidesPage;
