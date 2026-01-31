import React from "react";
import { Typography, Box } from "@mui/material";

interface TextSectionProps {
  id: string;
  title: string;
  content: string;
}

const TextSection: React.FC<TextSectionProps> = ({ id, title, content }) => {
  return (
    <Box id={id} sx={{ my: 4 }}>
      <Typography variant="h4" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1">{content}</Typography>
    </Box>
  );
};

export default TextSection;
