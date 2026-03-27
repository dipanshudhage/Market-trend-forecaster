import { BrowserRouter, Routes, Route } from "react-router-dom";
import AIChatbot from "../pages/AIChatbot";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/chatbot" element={<AIChatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
