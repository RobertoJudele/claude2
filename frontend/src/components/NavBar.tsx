import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth.ts";

const NavBar: React.FC<{ onScroll?: (id: string) => void }> = ({
  onScroll,
}) => {
  const [open, setOpen] = React.useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useAuth();

  // Close drawer when route changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const goSection = (id: string) => {
    if (pathname !== "/") {
      navigate("/", { state: { scrollTo: id } }); // App effect will do the scroll
    } else {
      onScroll?.(id);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    navigate("/login");
  };

  const close = () => setOpen(false);
  const openDrawer = () => setOpen(true);

  return (
    <>
      <AppBar
        position="sticky"
        // Drawer already has a higher z-index than AppBar; don't raise AppBar above it.
        sx={{
          // OPTIONAL: hide AppBar while drawer is open on mobile
          display: { xs: open ? "none" : "flex", md: "flex" },
          bgcolor: "primary.main",
        }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            HMC Bulgaria
          </Typography>

          {/* Desktop buttons */}
          <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
            <Button color="inherit" onClick={() => goSection("home")}>
              Home
            </Button>
            <Button color="inherit" onClick={() => goSection("about")}>
              About
            </Button>
            <Button color="inherit" component={RouterLink} to="/bands">
              Bands
            </Button>
            <Button color="inherit" component={RouterLink} to="/tickets">
              Tickets
            </Button>
            <Button color="inherit" component={RouterLink} to="/rides">
              Rides
            </Button>
            <Button color="inherit" component={RouterLink} to="/contact">
              Contact
            </Button>
            <Button color="inherit" component={RouterLink} to="/partners">
              Partners
            </Button>
            <Button color="inherit" component={RouterLink} to="/faq">
              FAQ
            </Button>
            {isLoggedIn && (
              <Button color="inherit" component={RouterLink} to="/profile">
                Profile
              </Button>
            )}

            {isLoggedIn && (
              <Button color="inherit" component={RouterLink} to="/chat-test">
                TestChat
              </Button>
            )}

            {isLoggedIn ? (
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/register">
                  Register
                </Button>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
              </>
            )}
          </Box>

          {/* Mobile hamburger */}
          <IconButton
            color="inherit"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={openDrawer}
            aria-label="Open menu"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={open}
        onClose={close}
        ModalProps={{ keepMounted: true }} // perf on mobile
        sx={{ display: { xs: "block", md: "none" } }}
        PaperProps={{ sx: { width: 280 } }}
      >
        {/* Close on any click/key inside the drawer */}
        <Box role="presentation" onClick={close} onKeyDown={close}>
          <Typography variant="h6" sx={{ p: 2 }}>
            Menu
          </Typography>
          <Divider />
          <List>
            {/* Scroll targets (stay on /) */}
            <ListItemButton onClick={() => goSection("home")}>
              <ListItemText primary="Home" />
            </ListItemButton>
            <ListItemButton onClick={() => goSection("about")}>
              <ListItemText primary="About" />
            </ListItemButton>

            {/* Routed pages */}
            <ListItemButton component={RouterLink} to="/bands">
              <ListItemText primary="Bands" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/tickets">
              <ListItemText primary="Tickets" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/rides">
              <ListItemText primary="Rides" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/contact">
              <ListItemText primary="Contact" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/partners">
              <ListItemText primary="Partners" />
            </ListItemButton>
            <ListItemButton component={RouterLink} to="/faq">
              <ListItemText primary="FAQ" />
            </ListItemButton>
            {isLoggedIn && (
              <ListItemButton component={RouterLink} to="/profile">
                <ListItemText primary="Profile" />
              </ListItemButton>
            )}

            {isLoggedIn ? (
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            ) : (
              <>
                <ListItemButton component={RouterLink} to="/register">
                  <ListItemText primary="Register" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/login">
                  <ListItemText primary="Login" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default NavBar;
