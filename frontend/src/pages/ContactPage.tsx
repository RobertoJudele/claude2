import { Container, Typography, TextField, Button, Box } from "@mui/material";

export default function ContactPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Contact
      </Typography>
      <Typography variant="body1" gutterBottom>
        Got questions? Send us a message:
      </Typography>

      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: 500 }}
      >
        <TextField label="Your Name" variant="outlined" fullWidth required />
        <TextField
          label="Your Email"
          variant="outlined"
          type="email"
          fullWidth
          required
        />
        <TextField
          label="Message"
          variant="outlined"
          multiline
          rows={4}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Send
        </Button>
      </Box>
    </Container>
  );
}
