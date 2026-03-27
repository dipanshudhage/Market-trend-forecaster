import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
// import "../styles/auth.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login({ username: username.trim(), password });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard", { replace: true });
    } catch (error) {
      alert(error.response?.data?.detail || "Login failed");
    }
  };
    const handleBack = () => {
    navigate("/");  // Goes to home page
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />

{/* Back Button */}
<button
  onClick={handleBack}
  className="absolute top-8 left-8 glass-card p-3 rounded-2xl shadow-2xl backdrop-blur-xl bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 z-20 flex items-center gap-2 text-slate-200 hover:text-white"
  aria-label="Back to home"
>
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
  <span className="font-medium text-sm hidden md:inline">Back</span>
</button>




      <div className="glass-card p-10 w-full max-auto max-w-md relative z-10">
        <h2 className="text-3xl font-black text-slate-100 mb-2">Welcome Back</h2>
        <p className="text-slate-400 mb-8">Access your AI-powered market insights.</p>

        <form className="flex flex-col gap-5" onSubmit={handleLogin}>
          <div className="space-y-1">
            <input
              type="text"
              placeholder="Username or Email"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Password"
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full py-4 mt-2">
            Login to Dashboard
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Don’t have an account?{" "}
          <span
            className="text-primary font-bold hover:underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
