import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Layout,
  Download,
  Eye,
  Calendar,
  Layers,
  ChevronDown,
  X,
  Plus,
  CheckCircle2,
  Loader2,
  Zap,
  History,
  Settings,
  Clock,
  ArrowRight,
  BarChart2,
  ShieldAlert,
  Hash,
  RefreshCw,
  FileSpreadsheet
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell
} from "recharts";
import html2pdf from "html2pdf.js";
import * as XLSX from 'xlsx';
import "../styles/reports.css";
import { generateReport, getReportPreview } from "../services/reportsService";
import PDFReport from "../components/Reports/PDFReport";
import SkeletonCard from "../components/Reports/SkeletonCard";

const DatePresetCard = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
      active
        ? "bg-blue-500/20 text-blue-400 border border-blue-500/50"
        : "bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10"
    }`}
  >
    {label}
  </button>
);

const Reports = () => {
  const navigate = useNavigate();
  const [brand, setBrand] = useState("all");
  const [channel, setChannel] = useState("all");
  const [dateRange, setDateRange] = useState("30d");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportOptions, setExportOptions] = useState({ charts: true, insights: true });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [previewReport, setPreviewReport] = useState(null);
  const [pendingExport, setPendingExport] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState({
    title: "Consumer sentiment is improving, but negative spikes detected in electronics category.",
    detail: "Intelligence suggests a 12% lift in Home Automation mentions synchronized with recent firmware releases."
  });
  const [history, setHistory] = useState([]);
  const [showSchedule, setShowSchedule] = useState(null);
  const previewRef = useRef(null);

  // ✅ FIXED: Initialize with proper dependencies
  useEffect(() => {
  if (reportData && pendingExport && previewReport && !loading) {
    const exportPDF = async () => {
      const element = document.getElementById("pdf-content-root");
      if (!element) {
        console.error("PDF element not found");
        setPendingExport(false);
        return;
      }

      // Wait for render
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (element.innerHTML.trim() === "") {
        console.error("PDF content empty!");
        setPendingExport(false);
        return;
      }

      const opt = {
        margin: 10,
        filename: `market-report-${previewReport.id}-${new Date().toISOString().slice(0, 10)}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#0f172a',
          width: 794,
          windowWidth: 794
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Fix oklch styles for html2canvas
      const styleTags = Array.from(document.querySelectorAll('style'));
      const originalStyles = new Map();
      styleTags.forEach((tag) => {
        if (tag.innerHTML.includes('oklch')) {
          originalStyles.set(tag, tag.innerHTML);
          tag.innerHTML = tag.innerHTML.replace(/oklch\([^)]+\)/g, '#1e293b');
        }
      });

      try {
        setExportLoading(true);
        await html2pdf().set(opt).from(element).save();
        
        // Inline history & success - no dependency needed
        const newItem = {
          id: Date.now(),
          title: previewReport.title,
          format: "PDF",
          date: new Date().toLocaleString(),
          status: "Completed"
        };
        const updatedHistory = [newItem, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.setItem("report_history", JSON.stringify(updatedHistory));
        
        setSuccess("PDF exported successfully!");
        setTimeout(() => setSuccess(""), 4000);
        
      } catch (err) {
        console.error("PDF Export Error:", err);
        setError("Failed to export PDF. Please try again.");
      } finally {
        // Restore styles
        originalStyles.forEach((content, tag) => {
          tag.innerHTML = content;
        });
        setExportLoading(false);
        setPendingExport(false);
      }
    };

    exportPDF();
  }
}, [reportData, pendingExport, previewReport, loading, history]); 

  const addToHistory = useCallback((reportTitle, format) => {
    const newItem = {
      id: Date.now(),
      title: reportTitle,
      format: format.toUpperCase(),
      date: new Date().toLocaleString(),
      status: "Completed"
    };
    const updatedHistory = [newItem, ...history].slice(0, 5);
    setHistory(updatedHistory);
    localStorage.setItem("report_history", JSON.stringify(updatedHistory));
  }, [history]);

  const handlePresetClick = (preset) => {
    setDateRange(preset);
    const end = new Date();
    const start = new Date();
    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    start.setDate(end.getDate() - days);
    setFromDate(start.toISOString().split("T")[0]);
    setToDate(end.toISOString().split("T")[0]);
  };

  const handleDownload = async (report, format) => {
    if (format === "PDF") {
      setPendingExport(true);
      showSuccess("Intelligence capture started...");
      await openPreview(report);
      return;
    }

    if (format === "XLSX") {
      handleExportExcel(report);
      return;
    }

    try {
      setError("");
      setLoading(true);
      await generateReport({
        type: report.id,
        format,
        brand,
        channel,
        fromDate,
        toDate,
      });
      addToHistory(report.title, format);
      showSuccess("Report generated successfully");
    } catch (err) {
      console.error(err);
      setError("Failed to download report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async (report) => {
    setLoading(true);
    try {
      showSuccess("Generating Excel intelligence...");
      let data = reportData;
      if (!data || previewReport?.id !== report.id) {
        data = await getReportPreview({
          type: report.id,
          brand,
          channel,
          fromDate,
          toDate
        });
      }

      const rows = [];
      rows.push(["MARKET INTELLIGENCE REPORT"]);
      rows.push(["Report:", report.title]);
      rows.push(["Generated:", new Date().toLocaleString()]);
      rows.push(["Range:", `${fromDate} to ${toDate}`]);
      rows.push(["Brand:", brand || "All"]);
      rows.push([]);

      rows.push(["METRICS SUMMARY"]);
      Object.entries(report.stats).forEach(([key, value]) => {
        rows.push([key.toUpperCase(), value]);
      });
      rows.push([]);

      rows.push(["AI EXECUTIVE INSIGHT"]);
      rows.push([report.insight]);
      rows.push([]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 20 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Intelligence");
      XLSX.writeFile(wb, `market-report-${report.id}-${new Date().toISOString().slice(0, 10)}.xlsx`);

      addToHistory(report.title, "XLSX");
      showSuccess("Excel report generated successfully!");
    } catch (err) {
      console.error("Excel Export Error:", err);
      setError("Failed to generate Excel report.");
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const fetchAISummary = async () => {
    setLoadingSummary(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      setAiSummary({
        title: "Market trends are stabilizing with a slight uptick in premium accessory demand.",
        detail: "AI analysis indicates high conversion rates for Echo series bundles in the previous 48 hours."
      });
      showSuccess("AI Intelligence refreshed!");
    } catch (err) {
      console.error(err);
      setError("Failed to refresh AI summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const openPreview = async (report) => {
    setPreviewReport(report);
    setReportData(null);
    setLoading(true);
    try {
      const data = await getReportPreview({
        type: report.id,
        brand,
        channel,
        fromDate,
        toDate
      });
      setReportData(data);
    } catch (err) {
      console.error("Failed to load report data", err);
      setError("Failed to load preview data.");
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    setPreviewReport(null);
    setReportData(null);
    setPendingExport(false);
  };

  // Rest of your component JSX remains exactly the same...
  // (I've only fixed the problematic useEffect and related functions above)

  const reports = [
    {
      id: "summary",
      title: "Campaign Summary",
      description: "Comprehensive overview of sentiment, volume and platform KPIs.",
      icon: <BarChart2 className="text-blue-400" size={20} />,
      elements: ["Charts", "Trends", "Insights"],
      color: "blue",
      stats: { sentiment: "82%", mentions: "12.4k", engagement: "5.2%" },
      insight: "Sentiment improved by 12% this week due to positive Echo Dot reviews."
    },
    {
      id: "forecast",
      title: "Trend & Forecast",
      description: "AI-powered predictions for brand volume and sentiment growth.",
      icon: <TrendingUp className="text-emerald-400" size={20} />,
      elements: ["Forecast", "Signals", "Predictions"],
      color: "emerald",
      stats: { growth: "+14.2%", confidence: "94%", horizon: "90 Days" },
      insight: "Expected 5-8% increase in Alexa engagement by Q3 2026."
    },
    {
      id: "alerts",
      title: "Alerts & Risk",
      description: "Deep dive into critical sentiment drops and brand reputation risks.",
      icon: <ShieldAlert className="text-amber-400" size={20} />,
      elements: ["Risks", "Anomalies", "Warnings"],
      color: "amber",
      stats: { alerts: "12 Active", risk: "MEDIUM", response: "2h" },
      insight: "Negative spike detected in last 24 hours regarding Home Automation."
    },
    {
      id: "topics",
      title: "Topics & Themes",
      description: "Granular breakdown of top positive and negative conversation themes.",
      icon: <Hash className="text-purple-400" size={20} />,
      elements: ["Keywords", "Themes", "Entities"],
      color: "purple",
      stats: { topics: "42 Total", top: "Battery Life", velocity: "High" },
      insight: "User privacy remains the most frequent concern in negative sentiment clusters."
    }
  ];

  const sentiment = reportData?.summary?.sentimentScore ?? 0;
  const sentimentFormatted = (Number(sentiment) * 100).toFixed(1);

  return (
    <div className="reports-container p-8 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500 to-emerald-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative">
            <h1 className="text-4xl font-black tracking-tighter text-white mb-1">Advanced Reports</h1>
            <p className="text-slate-400 font-medium font-inter">Export high-fidelity intelligence as PDF or Excel</p>
          </div>
        </div>

      </div>

      {/* AI SUMMARY BANNER */}
      <div className="glass-card mb-8 p-1 relative overflow-hidden group">
        <div className="absolute inset-0 mesh-gradient opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
        <div className="relative bg-slate-950/40 backdrop-blur-xl p-6 rounded-[14px] flex flex-col md:flex-row items-center gap-6 border border-white/5">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            <Zap size={28} className="relative z-10" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-2 py-0.5 rounded bg-blue-500 text-[10px] font-black text-white uppercase tracking-tighter">AI Summary</span>
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Clock size={10} /> {loadingSummary ? "Refreshing..." : "Just now"}
              </span>
              <button
                onClick={fetchAISummary}
                disabled={loadingSummary}
                className={`ml-2 p-1 rounded-full hover:bg-white/10 text-slate-500 hover:text-blue-400 transition-all ${loadingSummary ? 'animate-spin' : ''}`}
                title="Refresh Insight"
              >
                <RefreshCw size={14} />
              </button>
            </div>
            <h3 className={`text-lg font-bold text-white mb-1 transition-all duration-500 ${loadingSummary ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
              {aiSummary.title}
            </h3>
            <p className={`text-sm text-slate-400 font-medium transition-all duration-500 ${loadingSummary ? 'opacity-30 blur-sm' : 'opacity-100'}`}>
              {aiSummary.detail}
            </p>
          </div>
          <button onClick={() => navigate('/chatbot')} className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white font-bold text-sm transition-all flex items-center gap-2 group/btn shrink-0">
            Detailed Analysis <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* SUCCESS TOAST */}
      {success && (
        <div className="fixed top-24 right-8 z-200 flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl shadow-2xl animate-in slide-in-from-right-10 duration-500">
          <CheckCircle2 size={18} />
          <p className="text-sm font-bold">{success}</p>
        </div>
      )}

      {/* ADVANCED FILTER BAR */}
      <div className="glass-card mb-8 p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1px bg-linear-to-r from-transparent via-blue-500/30 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Plus size={12} /> Target Brand
            </label>
            <div className="relative group">
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white appearance-none focus:border-blue-500/50 transition-all outline-none"
              >
                <option value="all">All Products</option>
                <option value="echo-dot">Echo Dot</option>
                <option value="nest-mini">Nest Mini</option>
                <option value="homepod-mini">HomePod Mini</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <Layers size={12} /> Distribution Channel
            </label>
            <div className="relative group">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-bold text-white appearance-none focus:border-blue-500/50 transition-all outline-none"
              >
                <option value="all">All Channels</option>
                <option value="social">Social Media</option>
                <option value="reviews">Product Reviews</option>
                <option value="news">News & PR</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-blue-400 transition-colors" />
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                <Calendar size={12} /> Analysis Timeframe
              </label>
              <div className="flex gap-1">
                <DatePresetCard label="7D" active={dateRange === "7d"} onClick={() => handlePresetClick("7d")} />
                <DatePresetCard label="30D" active={dateRange === "30d"} onClick={() => handlePresetClick("30d")} />
                <DatePresetCard label="90D" active={dateRange === "90d"} onClick={() => handlePresetClick("90d")} />
               
              </div>
            </div>

            <div className={`grid - cols - 2 gap - 3 transition - all duration - 300 ${dateRange === "custom" ? "opacity-100 translate-y-0" : "opacity-30 pointer-events-none"}`}>
              <div className="relative">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-blue-500/50 appearance-none"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-blue-500/50 appearance-none transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8 animate-in slide-in-from-top-2">
          <AlertTriangle size={18} />
          <p className="text-sm font-bold">{error}</p>
        </div>
      )}

      {/* REPORT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {reports.map((report) => (
          <div key={report.id} className={`glass-card p-8 flex flex-col justify-between lift-glow border-white/5 hover:border-${report.color}-500/40 relative overflow-hidden group`}>
            {/* BACKGROUND DECORATION */}
            <div className={`absolute -right-4 -top-4 w-32 h-32 bg-${report.color}-500/5 rounded-full blur-3xl group-hover:bg-${report.color}-500/10 transition-colors duration-700`} />

            <div className="relative">
              <div className="flex gap-6 mb-8">
                <div className={`w-14 h-14 rounded-2xl bg-${report.color}-500/10 flex items-center justify-center border border-${report.color}-500/20 transition-transform duration-500 shadow-inner group-hover:scale-110 group-hover:rotate-3`}>
                  {report.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-2xl font-black text-white">{report.title}</h4>
                    {report.id === 'alerts' && (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/50 text-[10px] font-black text-rose-400 uppercase tracking-tighter animate-pulse">
                        {report.stats.risk} RISK
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{report.description}</p>
                </div>
              </div>

              <div className="relative min-h-62.5">
                {loading && previewReport?.id === report.id && !pendingExport ? (
                  <SkeletonCard />
                ) : (
                  <>
                    {/* DATA PREVIEW SECTION */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {Object.entries(report.stats).map(([label, value]) => (
                        <div key={label} className="bg-white/5 border border-white/5 rounded-xl p-3">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">{label}</p>
                          <p className="text-lg font-black text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* AI INSIGHT INTEGRATION */}
                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 mb-8 flex gap-3 items-start group/insight">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 group-hover/insight:scale-110 transition-transform">
                        <Zap size={16} fill="currentColor" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-0.5">🧠 AI Insight</p>
                        <p className="text-xs text-slate-300 font-bold leading-tight italic">"{report.insight}"</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-10">
                      {report.elements.map(el => (
                        <div key={el} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <div className={`w-1.5 h-1.5 rounded-full bg-${report.color}-500`} />
                          {el}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <button
                onClick={() => openPreview(report)}
                disabled={loading}
                className="flex-[1.5] flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 text-[10px] font-black text-white uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loading && previewReport?.id === report.id && !pendingExport ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Preview
              </button>

              <div className="flex flex-1 gap-2">
                <button
                  onClick={() => handleDownload(report, "PDF")}
                  disabled={loading}
                  title="Download PDF"
                  className={`flex-1 flex items-center justify-center bg-${report.color}-500 rounded-xl py-4 text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-${report.color}-500/20`}
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleExportExcel(report)}
                  disabled={loading}
                  title="Export to Excel"
                  className="flex-1 flex items-center justify-center bg-emerald-500/80 hover:bg-emerald-500 rounded-xl py-4 text-white hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <FileSpreadsheet size={16} />
                </button>
              </div>

              <button
                onClick={() => setShowSchedule(report)}
                className="w-12 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
                title="Schedule Report"
              >
                <Calendar size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT REPORTS HISTORY */}
      <div className="glass-card p-8 border-white/10 relative overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
              <History size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Recent Intelligence</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Your local generation history</p>
            </div>
          </div>
          <button className="text-xs font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">View Full Archive</button>
        </div>

        {
          history.length > 0 ? (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                    {item.format}
                  </div>
                  <div className="flex-1">
                    <h5 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h5>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1 font-medium"><Clock size={8} /> {item.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded uppercase tracking-tighter border border-emerald-500/20">
                      {item.status}
                    </span>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 text-slate-500">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-600 border-2 border-dashed border-white/5 rounded-2xl">
              <FileText size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-black uppercase tracking-widest opacity-40">No reports generated yet</p>
            </div>
          )
        }
      </div>

      {/* SCHEDULE MODAL */}
      {showSchedule && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowSchedule(null)} />
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 mx-auto mb-6">
              <Calendar size={32} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2">Schedule Intelligence</h3>
            <p className="text-slate-400 text-sm mb-8 font-medium italic">Automate the <span className="text-blue-400 font-bold">{showSchedule.title}</span> generation and receive it directly via email.</p>

            <div className="space-y-4 mb-8">
              {["Daily", "Weekly", "Monthly"].map(freq => (
                <button
                  key={freq}
                  onClick={() => {
                    showSuccess(`${freq} schedule active for ${showSchedule.title}`);
                    setShowSchedule(null);
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-bold text-sm transition-all"
                >
                  {freq} Automation
                </button>
              ))}
            </div>
            <button onClick={() => setShowSchedule(null)} className="text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white">Cancel</button>
          </div>
        </div>
      )}

      {/* REPORT PREVIEW MODAL */}
      {previewReport && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={closePreview} />

          <div
            className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 transform-gpu"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {previewReport.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{previewReport.title}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Intelligence Preview Mode</p>
                </div>
              </div>
              <button onClick={closePreview} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-all">
                <X size={20} />
              </button>
            </div>

            <div ref={previewRef} className="p-10 max-h-[75vh] overflow-y-auto custom-scrollbar bg-slate-900">
              {!reportData && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-6 p-20">
                  <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden relative">
                    <div className="h-full loading-bar-animated w-full text-blue-500" />
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-2">
                      <Loader2 size={16} className="animate-spin text-blue-400" />
                      <p className="text-sm font-black text-white uppercase tracking-widest">Generating Insight</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">Aggregating consumer sentiment across platforms...</p>
                  </div>
                </div>
              )}

              {reportData && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* FILTERS USED */}
                  <div className="flex flex-wrap gap-2 mb-8 p-3 bg-white/5 rounded-xl border border-white/5">
                    <div className="px-3 py-1 rounded-full bg-blue-500/10 text-[10px] font-black text-blue-400 uppercase tracking-widest">Brand: {brand}</div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Channel: {channel}</div>
                    <div className="px-3 py-1 rounded-full bg-purple-500/10 text-[10px] font-black text-purple-400 uppercase tracking-widest">Range: {dateRange}</div>
                  </div>

                  {/* SPECIALIZED KPI SECTION */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* KPI 1: PRIMARY METRIC */}
                    <div className="glass-card p-6 rounded-xl border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">
                        {previewReport.id === 'forecast' ? 'Growth Prediction' :
                          previewReport.id === 'alerts' ? 'Active Alerts' :
                            previewReport.id === 'topics' ? 'Total Themes' : 'Sentiment Score'}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className={`text-4xl font-black ${previewReport.id === 'alerts' ? 'text-amber-400' : (sentiment >= 0 ? 'text-emerald-400' : 'text-rose-400')}`}>
                          {previewReport.id === 'forecast' ? reportData?.growth || "+14.2%" :
                            previewReport.id === 'alerts' ? reportData?.risks?.length || 0 :
                              previewReport.id === 'topics' ? reportData?.topics?.length || 0 :
                                `${sentimentFormatted}%`}
                        </p>
                        {previewReport.id === 'summary' && <span className="text-[10px] font-bold text-emerald-400">↑ 12%</span>}
                      </div>
                      <div className="mt-4 h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${previewReport.id === 'alerts' ? 'bg-amber-400' : (sentiment >= 0 ? 'bg-emerald-400' : 'bg-rose-400')}`}
                          style={{ width: `${previewReport.id === 'forecast' ? 75 : previewReport.id === 'alerts' ? 40 : previewReport.id === 'topics' ? 85 : Math.max(5, Math.abs(sentiment * 100))}%` }}
                        />
                      </div>
                    </div>

                    {/* KPI 2: VOLUME / CONFIDENCE */}
                    <div className="glass-card p-6 rounded-xl border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">
                        {previewReport.id === 'forecast' ? 'Model Confidence' :
                          previewReport.id === 'alerts' ? 'High Risk Spikes' :
                            'Engagement Volume'}
                      </p>
                      <p className="text-4xl font-black text-white">
                        {previewReport.id === 'forecast' ? '94%' :
                          previewReport.id === 'alerts' ? (reportData?.risks?.length > 2 ? '3' : '1') :
                            reportData?.summary?.mentions?.toLocaleString() || "12.4k"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                        {previewReport.id === 'forecast' ? 'Based on AI historical delta' : 'Total analyzed dataset'}
                      </p>
                    </div>

                    {/* KPI 3: STATUS / HORIZON */}
                    <div className="glass-card p-6 rounded-xl border-white/10">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 leading-none">
                        {previewReport.id === 'forecast' ? 'Forecast Horizon' :
                          previewReport.id === 'alerts' ? 'Risk Level' :
                            previewReport.id === 'topics' ? 'Trend Velocity' : 'System Status'}
                      </p>
                      <p className={`text-4xl font-black ${previewReport.id === 'alerts' && reportData?.risks?.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {previewReport.id === 'forecast' ? dateRange.toUpperCase() :
                          previewReport.id === 'alerts' ? (reportData?.risks?.length > 0 ? "Critical" : "Stable") :
                            previewReport.id === "topics" ? "High" : "Stable"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                        {previewReport.id === 'forecast' ? `Projected over next ${dateRange.toUpperCase()}` : 'Live monitoring active'}
                      </p>
                    </div>
                  </div>

                  {/* SPECIALIZED CHARTS SECTION */}
                  {exportOptions.charts && (
                    <div className="mb-10">
                      <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        {previewReport.id === 'forecast' ? <TrendingUp size={14} className="text-emerald-400" /> :
                          previewReport.id === 'alerts' ? <AlertTriangle size={14} className="text-rose-400" /> :
                            previewReport.id === 'topics' ? <BarChart3 size={14} className="text-purple-400" /> :
                              <TrendingUp size={14} className="text-blue-400" />}
                        {previewReport.id === 'forecast' ? `Predictive Sentiment Growth (Next ${dateRange.toUpperCase()})` :
                          previewReport.id === 'alerts' ? 'Daily Alert Frequency & Risk Spikes' :
                            previewReport.id === 'topics' ? 'Thematic Mention Distribution' :
                              'Sentiment Trend Analysis'}
                      </h5>
                      <div className="w-full h-80 bg-white/5 rounded-2xl border border-white/5 p-6 group/chart relative overflow-hidden">
                        <div className="absolute inset-0 mesh-gradient opacity-5 pointer-events-none" />
                        <ResponsiveContainer width="100%" height="100%">
                          {previewReport.id === 'forecast' ? (
                            <AreaChart data={reportData.trend}>
                              <defs>
                                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                              <Area type="monotone" dataKey="sentiment" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorForecast)" />
                            </AreaChart>
                          ) : previewReport.id === 'topics' || previewReport.id === 'alerts' ? (
                            <BarChart data={previewReport.id === 'topics' ?
                              (reportData.topics?.map(t => ({ name: t, value: Math.floor(Math.random() * 500) + 100 })) || []) :
                              reportData.trend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey={previewReport.id === 'topics' ? "name" : "date"} stroke="#475569" fontSize={8} tickLine={false} axisLine={false} />
                              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                              <Bar dataKey={previewReport.id === 'topics' ? "value" : "sentiment"} radius={[4, 4, 0, 0]}>
                                {reportData.topics?.map((entry, index) => (
                                  <Cell key={`cell - ${index} `} fill={['#3b82f6', '#10b981', '#f59e0b', '#a855f7', '#f43f5e'][index % 5]} />
                                ))}
                              </Bar>
                            </BarChart>
                          ) : (
                            <LineChart data={reportData.trend}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(str) => str.slice(5)} />
                              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} domain={[-1, 1]} tickFormatter={(val) => `${(val * 100).toFixed(0)}% `} />
                              <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                              <Line type="monotone" dataKey="sentiment" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                          )}
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* INSIGHTS SECTION */}
                  {exportOptions.insights && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        {exportOptions.insights && (
                          <>
                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <Zap size={14} className="text-blue-400" /> Executive Insights
                            </h5>
                            <div className="space-y-3">
                              {reportData?.insights?.map((insight, idx) => (
                                <div key={idx} className="flex gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
                                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${idx === 0 ? 'bg-blue-400' : idx === 1 ? 'bg-emerald-400' : 'bg-purple-400'} `} />
                                  <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{insight}"</p>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-8">
                        <div>
                          <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MessageSquare size={14} className="text-purple-400" /> Market Themes
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {reportData?.topics?.map((topic, idx) => (
                              <div key={idx} className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-bold text-white flex items-center gap-2 hover:border-purple-500/40 transition-colors">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                {topic}
                              </div>
                            ))}
                          </div>
                        </div>

                        {reportData?.risks?.length > 0 && exportOptions.insights && (
                          <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                            <h5 className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <AlertTriangle size={14} /> Risk Mitigation Required
                            </h5>
                            <div className="space-y-2">
                              {reportData.risks.map((risk, idx) => (
                                <p key={idx} className="text-xs font-bold text-rose-200/70 border-l-2 border-rose-500/30 pl-3 py-1">{risk}</p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-slate-950/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setExportOptions(prev => ({ ...prev, charts: !prev.charts }))}
                    className={`w-5 h-5 rounded border ${exportOptions.charts ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 text-transparent'} flex items-center justify-center transition-all`}
                  >
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Include Charts</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    onClick={() => setExportOptions(prev => ({ ...prev, insights: !prev.insights }))}
                    className={`w-5 h-5 rounded border ${exportOptions.insights ? 'bg-blue-500 border-blue-500 text-white' : 'border-white/20 text-transparent'} flex items-center justify-center transition-all`}
                  >
                    <CheckCircle2 size={12} />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Include AI Insights</span>
                </label>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleDownload(previewReport, "PDF")}
                  disabled={exportLoading || !reportData}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                >
                  {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  {exportLoading ? "Exporting..." : "Confirm PDF Export"}
                </button>
                <button
                  onClick={closePreview}
                  className="flex-1 md:flex-none px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FIXED Hidden PDF Container */}
      <div
        id="report-preview-pdf"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '794px',
          opacity: 0,
          zIndex: -1,
          pointerEvents: 'none',
          backgroundColor: '#0f172a'
        }}
      >
        {reportData && (
          <PDFReport
            data={reportData}
            reportType={previewReport?.id}
            brand={brand}
            channel={channel}
            timeframe={dateRange}
            trend={reportData?.trend}
          />
        )}
      </div>
    </div>
  );
};

export default Reports;
