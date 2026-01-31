import { Container, Typography, Alert, Button, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function CheckoutCancelPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Payment cancelled
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        You cancelled the checkout. No payment was made.
      </Alert>

      <Stack direction="row" spacing={2}>
        <Button component={RouterLink} to="/cart" variant="contained" color="secondary">
          Return to Cart
        </Button>
        <Button component={RouterLink} to="/tickets" variant="outlined">
          View Tickets
        </Button>
      </Stack>
    </Container>
  );
}
