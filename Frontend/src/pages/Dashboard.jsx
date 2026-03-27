import { useEffect, useState } from "react";

import "../styles/dashboard.css";
import { getDashboardOverview } from "../services/dashboardService";
import KpiRow from "../components/dashboard/KpiRow";
import TrendPanel from "../components/dashboard/TrendPanel";
import TopicsPanel from "../components/dashboard/TopicsPanel";
import ChannelsPanel from "../components/dashboard/ChannelsPanel";
import AlertsPreviewPanel from "../components/dashboard/AlertsPreviewPanel";
import SummaryPanel from "../components/dashboard/SummaryPanel";
import RecentActivityPanel from "../components/dashboard/RecentActivityPanel";




const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters - Source, Product & Date Range
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
    async function load() {
      setLoading(true);
      try {
        const overview = await getDashboardOverview(filters);
        setData(overview);
      } catch (error) {
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filters]);

  if (loading) {
    return (


      <div className="dashboard" style={{ padding: "100px", textAlign: "center" }}>
        <div>Loading dashboard...</div>
      </div>

    );
  }

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
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Market Overview</h1>
        <p className="text-slate-400">AI-powered trend & sentiment analysis across all products</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Source</label>
          <select
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer min-w-40"
            value={filters.source}
            onChange={(e) =>
              setFilters((f) => ({ ...f, source: e.target.value }))
            }
          >
            <option value="all">All Sources</option>
            <option value="amazon-reviews">Amazon Reviews</option>
            <option value="youtube">YouTube Comments</option>
            <option value="news">News Articles</option>
            <option value="web-reviews">Review Sites</option>
          </select>
        </div>

        <div className="hidden md:block w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Product</label>
          <select
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer min-w-40"
            value={filters.product}
            onChange={(e) =>
              setFilters((f) => ({ ...f, product: e.target.value }))
            }
          >
            {productOptions.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden md:block w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date Range</label>
          <select
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm font-medium text-slate-300 focus:ring-2 focus:ring-primary/50 outline-none transition-all cursor-pointer min-w-40"
            value={filters.range}
            onChange={(e) =>
              setFilters((f) => ({ ...f, range: e.target.value }))
            }
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

      </div>

      {/* KPI Cards */}
      <KpiRow summary={data.summary} filters={filters} />

      {/* Main Grid: Trend + Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TrendPanel trendData={data.trend_comparison} activeProduct={filters.product} />
        </div>
        <div>
          <TopicsPanel topics={data.topics} />
        </div>
      </div>

      {/* Bottom Grid: Channels + Alerts + Summary + Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        <ChannelsPanel channels={data.channels} />
        <AlertsPreviewPanel alerts={data.alerts} />
        <SummaryPanel text={data.summaryText} />
        <RecentActivityPanel activities={data.recent_data} />
      </div>
    </div>
  );
};

export default Dashboard;
