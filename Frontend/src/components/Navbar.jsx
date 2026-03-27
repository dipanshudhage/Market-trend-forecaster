import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BarChart3, ChevronRight, User } from "lucide-react";
import { getProfile } from "../services/authService";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    if (isLoggedIn) {
      getProfile().then(setProfile).catch(console.error);
    }
  }, [isLoggedIn]);

  const scrollToSection = (id) => {
    setIsOpen(false);
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const navLinks = [
    { name: "Home", to: "/", type: "link" },
    { name: "About", to: "about", type: "scroll" },
    { name: "Features", to: "features", type: "scroll" },
    { name: "Products", to: "products", type: "scroll" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-transform">
            <BarChart3 className="text-primary w-5 h-5" />
          </div>
          <span className="text-xl font-black text-white tracking-tighter uppercase italic">Market AI</span>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            link.type === "link" ? (
              <Link key={link.name} to={link.to} className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                {link.name}
              </Link>
            ) : (
              <button 
                key={link.name} 
                onClick={() => scrollToSection(link.to)}
                className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors cursor-pointer"
              >
                {link.name}
              </button>
            )
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Link to="/dashboard" className="text-sm font-bold uppercase tracking-widest text-primary hover:text-white transition-colors">
                Dashboard
              </Link>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="w-10 h-10 rounded-full border border-white/10 overflow-hidden hover:border-primary/50 transition-all"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                )}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <Link to="/login" className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link to="/signup" className="btn-primary py-2 px-5 text-xs">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-slate-900 border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-6">
              {navLinks.map((link) => (
                link.type === "link" ? (
                  <Link 
                    key={link.name} 
                    to={link.to} 
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold text-slate-300 hover:text-primary"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button 
                    key={link.name} 
                    onClick={() => scrollToSection(link.to)}
                    className="text-left text-lg font-bold text-slate-300 hover:text-primary"
                  >
                    {link.name}
                  </button>
                )
              ))}
              <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                {isLoggedIn ? (
                  <Link 
                    to="/dashboard" 
                    onClick={() => setIsOpen(false)}
                    className="btn-primary text-center py-3"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      onClick={() => setIsOpen(false)}
                      className="text-center font-bold text-slate-300 py-2"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setIsOpen(false)}
                      className="btn-primary text-center py-3"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
