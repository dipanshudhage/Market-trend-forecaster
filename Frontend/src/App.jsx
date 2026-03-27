import { BrowserRouter, Routes, Route } from "react-router-dom";
import AIChatbot from "./pages/AIChatbot";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Home</h1>} />
        <Route path="/chatbot" element={<AIChatbot />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
