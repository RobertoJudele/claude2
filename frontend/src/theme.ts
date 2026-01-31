import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#035E8D" },
    secondary: { main: "#E6DDC7" },
    // tertiary: {main: ""},
    background: {
      default: "#0d0d0d",
      paper: "#121212",
    },
  },
});
export default theme;
