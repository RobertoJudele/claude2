import React, { useState } from "react";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
//import { useAuth } from "../context/AuthContext";
import ReCaptcha from "../components/ReCaptcha";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { apiFetch } from "../api/apiClient";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  //const { setAccessToken } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!captchaToken) {
      setError("Please verify you are not a robot.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Login with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // 2️⃣ Require verified email
      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        return;
      }

      // 3️⃣ Get fresh Firebase ID token
      const idToken = await user.getIdToken(true);

      // 4️⃣ Call backend to sync/verify user
      const data = await apiFetch("/api/auth/login/firebase", {
        method: "POST",
        headers: { 
          "X-Captcha-Token": captchaToken,
          "Authorization": `Bearer ${idToken}` },
      });

      console.log("✅ Backend verified:", data);

      // 5️⃣ Store token (optional, for client state)
      //setAccessToken(idToken);

      // 6️⃣ Navigate home
      navigate("/");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, maxWidth: 400, width: "100%" }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={formData.password}
            onChange={handleChange}
            required
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
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!captchaToken || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <Typography
            variant="body2"
            color="primary"
            sx={{ mt: 2, cursor: "pointer", textAlign: "center" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot your password?
          </Typography>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
