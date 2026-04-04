import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Scale, Search, Bell, FileText, Bot, TrendingUp, LogOut, Command, User, AlertTriangle, Activity, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProfile, logout } from '../services/authService';

const getAILabel = (pathname) => {
  if (pathname.includes("reports")) return "Ask AI about reports";
  if (pathname.includes("explorer")) return "Analyze sentiment";
  if (pathname.includes("brands")) return "Compare brands";
  return "Ask AI";
};

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: '', label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'brands', label: 'Brand Comparison', icon: Scale, path: '/dashboard/brands' },
  { id: 'explorer', label: 'Sentiment Explorer', icon: Search, path: '/dashboard/explorer' },
  { id: 'alerts', label: 'Alerts', icon: Bell, path: '/dashboard/alerts' },
  { id: 'reports', label: 'Reports', icon: FileText, path: '/dashboard/reports' },
  { id: 'chatbot', label: 'AI Chatbot', icon: Bot, path: '/dashboard/chatbot' },
  { id: 'forecast', label: 'Forecast', icon: TrendingUp, path: '/dashboard/forecast' },
];

// ── Page meta derived from current path ───────────────────────────────────
const PAGE_META = {
  '/dashboard': { title: 'Market Overview', subtitle: 'AI-powered sentiment analysis across all products' },
  '/dashboard/brands': { title: 'Brand Comparison', subtitle: 'Side-by-side competitive sentiment analysis' },
  '/dashboard/explorer': { title: 'Sentiment Explorer', subtitle: 'Deep-dive into individual reviews and signals' },
  '/dashboard/alerts': { title: 'Alerts', subtitle: 'AI-detected anomalies and market signals' },
  '/dashboard/reports': { title: 'Reports', subtitle: 'Export and schedule AI-generated reports' },
  '/dashboard/chatbot': { title: 'AI Chatbot', subtitle: 'Ask market questions in natural language' },
  '/dashboard/forecast': { title: 'Market Forecast', subtitle: 'AI-powered sentiment predictions & brand intelligence' },
  '/dashboard/profile': { title: 'Your Profile', subtitle: 'Manage your account and preferences' },
};

// ── Helper: format current time ────────────────────────────────────────────
function useLastUpdated() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Mock Notifications ───────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  { id: 1, type: "alert", title: "Sentiment Drop", message: "15% drop in sentiment detected for Echo Dot.", time: "10 mins ago", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" },
  { id: 2, type: "trend", title: "New Trending Topic", message: "'Battery Drain' mentions rising across Reddit.", time: "1 hr ago", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
  { id: 3, type: "system", title: "Report Ready", message: "Your Weekly Market Intelligence Report is generated.", time: "2 hrs ago", icon: CheckCircle2, color: "text-accent", bg: "bg-accent/10" }
];

// ── DashboardLayout ────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUpdated = useLastUpdated();
  const [profile, setProfile] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);
  const meta = PAGE_META[location.pathname] || { title: 'Dashboard', subtitle: '' };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile in layout", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-slate-950 flex flex-col">

      {/* ── Top Header ──────────────────────────────────────────────────── */}
      <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-slate-900/70 backdrop-blur-xl border-b border-white/10 z-40">

        {/* Left — brand + page title */}
        <div className="flex items-center gap-6">
          {/* Logo / brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-secondary flex items-center justify-center text-sm font-black text-white shadow-[0_0_16px_rgba(56,189,248,0.4)]">
              M
            </div>
            <span className="text-base font-black text-gradient tracking-tight hidden sm:block">
              MarketForecaster
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 hidden md:block" />

          {/* Page title breadcrumb */}
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-slate-200 leading-tight">{meta.title}</span>
            <span className="text-[10px] text-slate-500 leading-tight">{meta.subtitle}</span>
          </div>
        </div>

        {/* Right — search + live indicator + last updated + profile */}
        <div className="flex items-center gap-4">

          {/* Quick Search Command */}
          <button 
            onClick={() => navigate('/dashboard/chatbot')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/5 text-slate-400 hover:text-white hover:border-primary/40 transition-all cursor-pointer group"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
            <span className="text-[11px] font-medium hidden lg:block">Quick Analysis</span>
            <div className="flex items-center gap-0.5 opacity-60 ml-2">
              <Command className="w-3 h-3" />
              <span className="text-[10px] font-bold">K</span>
            </div>
          </button>

          <div className="w-px h-5 bg-white/10 hidden md:block" />

          {/* Bell Notification */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 transition-colors cursor-pointer group rounded-lg ${showNotifications ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Bell className={`w-4.5 h-4.5 ${!showNotifications && 'group-hover:animate-[wave_1s_ease-in-out_infinite]'}`} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-400 rounded-full border border-slate-900 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute right-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 origin-top-right"
                >
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-sm font-bold text-white">Notifications</h3>
                    <button className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-wider transition-colors cursor-pointer">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((notif) => {
                      const Icon = notif.icon;
                      return (
                        <div key={notif.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                          <div className="flex gap-3">
                            <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${notif.bg} ${notif.color} group-hover:scale-110 transition-transform`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between items-start gap-2">
                                <span className="text-xs font-bold text-slate-200">{notif.title}</span>
                                <span className="text-[10px] text-slate-500 whitespace-nowrap">{notif.time}</span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug">
                                {notif.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="p-3 text-center border-t border-white/5 hover:bg-white/5 transition-colors cursor-pointer cursor-pointer">
                    <span className="text-[11px] text-slate-400 font-bold">View full log &rarr;</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live</span>
          </div>

          {/* Last updated */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-500">
            Updated {lastUpdated}
          </div>

        </div>
      </header>

      {/* ── Body (sidebar + content) ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-60 shrink-0 bg-slate-900/30 border-r border-white/10 p-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer text-left w-full relative overflow-hidden ${isActive
                  ? 'bg-primary/5 text-primary border border-primary/20 shadow-[0_0_20px_rgba(56,189,248,0.05)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                onClick={() => navigate(item.path)}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-primary rounded-r-md shadow-[0_0_10px_#38bdf8]" />
                )}
                
                <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : 'group-hover:scale-110 group-hover:text-white'}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className={`text-sm truncate transition-colors ${isActive ? 'font-bold text-white' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}

          {/* Sidebar footer — Profile card */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard/profile')}>
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 overflow-hidden shrink-0 group-hover:border-primary/50 transition-colors">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <User className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-bold text-white truncate">{profile?.username || 'Analyst'}</span>
                <span className="text-[10px] text-slate-400 truncate">Enterprise Plan</span>
              </div>
              <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors pointer-events-auto" onClick={(e) => { e.stopPropagation(); logout(); navigate('/login'); }} />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,#1e293b,transparent)]">
          <div className="p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Floating AI FAB ──────────────────────────────────── */}
      {location.pathname !== '/dashboard/chatbot' && (
        <div className="group fixed bottom-6 right-6 z-50">
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl opacity-0 group-hover:opacity-100 animate-pulse transition-opacity duration-500"></div>

          {/* Tooltip */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-slate-900/90 backdrop-blur-md border border-white/10 text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl">
            Open AI Assistant
          </div>

          <button
            onClick={() => navigate("/dashboard/chatbot")}
            className="relative flex items-center gap-2 px-5 py-3 rounded-full bg-linear-to-r from-primary to-secondary text-white font-bold text-sm shadow-[0_8px_32px_rgba(56,189,248,0.4)] hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer overflow-hidden border border-white/20"
          >
            <span className="text-base">⚡</span>
            <span>{getAILabel(location.pathname)}</span>

            {/* Notification Indicator */}
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-accent rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
