import React from "react";
import { Routes, Route } from "react-router-dom";
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* DASHBOARD LAYOUT — all dashboard + profile pages share sidebar */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />                              {/* /dashboard         */}
        <Route path="brands" element={<BrandComparison />} />             {/* /dashboard/brands   */}
        <Route path="explorer" element={<SentimentExplorer />} />           {/* /dashboard/explorer */}
        <Route path="alerts" element={<Alerts />} />                      {/* /dashboard/alerts   */}
        <Route path="profile" element={<Profile />} />                     {/* /dashboard/profile  */}
        <Route path="reports" element={<Reports />} />          {/* /dashboard/reports  */}



        <Route path="chatbot" element={<AIChatbot />} />          {/* /dashboard/chatbot  */}
        <Route path="forecast" element={<Forecast />} />          {/* /dashboard/forecast */}
      </Route>
    </Routes>
  );
};




export default AppRoutes;
