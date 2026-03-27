import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProfile } from "../services/authService";
// import "../styles/Landing.css";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!localStorage.getItem("token");
  const [profile, setProfile] = React.useState(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      const fetchProfile = async () => {
        try {
          const data = await getProfile();
          setProfile(data);
        } catch (error) {
          console.error("Failed to fetch profile in navbar", error);
        }
      };
      fetchProfile();
    }
  }, [isLoggedIn]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      window.location.href = `/#${id}`;
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
      <h2 className="text-2xl font-bold text-gradient">MarketForecaster</h2>
      <div className="flex items-center gap-8">
        <Link to="/" className="text-slate-300 hover:text-primary transition-colors font-medium">Home</Link>
        <button onClick={() => scrollToSection("about")} className="text-slate-300 hover:text-primary transition-colors font-medium cursor-pointer">
          About
        </button>
        <button onClick={() => scrollToSection("features")} className="text-slate-300 hover:text-primary transition-colors font-medium cursor-pointer">
          Features
        </button>
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-slate-300 hover:text-primary transition-colors font-medium">Dashboard</Link>
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 hover:border-primary/50 hover:text-primary transition-all cursor-pointer overflow-hidden"
              aria-label="Profile"
              onClick={() => navigate("/dashboard/profile")}
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-300 hover:text-primary transition-colors font-medium">Login</Link>
            <Link to="/signup" className="btn-primary py-2 px-5 text-sm">
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
