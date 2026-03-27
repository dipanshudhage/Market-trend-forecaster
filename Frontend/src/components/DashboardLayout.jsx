import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { getProfile } from '../services/authService';

const getAILabel = (pathname) => {
  if (pathname.includes("reports")) return "Ask AI about reports";
  if (pathname.includes("explorer")) return "Analyze sentiment";
  if (pathname.includes("brands")) return "Compare brands";
  return "Ask AI";
};

// ── Sidebar nav items ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: '', label: 'Overview', icon: '📊', path: '/dashboard' },
  { id: 'brands', label: 'Brand Comparison', icon: '⚖️', path: '/dashboard/brands' },
  { id: 'explorer', label: 'Sentiment Explorer', icon: '🔍', path: '/dashboard/explorer' },
  { id: 'alerts', label: 'Alerts', icon: '🔔', path: '/dashboard/alerts' },
  { id: 'reports', label: 'Reports', icon: '📋', path: '/dashboard/reports' },
  { id: 'chatbot', label: 'AI Chatbot', icon: '🤖', path: '/dashboard/chatbot' },
  { id: 'forecast', label: 'Forecast', icon: '🔮', path: '/dashboard/forecast' },
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

// ── DashboardLayout ────────────────────────────────────────────────────────
const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const lastUpdated = useLastUpdated();
  const [profile, setProfile] = useState(null);
  const meta = PAGE_META[location.pathname] || { title: 'Dashboard', subtitle: '' };

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

        {/* Right — live indicator + last updated + profile */}
        <div className="flex items-center gap-4">

          {/* Live indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Live</span>
          </div>

          {/* Last updated */}
          <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Updated {lastUpdated}
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10" />

          {/* Profile button */}
          <button
            type="button"
            onClick={() => navigate('/dashboard/profile')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border overflow-hidden ${location.pathname === '/dashboard/profile'
              ? 'bg-primary/20 border-primary/40 text-primary'
              : 'bg-slate-800 border-white/10 text-slate-400 hover:text-primary hover:border-primary/50'
              }`}
            aria-label="Profile"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5Z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* ── Body (sidebar + content) ─────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <aside className="w-60 shrink-0 bg-slate-900/30 border-r border-white/10 p-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group cursor-pointer text-left w-full ${isActive
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_rgba(56,189,248,0.08)]'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                  }`}
                onClick={() => navigate(item.path)}
              >
                <span className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm truncate">{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </button>
            );
          })}

          {/* Sidebar footer — version badge */}
          <div className="mt-auto pt-4 border-t border-white/5">
            <div className="px-4 py-2 rounded-xl bg-white/2 border border-white/5">
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">MarketForecaster</p>
              <p className="text-[10px] text-slate-700 mt-0.5">v0.1 · Beta</p>
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
