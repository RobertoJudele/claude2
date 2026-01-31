import { useMemo, useState } from "react";
import {
  Container, Typography, Card, CardContent, Button,
  CircularProgress, Snackbar, Alert, Box, IconButton, Badge
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CartDrawer from "../components/CartDrawer";
import { useCart } from "../context/CartContext";
import { startCheckout } from "../api/tickets";

type TicketProduct = {
  sku: string;
  name: string;
  description: string;
  unitAmount: number; // cents
  currency: "eur";
};

export default function TicketsPage() {
  const { add, items, totals } = useCart();

  const [loading, setLoading] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const products: TicketProduct[] = useMemo(() => ([
    {
      sku: "ticket_1day",
      name: "1-Day Pass",
      description: "Access for one day of the festival.",
      unitAmount: 6000, // €60.00
      currency: "eur",
    },
    {
      sku: "ticket_full",
      name: "Full Festival Pass",
      description: "Access for the entire event (2 days).",
      unitAmount: 10000, // €100.00
      currency: "eur",
    },
  ]), []);

  const handleAdd = (p: TicketProduct) => {
    add({ sku: p.sku, name: p.name, unitAmount: p.unitAmount, currency: p.currency });
    setSuccessMsg(`${p.name} added to cart`);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      const payload = items.map(i => ({ sku: i.sku, quantity: i.quantity }));
      const { checkout_url } = await startCheckout(payload);

      window.location.href = checkout_url;
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h3" gutterBottom>Tickets</Typography>

        <IconButton onClick={() => setCartOpen(true)} aria-label="Open cart">
          <Badge badgeContent={totals.count} color="secondary">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
      </Box>

      {loading && <CircularProgress sx={{ mb: 2 }} />}

      {products.map((p) => (
        <Card key={p.sku} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5">{p.name}</Typography>
            <Typography variant="body2" gutterBottom>
              {p.description}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => { handleAdd(p); setCartOpen(true); }}
                disabled={loading}
              >
                Add to cart
              </Button>

              <Button variant="outlined" onClick={() => setCartOpen(true)} disabled={loading}>
                View cart
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
        loading={loading}
      />

      <Snackbar open={!!successMsg} autoHideDuration={2500} onClose={() => setSuccessMsg(null)}>
        <Alert onClose={() => setSuccessMsg(null)} severity="success">
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar open={!!errorMsg} autoHideDuration={5000} onClose={() => setErrorMsg(null)}>
        <Alert onClose={() => setErrorMsg(null)} severity="error">
          {errorMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
