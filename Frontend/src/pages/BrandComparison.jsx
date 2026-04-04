import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { getBrandComparison } from '../services/dashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

// ─── Constants ───────────────────────────────────────────────────────────────
const BRAND_COLORS = {
  'echo-dot': { border: '#38bdf8', bg: 'rgba(56,189,248,0.65)', bgLight: 'rgba(56,189,248,0.12)', gradient: 'from-sky-500/10' },
  'nest-mini': { border: '#10b981', bg: 'rgba(16,185,129,0.65)', bgLight: 'rgba(16,185,129,0.12)', gradient: 'from-emerald-500/10' },
  'homepod-mini': { border: '#818cf8', bg: 'rgba(129,140,248,0.65)', bgLight: 'rgba(129,140,248,0.12)', gradient: 'from-indigo-500/10' },
};

const STATUS_CONFIG = {
  Positive: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400', ring: 'ring-emerald-400/30' },
  Stable: { bg: 'bg-sky-500/15', text: 'text-sky-400', dot: 'bg-sky-400', ring: 'ring-sky-400/30' },
  Declining: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-400', ring: 'ring-amber-400/30' },
  Critical: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-400', ring: 'ring-red-400/30' },
};

const TOPIC_ICONS = {
  'Sound Quality': '🔊',
  'Voice Recognition': '🎙️',
  'Smart Home': '🏠',
  'Price': '💰',
  'Connectivity': '📡',
  'General': '💬',
};

// ── Topic trend indicators ─────────────────────────────────────────────────
// We derive trend from sentiment score: positive → trending, negative → declining, ~0 → stable
function getTopicTrend(topicSentiment) {
  if (topicSentiment > 0.15) return { label: '↑ Trending', cls: 'text-emerald-400' };
  if (topicSentiment < -0.05) return { label: '↓ Declining', cls: 'text-red-400' };
  return { label: '→ Stable', cls: 'text-slate-400' };
}

