import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import CloseIcon from "@mui/icons-material/Close";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import SvgIcon from "@mui/material/SvgIcon";
import type { SvgIconProps } from "@mui/material/SvgIcon";
import type { Band } from "../../data/bands.ts";

// Custom Spotify icon
function SpotifyIcon(props: SvgIconProps) {
  return (
    <SvgIcon {...props} viewBox="0 0 24 24">
      <path d="M12 1.5C6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5 22.5 17.8 22.5 12 17.8 1.5 12 1.5zm4.7 14.9a.9.9 0 0 1-1.2.3c-3.2-2-7.1-2.4-11.8-1.1a.9.9 0 1 1-.5-1.7c5.1-1.4 9.4-1 13 .9.4.2.6.7.5 1.2zm1.1-3c-.2.3-.6.5-1 .3-3.7-2.2-9.4-2.9-13.7-1.3-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 4.9-1.8 11.3-1 15.5 1.6.5.2.7.8.4 1.2zM19 9.1c-.2.3-.7.5-1.1.3-4.2-2.5-11.1-2.8-15.1-1.3-.5.2-1.1 0-1.3-.6-.2-.5 0-1.1.6-1.3 4.5-1.7 12.2-1.3 17 1.6.4.3.6.9.3 1.3z" />
    </SvgIcon>
  );
}

type Props = {
  open: boolean;
  onClose: () => void;
  band: Band | null;
};

export default function BandDialog({ open, onClose, band }: Props) {
  if (!band) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="body"
      PaperProps={{ sx: { borderRadius: 2, overflow: "hidden" } }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6">{band.name}</Typography>

        {/* socials right-aligned */}
        <Stack direction="row" spacing={1}>
          {band.socials?.facebook && (
            <IconButton
              component={Link}
              href={band.socials.facebook}
              target="_blank"
            >
              <FacebookIcon />
            </IconButton>
          )}
          {band.socials?.instagram && (
            <IconButton
              component={Link}
              href={band.socials.instagram}
              target="_blank"
            >
              <InstagramIcon />
            </IconButton>
          )}
          {band.socials?.youtube && (
            <IconButton
              component={Link}
              href={band.socials.youtube}
              target="_blank"
            >
              <YouTubeIcon />
            </IconButton>
          )}
          {band.socials?.spotify && (
            <IconButton
              component={Link}
              href={band.socials.spotify}
              target="_blank"
            >
              <SpotifyIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Image */}
      <Box
        component="img"
        src={band.img}
        alt={band.name}
        sx={{
          width: "100%",
          maxHeight: 480,
          objectFit: "cover",
          display: "block",
        }}
      />

      {/* Spotify + YouTube embeds */}
      <Box sx={{ p: 2, display: "grid", gap: 2 }}>
        {band.spotifyEmbed && (
          <iframe
            src={band.spotifyEmbed}
            width="100%"
            height="352"
            style={{ border: 0, borderRadius: 12 }}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        )}

        {band.youtubeEmbed && (
          <iframe
            width="100%"
            height="315"
            src={band.youtubeEmbed}
            style={{ border: 0 }}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </Box>

      {/* Description */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body1">{band.desc}</Typography>
      </Box>
    </Dialog>
  );
}
