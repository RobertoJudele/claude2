import React from "react";
import { Box } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Banner: React.FC = () => {
  return (
    <RouterLink to="/">
      <Box
        component="img"
        src="/images/FB_v003.png" // or whatever file
        alt="Banner"
        sx={{
          width: "100%", // fill horizontally
          height: "auto", // keep aspect ratio
          display: "block", // remove inline gap
          objectFit: "cover", // crop nicely if needed
        }}
      />
    </RouterLink>
  );
};

export default Banner;
