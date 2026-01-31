import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid"; // Grid v2
import PartnerCard from "../components/partners/PartnerCard";
import { partners } from "../data/partners";

export default function PartnersPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        Partners
      </Typography>

      <Grid container spacing={3} columns={12}>
        {partners.map((p) => (
          <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <PartnerCard partner={p} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
