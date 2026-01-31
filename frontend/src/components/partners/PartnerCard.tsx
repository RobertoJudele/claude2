import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import type { Partner } from "../../data/partners";

type Props = {
  partner: Partner;
  imageHeight?: number;
};

export default function PartnerCard({ partner, imageHeight = 180 }: Props) {
  return (
    <Card elevation={3}>
      <CardActionArea
        component="a"
        href={partner.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Visit ${partner.name}`}
      >
        <CardMedia
          component="img"
          image={partner.logo}
          alt={`${partner.name} logo`}
          sx={{
            height: imageHeight,
            objectFit: "contain",
            bgcolor: "background.paper",
          }}
        />
        <CardContent sx={{ pt: 1 }}>
          <Typography variant="h6" align="center">
            {partner.name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
