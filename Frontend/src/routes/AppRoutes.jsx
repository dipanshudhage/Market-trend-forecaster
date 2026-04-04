import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import BrandComparison from "../pages/BrandComparison";
import SentimentExplorer from "../pages/SentimentExplorer";
import Alerts from "../pages/Alerts";
import Reports from "../pages/Reports";
import AIChatbot from "../pages/AIChatbot";
import Forecast from "../pages/Forecast";

import DashboardLayout from "../components/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import PageTransition from "../components/PageTransition";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />

        {/* DASHBOARD LAYOUT — all dashboard + profile pages share sidebar */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PageTransition><Dashboard /></PageTransition>} />
          <Route path="brands" element={<PageTransition><BrandComparison /></PageTransition>} />
          <Route path="explorer" element={<PageTransition><SentimentExplorer /></PageTransition>} />
          <Route path="alerts" element={<PageTransition><Alerts /></PageTransition>} />
          <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
          <Route path="reports" element={<PageTransition><Reports /></PageTransition>} />
          <Route path="chatbot" element={<PageTransition><AIChatbot /></PageTransition>} />
          <Route path="forecast" element={<PageTransition><Forecast /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
};




export default AppRoutes;
