import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  TextField,
  Divider,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import { apiFetch } from "../api/apiClient";

type CartItem = {
  event_id: number;
  event_name: string;
  ticket_type?: string;
  unit_amount: number; // minor units (e.g. cents)
  quantity: number;
};

const CART_KEY = "rff_cart_v1";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function formatMoneyMinor(amountMinor: number, currency: string) {
  const amountMajor = amountMinor / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(amountMajor);
}

const Cart: React.FC = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  const currency = "EUR"; // keep consistent with backend for now (switch to BGN later)

  useEffect(() => {
    setItems(loadCart());
  }, []);

  const totalMinor = useMemo(() => {
    return items.reduce((sum, it) => sum + it.unit_amount * it.quantity, 0);
  }, [items]);

  const updateQty = (idx: number, qty: number) => {
    const safeQty = Math.max(1, Math.min(20, qty));
    const next = items.map((it, i) => (i === idx ? { ...it, quantity: safeQty } : it));
    setItems(next);
    saveCart(next);
  };

  const removeItem = (idx: number) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next);
    saveCart(next);
  };

  const clearCart = () => {
    localStorage.removeItem(CART_KEY);
    setItems([]);
  };

  const handleCheckout = async () => {
    setError(null);

    if (items.length === 0) {
      setError("Cart is empty.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      setError("You must be logged in to checkout.");
      return;
    }

    try {
      setLoadingCheckout(true);

      const idToken = await user.getIdToken(true);

      // IMPORTANT: In production, backend should NOT trust unit_amount from frontend.
      // It should compute price from DB based on event_id + ticket_type.
      const payload = {
        currency: currency.toLowerCase(), // "eur"
        items: items.map((it) => ({
          event_id: it.event_id,
          event_name: it.event_name,
          ticket_type: it.ticket_type ?? "standard",
          unit_amount: it.unit_amount,
          quantity: it.quantity,
        })),
      };

      const data = await apiFetch("/api/payment/checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const checkoutUrl = data?.checkout_url as string | undefined;
      if (!checkoutUrl) {
        throw new Error("Missing checkout_url from backend.");
      }

      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err?.message || "Checkout failed.");
    } finally {
      setLoadingCheckout(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" minHeight="80vh" sx={{ px: 2, py: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 900, width: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Cart</Typography>
          <Button variant="text" onClick={() => navigate("/")}>
            Continue browsing
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {items.length === 0 ? (
          <Typography variant="body1">Your cart is empty.</Typography>
        ) : (
          <>
            <Box sx={{ display: "grid", gap: 2 }}>
              {items.map((it, idx) => (
                <Paper
                  key={`${it.event_id}-${it.ticket_type || "standard"}-${idx}`}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2 }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {it.event_name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Type: {it.ticket_type ?? "standard"} • Unit:{" "}
                        {formatMoneyMinor(it.unit_amount, currency)}
                      </Typography>
                    </Box>

                    <IconButton aria-label="remove" onClick={() => removeItem(idx)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={2} alignItems="center">
                      <Typography variant="body2">Qty</Typography>
                      <TextField
                        type="number"
                        size="small"
                        value={it.quantity}
                        inputProps={{ min: 1, max: 20 }}
                        onChange={(e) => updateQty(idx, parseInt(e.target.value || "1", 10))}
                        sx={{ width: 100 }}
                      />
                    </Box>

                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      {formatMoneyMinor(it.unit_amount * it.quantity, currency)}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Button variant="outlined" color="error" onClick={clearCart}>
                Clear cart
              </Button>

              <Box textAlign="right">
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Total
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {formatMoneyMinor(totalMinor, currency)}
                </Typography>

                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={handleCheckout}
                  disabled={loadingCheckout}
                >
                  {loadingCheckout ? "Redirecting..." : "Checkout"}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default Cart;