// ── Sentiment score gauge strip ────────────────────────────────────────────
function SentimentGauge({ sentiment }) {
  const pct = ((sentiment + 1) / 2) * 100;          // map -1..1 → 0..100
  const isPos = sentiment >= 0;
  const color = sentiment >= 0.2 ? '#10b981' : sentiment >= 0 ? '#38bdf8' : sentiment >= -0.2 ? '#f59e0b' : '#f43f5e';
  const score = (sentiment * 100).toFixed(1);
  const label = score > 0 ? `+${score}` : `${score}`;
  return (
    <div className="flex flex-col gap-1 min-w-27.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-600 font-bold">-100</span>
        <span className="text-xs font-mono font-black" style={{ color }}>{label}</span>
        <span className="text-[10px] text-slate-600 font-bold">+100</span>
      </div>
      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden relative">
        {/* zero marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/10" />
        <div
          className="absolute top-0 bottom-0 rounded-full transition-all duration-700"
          style={{
            left: isPos ? '50%' : `${pct}%`,
            width: `${Math.abs(pct - 50)}%`,
            background: color,
          }}
        />
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Stable;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}

function SentimentBar({ positive, neutral, negative }) {
  return (
    <div className="flex w-full h-2 rounded-full overflow-hidden gap-px" title={`Positive: ${positive}% | Neutral: ${neutral}% | Negative: ${negative}%`}>
      <div className="bg-emerald-400 transition-all" style={{ width: `${positive}%` }} />
      <div className="bg-slate-500 transition-all" style={{ width: `${neutral}%` }} />
      <div className="bg-red-400 transition-all" style={{ width: `${negative}%` }} />
    </div>
  );
}

// ── Rich AI Insight panel ─────────────────────────────────────────────────
function AIInsightPanel({ insight, brands }) {
  if (!insight) return null;

  // Build structured bullet points dynamically from brand data
  const best = brands.length ? brands.reduce((a, b) => a.sentiment > b.sentiment ? a : b) : null;
  const worst = brands.length ? brands.reduce((a, b) => a.sentiment < b.sentiment ? a : b) : null;
  const third = brands.find(b => best && worst && b.id !== best.id && b.id !== worst.id);

  const keyInsights = [
    best && `🥇 ${best.name} leads the market with the highest sentiment score (+${(best.sentiment * 100).toFixed(0)}) and ${best.positive}% positive mentions, driven by ${best.top_topic}.`,
    worst && `⚠️ ${worst.name} trails with ${worst.negative}% negative sentiment, primarily around ${worst.top_topic}.`,
    third && `📊 ${third.name} sits at a ${third.status.toLowerCase()} position (${(third.sentiment * 100).toFixed(0)} score) with ${third.top_topic} leading its discourse.`,
    brands.length > 1 && `💡 Sentiment spread across brands: ${brands.map(b => `${b.name} ${(b.sentiment * 100).toFixed(0)}`).join(' vs ')}.`,
  ].filter(Boolean);

  return (
    <div className="glass-card p-8 border border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
      <div className="flex items-start gap-5">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl shrink-0 ring-1 ring-primary/30">
          🤖
        </div>

        <div className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Header */}
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">AI Insight Summary</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
              Auto-generated
            </span>
          </div>

          {/* Key Insights structured list */}
          <ul className="flex flex-col gap-2.5">
            {keyInsights.map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-300 leading-relaxed">
                <span className="mt-2 shrink-0 w-1 h-1 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Brand status pills row */}
          <div className="flex flex-wrap gap-3 pt-2 border-t border-white/5">
            {brands.map(brand => {
              const cfg = STATUS_CONFIG[brand.status] || STATUS_CONFIG.Stable;
              return (
                <div key={brand.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${cfg.bg} ring-1 ${cfg.ring}`}>
                  <div className="w-2 h-2 rounded-full" style={{ background: BRAND_COLORS[brand.id]?.border }} />
                  <span className="text-xs font-bold text-slate-200">{brand.name}</span>
                  <span className={`text-[10px] font-black uppercase ${cfg.text}`}>{brand.status}</span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {brand.sentiment >= 0 ? '+' : ''}{(brand.sentiment * 100).toFixed(0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const BrandComparison = () => {
  const [brands, setBrands] = useState([]);
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState("30d");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getBrandComparison(dateRange);
        setBrands(data.brands || []);
        setInsight(data.insight || '');
      } catch (e) {
        console.error('Brand comparison error:', e);
        setError('Failed to load brand data. Is the backend running?');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading brand data…
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="glass-card p-8 text-center text-red-400">{error}</div>;
  }

  // ── Chart data helpers ────────────────────────────────────────────────────
  const TOOLTIP_BASE = {
    backgroundColor: 'rgba(10,15,30,0.97)',
    titleColor: '#f1f5f9',
    bodyColor: '#94a3b8',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 10,
    displayColors: true,
    boxPadding: 4,
  };

  // Sentiment distribution (stacked bar)
  const sentDistData = {
    labels: brands.map(b => b.name),
    datasets: [
      {
        label: 'Positive',
        data: brands.map(b => b.positive),
        backgroundColor: 'rgba(16,185,129,0.8)',
        hoverBackgroundColor: 'rgba(16,185,129,1)',
        stack: 'sentiment',
        borderRadius: { topLeft: 6, topRight: 6 },
      },
      {
        label: 'Neutral',
        data: brands.map(b => b.neutral),
        backgroundColor: 'rgba(100,116,139,0.65)',
        hoverBackgroundColor: 'rgba(100,116,139,0.9)',
        stack: 'sentiment',
      },
      {
        label: 'Negative',
        data: brands.map(b => b.negative),
        backgroundColor: 'rgba(244,63,94,0.8)',
        hoverBackgroundColor: 'rgba(244,63,94,1)',
        stack: 'sentiment',
        borderRadius: { bottomLeft: 6, bottomRight: 6 },
      },
    ],
  };

  const sentDistOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { position: 'top', labels: { color: '#94a3b8', usePointStyle: true, padding: 20, font: { size: 11, weight: 'bold' } } },
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          title: items => `${items[0].label} — Sentiment Breakdown`,
          label: ctx => {
            const brand = brands[ctx.dataIndex];
            const count = Math.round(brand.mentions * ctx.parsed.y / 100);
            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%  (≈${count.toLocaleString()} mentions)`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true, grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } },
      y: { stacked: true, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => v + '%' } },
    },
  };

  // Volume bar
  const volumeData = {
    labels: brands.map(b => b.name),
    datasets: [{
      label: 'Total Mentions',
      data: brands.map(b => b.mentions),
      backgroundColor: brands.map(b => BRAND_COLORS[b.id]?.bg || 'rgba(56,189,248,0.65)'),
      hoverBackgroundColor: brands.map(b => BRAND_COLORS[b.id]?.border || '#38bdf8'),
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.08)',
    }],
  };

  const volumeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          title: items => items[0].label,
          label: ctx => {
            const brand = brands[ctx.dataIndex];
            return [
              ` Mentions: ${ctx.parsed.y.toLocaleString()}`,
              ` Sentiment: ${(brand.sentiment * 100).toFixed(1)}%`,
              ` Positive:  ${brand.positive}%`,
            ];
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { weight: 'bold' } } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#94a3b8', callback: v => v.toLocaleString() } },
    },
  };

  // Trend line tooltip factory
  const makeTrendOptions = (brand) => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        ...TOOLTIP_BASE,
        callbacks: {
          title: items => items[0].label,
          label: ctx => {
            const pt = brand.trend[ctx.dataIndex];
            return [
              ` Sentiment: ${ctx.parsed.y.toFixed(1)}%`,
              ` Mentions:  ${pt.mentions.toLocaleString()}`,
            ];
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b', font: { size: 10 } } },
      y: { min: -100, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 10 }, callback: v => v + '%' } },
    },
  });

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-700">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Brand Comparison</h1>
          <p className="text-slate-400">Side-by-side analysis of smart speaker market performance</p>
        </div>
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 self-start">
          {[{v: "7d", l: "Last 7 Days"}, {v: "30d", l: "Last 30 Days"}, {v: "90d", l: "Last 90 Days"}].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setDateRange(opt.v)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                dateRange === opt.v
                  ? "bg-primary/20 text-primary border border-primary/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      {/* ── PERFORMANCE METRICS TABLE ────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/5">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="text-primary">📊</span> Performance Metrics
            <span className="text-xs font-normal text-slate-500 ml-1">Score range: −100 to +100</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10">
                <th className="px-5 py-3">Brand</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Mentions</th>
                <th className="px-5 py-3 hidden sm:table-cell">Pos / Neu / Neg</th>
                <th className="px-5 py-3 w-36 hidden md:table-cell">Distribution</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {brands.map(brand => (
                <tr key={brand.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: BRAND_COLORS[brand.id]?.border || '#38bdf8' }} />
                      <span className="font-bold text-slate-200 group-hover:text-primary transition-colors whitespace-nowrap">
                        {brand.name}
                      </span>
                    </div>
                  </td>
                  {/* ① Sentiment Score Indicator */}
                  <td className="px-5 py-4">
                    <SentimentGauge sentiment={brand.sentiment} />
                  </td>
                  <td className="px-5 py-4 text-slate-400 tabular-nums">{brand.mentions.toLocaleString()}</td>
                  <td className="px-5 py-4 text-xs font-medium hidden sm:table-cell whitespace-nowrap">
                    <span className="text-emerald-400">{brand.positive}%</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-slate-400">{brand.neutral}%</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-red-400">{brand.negative}%</span>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell w-36">
                    <SentimentBar positive={brand.positive} neutral={brand.neutral} negative={brand.negative} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={brand.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SENTIMENT DISTRIBUTION ────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-emerald-400">🎯</span> Sentiment Distribution by Brand
          <span className="text-xs font-normal text-slate-500 ml-1 hidden sm:inline">Positive · Neutral · Negative %</span>
        </h2>
        <div className="h-64 sm:h-72">
          <Bar data={sentDistData} options={sentDistOptions} />
        </div>
      </div>

      {/* ── TREND CHARTS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {brands.map(brand => (
          <div key={brand.id} className="glass-card p-5 flex flex-col gap-4 h-full">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-slate-200">{brand.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Sentiment Trend</p>
              </div>
              <StatusBadge status={brand.status} />
            </div>
            <div className="flex-1 min-h-50">
              <Line
                data={{
                  labels: brand.trend.map(d =>
                    new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
                  datasets: [{
                    label: 'Sentiment',
                    data: brand.trend.map(d => d.sentiment * 100),
                    borderColor: BRAND_COLORS[brand.id]?.border || '#38bdf8',
                    backgroundColor: BRAND_COLORS[brand.id]?.bgLight || 'rgba(56,189,248,0.1)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointHoverBackgroundColor: BRAND_COLORS[brand.id]?.border,
                  }]
                }}
                options={makeTrendOptions(brand)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── TOPIC INTELLIGENCE ────────────────────────────────────────────── */}
      <div className="glass-card overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-white/5 flex items-center gap-2">
          <span>🔬</span>
          <h2 className="text-base font-bold text-slate-100">Topic Intelligence Comparison</h2>
          <span className="text-xs text-slate-500 hidden sm:inline">• top conversation themes per brand</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
          {brands.map(brand => (
            <div key={brand.id} className="p-5 flex flex-col gap-4">
              {/* Brand label */}
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: BRAND_COLORS[brand.id]?.border || '#38bdf8' }} />
                <span className="font-bold text-slate-200">{brand.name}</span>
              </div>

              {/* Top topic highlight */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-xl shrink-0">{TOPIC_ICONS[brand.top_topic] || '💬'}</span>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Top Topic</p>
                  <p className="text-sm font-bold text-slate-100 mt-0.5 truncate">{brand.top_topic}</p>
                </div>
              </div>

              {/* All topics with trend indicator */}
              <div className="flex flex-col gap-2.5">
                {(brand.topics || []).slice(0, 5).map((topic, i) => {
                  const trend = getTopicTrend(topic.sentiment);
                  return (
                    <div key={topic.name} className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 w-3 font-bold shrink-0">{i + 1}</span>
                      <span className="text-xs shrink-0">{TOPIC_ICONS[topic.name] || '💬'}</span>
                      <span className="text-xs text-slate-300 flex-1 min-w-0 truncate" title={topic.name}>{topic.name}</span>
                      {/* ③ Trend indicator */}
                      <span className={`text-[9px] font-black whitespace-nowrap shrink-0 ${trend.cls}`}
                        title={`Avg sentiment: ${(topic.sentiment * 100).toFixed(1)}%`}>
                        {trend.label}
                      </span>
                      <div className="w-16 h-1.5 rounded-full bg-white/5 overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${topic.pct}%`, background: BRAND_COLORS[brand.id]?.border, opacity: 0.75 }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 w-7 text-right shrink-0 tabular-nums">
                        {topic.pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── VOLUME COMPARISON ─────────────────────────────────────────────── */}
      <div className="glass-card p-6 sm:p-8">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <span className="text-secondary">📊</span> Mentions Volume Comparison
        </h2>
        <div className="h-64 sm:h-72">
          <Bar data={volumeData} options={volumeOptions} />
        </div>
      </div>

      {/* ② AI Insight Summary – structured ──────────────────────────────── */}
      <AIInsightPanel insight={insight} brands={brands} />

    </div>
  );
};

export default BrandComparison;
