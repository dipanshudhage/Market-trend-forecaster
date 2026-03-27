import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/authService";
// import "../styles/auth.css";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await signup({ username: name.trim(), email: email.trim(), password });
      alert("Account created successfully! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.detail || "Signup failed");
    }
  };
  const handleBack = () => {
    navigate("/");  // Goes to home page
  };
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full pointer-events-none" />



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
        <h2 className="text-3xl font-black text-slate-100 mb-2">Create Account</h2>
        <p className="text-slate-400 mb-8">Join the next generation of market analysis.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3 text-slate-200 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn-primary w-full py-4 mt-2">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <span
            className="text-primary font-bold hover:underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
