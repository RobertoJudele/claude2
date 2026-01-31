import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Avatar,
  Paper,
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";
import ReCaptcha from "../components/ReCaptcha";
import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { apiFetch } from "../api/apiClient";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    first_name: "",
    last_name: "",
  });
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Please verify you are not a robot.");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 🔹 Send verification email
      await sendEmailVerification(user);

      // 🔹 Update Firebase display name
      await updateProfile(user, { displayName: formData.username });

      // 🔹 Save user info in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: formData.email,
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        createdAt: new Date().toISOString(),
        emailVerified: false,
      });

      // 🔹 Sync to FastAPI backend using apiFetch (auto header handling)
      await apiFetch("/api/auth/register/firebase", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          first_name: formData.first_name,
          last_name: formData.last_name,
        }),
        headers: {
          "X-Captcha-Token": captchaToken,
        },
      });

      // Notify user
      alert(
        "A verification email has been sent to your inbox. Please verify your email before logging in."
      );
      await auth.signOut();
      navigate("/login");
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={4} sx={{ p: 4, mt: 10, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ bgcolor: "secondary.main", mb: 2 }}>
            <PersonAddIcon />
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Create Account
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              fullWidth
              label="Username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="First Name"
              name="first_name"
              required
              value={formData.first_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Last Name"
              name="last_name"
              required
              value={formData.last_name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <ReCaptcha onChange={(token) => setCaptchaToken(token)} />
            </Box>
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              disabled={!captchaToken || loading}
            >
              {loading ? "Creating..." : "Register"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
