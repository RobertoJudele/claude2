// src/components/Footer.tsx
import React from "react";
import { Box, Container, Typography, Link } from "@mui/material";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        py: 3,
        backgroundColor: "#035E8D",
        color: "white",
      }}
    >
      <Container sx={{ textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          Contact
        </Typography>
        <Typography variant="body2">
          Get in touch with us at{" "}
          <Link
            href="mailto:info@example.com"
            color="inherit"
            underline="hover"
          >
            info@example.com
          </Link>
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          © {new Date().getFullYear()} My Website. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
