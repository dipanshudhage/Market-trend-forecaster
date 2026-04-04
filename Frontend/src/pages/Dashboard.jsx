import { useEffect, useState } from "react";
import { Plus, Layers, Calendar, ChevronDown, Activity } from "lucide-react";

import "../styles/dashboard.css";
import { getDashboardOverview } from "../services/dashboardService";
import KpiRow from "../components/dashboard/KpiRow";
import TrendPanel from "../components/dashboard/TrendPanel";
import TopicsPanel from "../components/dashboard/TopicsPanel";
import ChannelsPanel from "../components/dashboard/ChannelsPanel";
import AlertsPreviewPanel from "../components/dashboard/AlertsPreviewPanel";
import SummaryPanel from "../components/dashboard/SummaryPanel";
import RecentActivityPanel from "../components/dashboard/RecentActivityPanel";

const DatePresetCard = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
      active
        ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
        : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-slate-300"
    }`}
  >
    {label}
  </button>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    source: "all",
    product: "all",
    range: "30d",
  });

  const productOptions = [
    { id: "all", label: "All Products" },
    { id: "echo-dot", label: "Amazon Echo Dot" },
    { id: "nest-mini", label: "Google Nest Mini" },
    { id: "homepod-mini", label: "Apple HomePod Mini" },
  ];

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      try {
        const overview = await getDashboardOverview(filters);
        setData(overview);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [filters]);



  // 🔄 Loading UI
  if (loading) {
    return (
      <div className="dashboard" style={{ padding: "100px", textAlign: "center" }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  // ❌ No Data UI
  if (!data) {
    return (
      <div className="dashboard empty-state">
        <div style={{ padding: "100px", textAlign: "center", color: "#94a3b8" }}>
          No dashboard data available
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">

      {/* 🔥 HEADER + BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-primary to-secondary rounded-lg blur opacity-10 group-hover:opacity-25 transition duration-1000"></div>
        <div className="relative flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg shadow-primary/20 shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Market Overview
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/20 border border-accent/30 text-[10px] font-black text-accent uppercase tracking-widest animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                Live Data
              </span>
            </div>
            <p className="text-slate-400 font-medium">
              AI-powered trend & sentiment analysis across all products
            </p>
          </div>
        </div>
      </div>

      {/* 🔍 FILTER BAR */}
      <div className="glass-card mb-4 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          {/* SOURCE */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Layers size={12} /> Source
            </label>
            <div className="relative group">
              <select
                value={filters.source}
                onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none pr-8"
              >
                <option value="all">All Sources</option>
                <option value="amazon-reviews">Amazon Reviews</option>
                <option value="youtube">YouTube Comments</option>
                <option value="news">News Articles</option>
                <option value="web-reviews">Review Sites</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* PRODUCT */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Plus size={12} /> Product
            </label>
            <div className="flex flex-wrap gap-1 bg-slate-900/50 p-1 rounded-xl border border-white/10">
              {[{ id: "all", label: "All" }, { id: "echo-dot", label: "Echo" }, { id: "nest-mini", label: "Nest" }, { id: "homepod-mini", label: "HomePod" }].map((b) => (
                <button
                  key={b.id}
                  onClick={() => setFilters((f) => ({ ...f, product: b.id }))}
                  className={`flex-1 px-2 py-1 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-center ${
                    filters.product === b.id
                      ? "bg-primary/20 text-primary border border-primary/50 shadow-sm shadow-primary/20"
                      : "text-slate-400 border border-transparent hover:bg-white/5 hover:text-slate-200"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* DATE RANGE PILLS */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="flex justify-between items-center h-[34px] md:h-auto">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar size={12} /> Analysis Timeframe
              </label>
              <div className="flex gap-1 h-full md:h-auto items-end">
                <DatePresetCard label="7D" active={filters.range === "7d"} onClick={() => setFilters((f) => ({ ...f, range: "7d" }))} />
                <DatePresetCard label="30D" active={filters.range === "30d"} onClick={() => setFilters((f) => ({ ...f, range: "30d" }))} />
                <DatePresetCard label="90D" active={filters.range === "90d"} onClick={() => setFilters((f) => ({ ...f, range: "90d" }))} />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* 📊 KPI */}
      <KpiRow summary={data.summary} filters={filters} />

      {/* 📈 MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TrendPanel
            trendData={data.trend_comparison}
            activeProduct={filters.product}
          />
        </div>
        <div>
          <TopicsPanel topics={data.topics} />
        </div>
      </div>

      {/* 📦 BOTTOM GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mb-8">
        
        {/* Left Column - Channels */}
        <div className="flex flex-col">
            <div className="flex-1 h-full"><ChannelsPanel channels={data.channels} /></div>
        </div>
        
        {/* Middle Column - Alerts */}
        <div className="flex flex-col">
            <div className="flex-1 h-full"><AlertsPreviewPanel alerts={data.alerts} /></div>
        </div>
        
        {/* Right Column - Recent Activity */}
        <div className="flex flex-col">
            <div className="flex-1 h-full"><RecentActivityPanel activities={data.recent_data} /></div>
        </div>

        {/* Bottom Row - AI Insights (Full width) */}
        <div className="lg:col-span-3">
            <SummaryPanel text={data.summaryText} />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
