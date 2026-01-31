import {
  Drawer, Box, Typography, IconButton, Divider, List, ListItem, ListItemText,
  TextField, Stack, Button
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useCart } from "../context/CartContext";

function money(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export default function CartDrawer({
  open, onClose, onCheckout, loading
}: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  loading: boolean;
}) {
  const { items, remove, setQty, totals, clear } = useCart();

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 380, p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6">Your Cart</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {items.length === 0 ? (
          <Typography variant="body2">Cart is empty.</Typography>
        ) : (
          <>
            <List sx={{ p: 0 }}>
              {items.map(it => (
                <ListItem key={it.sku} sx={{ px: 0, alignItems: "flex-start" }}>
                  <Box sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                      <ListItemText primary={it.name} secondary={money(it.unitAmount, it.currency)} />
                      <IconButton size="small" onClick={() => remove(it.sku)}>
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
                      <TextField
                        label="Qty"
                        size="small"
                        type="number"
                        value={it.quantity}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setQty(it.sku, Number(e.target.value))
                        }                        inputProps={{ min: 1, max: 99 }}
                        sx={{ width: 100 }}
                      />
                      <Typography variant="body2" sx={{ ml: "auto" }}>
                        {money(it.unitAmount * it.quantity, it.currency)}
                      </Typography>
                    </Stack>
                  </Box>
                </ListItem>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1">Subtotal</Typography>
              <Typography variant="subtitle1">
                {totals.currency ? money(totals.subtotal, totals.currency) : "-"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" fullWidth onClick={clear} disabled={loading}>
                Clear
              </Button>
              <Button
                variant="contained"
                color="secondary"
                fullWidth
                onClick={onCheckout}
                disabled={loading || items.length === 0}
              >
                {loading ? "Starting..." : "Checkout"}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Drawer>
  );
}
