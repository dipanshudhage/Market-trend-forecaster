import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import toast from "react-hot-toast";
import { login } from "../services/authService";
import loginBg from "../assets/login_bg.png";
import { Loader2, Mail, Lock, ArrowLeft, ShieldCheck, Zap, BarChart3, Sparkles } from "lucide-react";
import MouseGlow from "../components/common/MouseGlow";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mouse transformation for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-500, 500], [5, -5]);
  const rotateY = useTransform(x, [-500, 500], [-5, 5]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await login({
        username: username.trim(),
        password,
      });

      if (!data || !data.access_token) {
        throw new Error("Invalid response from server");
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Welcome back!");
      navigate("/dashboard", { replace: true });

    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.detail || error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  return (
    <div 
        className="min-h-screen bg-slate-950 flex overflow-hidden group"
        onMouseMove={handleMouseMove}
    >
      <MouseGlow />
      
      {/* 🏙️ LEFT SIDE: BRANDING & ILLUSTRATION */}
      <motion.div 
        style={{ rotateX, rotateY, perspective: 1000 }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5"
      >
        {/* Background Image with Overlay Mask */}
        <div className="absolute inset-0 z-0">
          <img 
            src={loginBg} 
            alt="Background" 
            className="w-full h-full object-cover opacity-80 scale-105"
          />
          {/* High-contrast mask for text legibility */}
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mb-12"
          >
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30 backdrop-blur-md">
              <BarChart3 className="text-primary w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase italic">Market AI</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h1 className="text-6xl font-black text-white leading-tight mb-6">
              AI-Powered <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_auto] animate-gradient-x italic">
                Market Analysis
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-md leading-relaxed">
              Unlock real-time sentiment insights and trend forecasting with our enterprise-grade AI engine.
            </p>
          </motion.div>
        </div>

        {/* Feature Pills */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { icon: <Sparkles className="w-4 h-4" />, label: "Real-time Processing" },
            { icon: <ShieldCheck className="w-4 h-4" />, label: "Secure Analysis" },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                y: [0, -10, 0] 
              }}
              transition={{ 
                delay: 0.8 + (i * 0.1),
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.5
                }
              }}
              className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-2xl shadow-2xl"
            >
              <div className="text-primary">{feat.icon}</div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{feat.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 🔐 RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/20 via-slate-950 to-slate-950">
        
        {/* Decorative Grid Texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <button
          onClick={() => navigate("/")}
          className="absolute top-8 left-8 px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all flex items-center gap-2 group backdrop-blur-md"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Home</span>
        </button>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-sm"
        >
          <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-white mb-3">Welcome Back</h2>
            <p className="text-slate-400">Continue your market forecasting journey.</p>
          </motion.div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <motion.div variants={itemVariants} className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Email or Username"
                className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                placeholder="Password"
                className="w-full bg-slate-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </motion.div>

            <motion.div variants={itemVariants} className="flex justify-end">
              <button type="button" className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">
                Forgot password?
              </button>
            </motion.div>

            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="relative overflow-hidden group btn-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>

          <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-slate-500">
            Don't have an account yet?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-primary font-black hover:underline underline-offset-4"
            >
              Create Account
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Blur Background (Hidden on desktop due to side panel) */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[150px] -z-10 lg:hidden" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[150px] -z-10 lg:hidden" />
    </div>
  );
};

export default Login;
