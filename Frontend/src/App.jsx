import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Import pages (adjust names if needed)
import AIChatbot from "./pages/AIChatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <div style={{ color: "white", padding: "20px" }}>
              Home Page ✅
            </div>
          }
        />

        {/* Chatbot route */}
        <Route path="/chatbot" element={<AIChatbot />} />

        {/* Fallback route */}
        <Route
          path="*"
          element={
            <div style={{ color: "red", padding: "20px" }}>
              404 - Page Not Found ❌
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
