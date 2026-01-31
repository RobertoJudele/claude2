import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  IconButton,
  TextField,
  Alert,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { apiFetch } from "../api/apiClient";

// --------------------
// Cart storage helpers
// --------------------
type CartItem = { sku: string; quantity: number };

const CART_KEY = "rff_cart_v1";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.sku === "string")
      .map((x) => ({ sku: x.sku, quantity: Math.max(1, Number(x.quantity) || 1) }));
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function setQty(items: CartItem[], sku: string, qty: number): CartItem[] {
  const q = Math.max(1, Math.min(99, qty));
  return items.map((it) => (it.sku === sku ? { ...it, quantity: q } : it));
}

function removeItem(items: CartItem[], sku: string): CartItem[] {
  return items.filter((it) => it.sku !== sku);
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
}

// --------------------
// Cart Page
// --------------------
type CheckoutResp = { checkout_url: string };

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // keep localStorage in sync
  useEffect(() => {
    saveCart(items);
  }, [items]);

  const totalQty = useMemo(() => items.reduce((sum, it) => sum + it.quantity, 0), [items]);

  async function startCheckout() {
    setError("");
    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<CheckoutResp>("/api/payment/checkout-session", {
        method: "POST",
        body: JSON.stringify({ items }),
      });

      if (!res?.checkout_url) throw new Error("Checkout URL missing from backend response.");
      // Optionally: keep cart until payment succeeds; or clear immediately
      // clearCart(); setItems([]);
      window.location.href = res.checkout_url;
    } catch (e: any) {
      setError(e?.message || "Failed to start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container sx={{ py: 4, maxWidth: "md" as any }}>
      <Typography variant="h3" gutterBottom>
        Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!items.length ? (
        <Paper sx={{ p: 3 }}>
          <Typography>Your cart is empty.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 2 }}>
          <Stack spacing={2}>
            {items.map((it) => (
              <div key={it.sku}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.5}>
                    <Typography fontWeight={700}>{it.sku}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      SKU
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                    <TextField
                      label="Qty"
                      type="number"
                      value={it.quantity}
                      inputProps={{ min: 1, max: 99 }}
                      onChange={(e) => {
                        const next = Number(e.target.value || 1);
                        setItems((prev) => setQty(prev, it.sku, next));
                      }}
                      sx={{ width: 110 }}
                      size="small"
                    />

                    <IconButton
                      aria-label="remove"
                      onClick={() => setItems((prev) => removeItem(prev, it.sku))}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
                <Divider sx={{ mt: 2 }} />
              </div>
            ))}

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
              sx={{ pt: 1 }}
            >
              <Typography color="text.secondary">
                Items: <b>{totalQty}</b>
              </Typography>

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    clearCart();
                    setItems([]);
                  }}
                >
                  Clear
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  disabled={loading}
                  onClick={startCheckout}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={18} />
                      <span>Redirecting…</span>
                    </Stack>
                  ) : (
                    "Checkout"
                  )}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Container>
  );
}
