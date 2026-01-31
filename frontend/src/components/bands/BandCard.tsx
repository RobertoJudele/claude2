// src/components/bands/BandCard.tsx
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import type { Band } from "../../data/bands";
type Props = {
  band: Band;
  onClick: () => void;
  imageHeight?: number;
};

export default function BandCard({ band, onClick, imageHeight = 340 }: Props) {
  return (
    <Card
      onClick={onClick}
      elevation={3}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": { transform: "translateY(-4px) scale(1.02)", boxShadow: 6 },
        "&:active": { transform: "translateY(-1px) scale(1.01)" },
      }}
    >
      <CardMedia
        component="img"
        image={band.img}
        alt={band.name}
        sx={{ height: imageHeight, objectFit: "cover" }}
        loading="lazy"
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {band.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {band.desc}
        </Typography>
      </CardContent>
    </Card>
  );
}
