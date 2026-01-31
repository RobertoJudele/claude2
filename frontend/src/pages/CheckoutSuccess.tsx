import { useEffect, useMemo, useState } from "react";
import { Container, Typography, CircularProgress, Alert, Button, Stack } from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { apiFetch } from "../api/apiClient";

type VerifyResponse = { ok: boolean; message?: string };

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const sessionId = useMemo(() => new URLSearchParams(location.search).get("session_id"), [location.search]);

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"ok" | "error">("ok");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!sessionId) {
        setLoading(false);
        setStatus("error");
        setMsg("Missing session_id in URL.");
        return;
      }

      try {
        // OPTIONAL but recommended:
        // call backend to verify payment status and/or trigger a refresh
        // You can implement this endpoint, or skip it and just show "Payment received"
        const res = await apiFetch(`/api/payment/verify-session?session_id=${encodeURIComponent(sessionId)}`);
        const data = res as VerifyResponse;

        if (cancelled) return;

        if (data?.ok) {
          setStatus("ok");
          setMsg(data.message || "Payment received! Your tickets will appear in My Tickets in a moment.");
        } else {
          setStatus("error");
          setMsg(data?.message || "We couldn't verify the payment yet. Please refresh in a moment.");
        }
      } catch (e: any) {
        if (cancelled) return;
        setStatus("error");
        setMsg(e?.message || "We couldn't verify the payment yet. Please refresh in a moment.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Payment status
      </Typography>

      {loading ? (
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Checking payment...</Typography>
        </Stack>
      ) : status === "ok" ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {msg}
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        <Button component={RouterLink} to="/tickets" variant="contained" color="secondary">
          Go to My Tickets
        </Button>
        <Button component={RouterLink} to="/cart" variant="outlined">
          Back to Cart
        </Button>
      </Stack>
    </Container>
  );
}
