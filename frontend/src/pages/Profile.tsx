import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  CircularProgress,
  List,
  ListItem,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { auth, db } from "../firebase/config";
import {
  updateEmail,
  updatePassword,
  updateProfile,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { logoutUser } from "../firebase/auth";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/apiClient"; 

interface Ticket {
  id: number;
  event_name: string;
  ticket_type: string;
  ticket_code: string;
  status: string;
  purchase_date: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // 🔹 Load Firestore user info
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData({
              username: data.username || "",
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              email: firebaseUser.email || "",
              password: "",
            });
          }

          // 🔹 Backend profile verification
          const profileRes = await apiFetch("/api/auth/profile");
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            console.log("Backend verified profile:", profileData);
          }

          // 🔹 Fetch user tickets securely from backend
          const ticketRes = await apiFetch("/api/tickets/me");
          if (ticketRes.ok) {
            const userTickets = await ticketRes.json();
            setTickets(userTickets);
          }
        } catch (err) {
          console.error("Profile fetch error:", err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateProfile(user, { displayName: formData.username });
      if (formData.email !== user.email) await updateEmail(user, formData.email);
      if (formData.password) await updatePassword(user, formData.password);

      await updateDoc(doc(db, "users", user.uid), {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
      });

      await apiFetch("/api/auth/register/firebase", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
      });

      setEditing(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      console.error("Update error:", err);
      alert(err.message || "Failed to update profile.");
    }
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  if (!user)
    return (
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: 10, textAlign: "center" }}>
          <Typography variant="h6">Please log in to view your profile.</Typography>
        </Paper>
      </Container>
    );

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 10, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ bgcolor: "secondary.main", mb: 2, width: 56, height: 56 }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>

          <Box sx={{ width: "100%", mt: 2 }}>
            <TextField
              label="Username"
              name="username"
              fullWidth
              margin="normal"
              value={formData.username}
              onChange={handleChange}
              disabled={!editing}
            />
            <TextField
              label="First Name"
              name="first_name"
              fullWidth
              margin="normal"
              value={formData.first_name}
              onChange={handleChange}
              disabled={!editing}
            />
            <TextField
              label="Last Name"
              name="last_name"
              fullWidth
              margin="normal"
              value={formData.last_name}
              onChange={handleChange}
              disabled={!editing}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              disabled={!editing}
            />
            {editing && (
              <TextField
                label="New Password"
                name="password"
                type="password"
                fullWidth
                margin="normal"
                value={formData.password}
                onChange={handleChange}
              />
            )}

            {!editing ? (
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>
                Save Changes
              </Button>
            )}
          </Box>

          <Divider sx={{ my: 4, width: "100%" }} />

          <Typography variant="h6" gutterBottom>
            My Tickets
          </Typography>

          {tickets.length > 0 ? (
            <List>
              {tickets.map((t) => (
                <ListItem
                  key={t.ticket_code}
                  sx={{
                    flexDirection: "column",
                    alignItems: "center",
                    border: "1px solid #ddd",
                    borderRadius: 2,
                    mb: 2,
                    p: 2,
                  }}
                >
                  <Typography variant="h6" color="primary">
                    {t.event_name}
                  </Typography>
                  <Typography variant="body1">
                    {t.ticket_type} — {t.status.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Purchased: {new Date(t.purchase_date).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Ticket Code: <b>{t.ticket_code}</b>
                  </Typography>

                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <img
                      src={`/api/tickets/${t.ticket_code}/qr`}
                      alt={`QR code for ${t.ticket_type}`}
                      width="160"
                      height="160"
                      style={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        background: "#fff",
                      }}
                    />
                    <Box>
                      <Button
                        size="small"
                        sx={{ mt: 1 }}
                        href={`/api/tickets/${t.ticket_code}/qr`}
                        download={`${t.ticket_code}.png`}
                      >
                        Download QR
                      </Button>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              You have no tickets yet.
            </Typography>
          )}


          <Divider sx={{ my: 4, width: "100%" }} />

          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
