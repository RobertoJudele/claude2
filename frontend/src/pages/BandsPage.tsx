// src/pages/BandsPage.tsx
import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid"; // Grid v2
import { bands } from "../data/bands";
import type { Band } from "../data/bands";
import BandCard from "../components/bands/BandCard";
import BandDialog from "../components/bands/BandDialog";

export default function BandsPage() {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Band | null>(null);

  const handleOpen = (band: Band) => {
    setSelected(band);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Bands
      </Typography>

      <Grid container spacing={3} columns={12}>
        {bands.map((band, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
            <BandCard
              band={band}
              onClick={() => handleOpen(band)}
              imageHeight={340}
            />
          </Grid>
        ))}
      </Grid>

      <BandDialog open={open} onClose={handleClose} band={selected} />
    </Container>
  );
}
