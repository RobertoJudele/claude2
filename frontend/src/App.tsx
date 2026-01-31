import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Banner from "./components/Banner";
import VideoBanner from "./components/VideoBanner";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import BandsPage from "./pages/BandsPage";
import TicketsPage from "./pages/TicketsPage";
import RidesPage from "./pages/RidesPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import PartnersPage from "./pages/PartnersPage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import ChatInitTest from "./pages/ChatInitTest.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";
import CartPage from "./pages/CartPage";


import { useEffect } from "react";
import { auth, db } from "./firebase/config.ts";

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";

  const handleNavClick = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    console.log("Firebase initialized!");
    console.log("Auth app name:", auth.app.name);
    console.log("Firestore app name:", db.app.name);
  }, []);

  // After navigating to "/", scroll to the requested section (passed via state)
  React.useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (isHome && state?.scrollTo) {
      // wait a tick so Home DOM is mounted
      setTimeout(() => handleNavClick(state.scrollTo!), 0);
      // clear state so it doesn't re-run on back/forward
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [isHome, location.state, location.pathname, navigate]);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ bgcolor: "background.default", color: "text.primary" }}
    >
      <Box sx={{ width: "100%" }}>
        <Banner />
      </Box>

      <Navbar onScroll={handleNavClick} />

      {isHome && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <VideoBanner />
        </Box>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/bands" element={<BandsPage />} />
        <Route path="/tickets" element={<TicketsPage />} />
        <Route path="/rides" element={<RidesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/partners" element={<PartnersPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat-test" element={<ChatInitTest />} />
        <Route path="/chat/:chatId" element={<ChatPage />} />
        <Route path="/tickets/success" element={<CheckoutSuccess />} />
        <Route path="/tickets/cancel" element={<CheckoutCancel />} />  
        <Route path="/cart" element={<CartPage />} />

      </Routes>

      <Footer />
    </Box>
  );
};

export default App;
