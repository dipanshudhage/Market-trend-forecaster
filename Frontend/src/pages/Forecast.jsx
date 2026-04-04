// src/pages/Forecast.jsx
import React, { useState, useEffect, useRef,useCallback } from "react";
import "../styles/forecast.css";
import {
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from "recharts";
import {
    TrendingUp, TrendingDown, Minus, AlertTriangle,
    Zap, ChevronDown, ChevronUp, RefreshCw, Info
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const API = `${API_BASE}/api/forecast`;

const BRAND_COLORS = {
    "echo-dot": { solid: "#3b82f6", light: "rgba(59,130,246,0.15)" },
    "nest-mini": { solid: "#10b981", light: "rgba(16,185,129,0.15)" },
    "homepod-mini": { solid: "#8b5cf6", light: "rgba(139,92,246,0.15)" },
};

 const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload?.length) return null;
        return (
            <div className="bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-xs shadow-xl">
                <div className="text-slate-400 mb-1">{label}</div>
                {payload.map((p, i) => p.value != null && (
                    <div key={i} className="flex items-center gap-2" style={{ color: p.color }}>
                        <span className="font-bold">{p.name}:</span>
                        <span>{(p.value * 100).toFixed(1)}%</span>
                    </div>
                ))}
            </div>
        );
    };


// ── Helper: format sentiment as percentage ─────────────────────────
const fmtPct = (v) => `${(v * 100).toFixed(1)}%`;

// ── War Room Card ──────────────────────────────────────────────────
const WarCard = ({ brand, index }) => {
    const [barWidth, setBarWidth] = useState(0);
    const dir = brand.direction.toLowerCase(); // gaining | holding | losing
    const color = BRAND_COLORS[brand.id]?.solid || "#6366f1";
    const barValue = Math.abs(brand.current_sentiment) * 100;

    useEffect(() => {
        const t = setTimeout(() => setBarWidth(Math.min(barValue, 95)), 300 + index * 150);
        return () => clearTimeout(t);
    }, [barValue, index]);

    const dirConfig = {
        gaining: { label: "↗ GAINING", textColor: "#10b981", icon: <TrendingUp size={16} /> },
        losing: { label: "↘ LOSING", textColor: "#ef4444", icon: <TrendingDown size={16} /> },
        holding: { label: "→ HOLDING", textColor: "#f59e0b", icon: <Minus size={16} /> },
    }[dir] || { label: "→ HOLDING", textColor: "#f59e0b", icon: <Minus size={16} /> };

    return (
        <div className={`war-card ${dir}`}>
            <div className={`war-pulse ${dir}`} />

            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{brand.name}</div>

            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-black text-white">{fmtPct(brand.current_sentiment)}</span>
                <span style={{ color: dirConfig.textColor }} className="text-xs font-bold flex items-center gap-1">
                    {dirConfig.icon}{dirConfig.label}
                </span>
            </div>

            <div className="text-xs text-slate-400 mb-3">
                {fmtPct(brand.current_sentiment)} → <span style={{ color: dirConfig.textColor }}>{fmtPct(brand.predicted_sentiment)}</span>
                <span className="ml-2 opacity-60">({brand.change_pct > 0 ? "+" : ""}{brand.change_pct}%)</span>
            </div>

            <div className="war-bar-track">
                <div
                    className="war-bar-fill"
                    style={{ width: `${barWidth}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                />
            </div>

            <div className="mt-3 flex justify-between items-center">
                <span style={{
                    background: brand.risk.color + "22",
                    color: brand.risk.color,
                    border: `1px solid ${brand.risk.color}44`,
                    borderRadius: "999px", padding: "2px 10px", fontSize: "0.7rem", fontWeight: 700
                }}>
                    {brand.risk.emoji} {brand.risk.label}
                </span>
                <span className="text-xs text-slate-500">{brand.confidence}% confidence</span>
            </div>
        </div>
    );
};


// ── Forecast Chart with animated draw ─────────────────────────────
const ForecastChart = ({ data, brandColors, todayDate }) => {
    if (!data || data.length === 0) return null;

   
    return (
        <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(d) => d?.slice(5)} interval={Math.floor(data.length / 6)} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }}
                    tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} domain={["auto", "auto"]} />
                <Tooltip content={CustomTooltip } />
                <ReferenceLine x={todayDate} stroke="#3b82f6" strokeDasharray="4 4"
                    label={{ value: "Today", fill: "#3b82f6", fontSize: 10, position: "top" }} />

                {brandColors.map(({ id, color }) => (
                    <React.Fragment key={id}>
                        <Area dataKey={`${id}_upper`} fill={color + "15"} stroke="none" stackId={`band_${id}`} />
                        <Area dataKey={`${id}_lower`} fill="transparent" stroke="none" stackId={`band_${id}`} />
                        <Line dataKey={`${id}_actual`} stroke={color} strokeWidth={2} dot={false} name={`${id} Actual`} connectNulls={false} />
                        <Line dataKey={`${id}_forecast`} stroke={color} strokeWidth={2} strokeDasharray="6 3"
                            dot={false} name={`${id} Forecast`} connectNulls={false} />
                    </React.Fragment>
                ))}
            </ComposedChart>
        </ResponsiveContainer>
    );
};

// ── Factor Card ─────────────────────────────────────────────────────
const FactorCard = ({ factor, type }) => {
    const [open, setOpen] = useState(false);
    const [barWidth, setBarWidth] = useState(0);

    useEffect(() => {
        const t = setTimeout(() => setBarWidth(factor.probability), 500);
        return () => clearTimeout(t);
    }, [factor.probability]);

    const isPositive = type === "driver" ? factor.impact === "positive" : factor.impact_pct > 0;
    const isNeutral = type === "driver" && factor.impact === "neutral";
    const color = isNeutral ? "#f59e0b" : isPositive ? "#10b981" : "#ef4444";

    const impactLabel = type === "risk"
        ? (factor.impact_pct > 0 ? `+${factor.impact_pct}% impact` : `${factor.impact_pct}% impact`)
        : (isNeutral ? "Neutral impact" : isPositive ? "Positive impact" : "Negative impact");

    const impactIcon = isNeutral ? "〜" : isPositive ? "↑" : "↓";

    return (
        <div className="rounded-xl overflow-hidden border border-white/5 hover:border-white/10 transition-all bg-slate-900/40"
            style={{ borderLeft: `3px solid ${color}` }}>
            <button
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
                onClick={() => setOpen(!open)}
            >
                {/* Impact icon */}
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base font-black"
                    style={{ background: color + "20", color }}>
                    {impactIcon}
                </div>

                {/* Name + probability */}
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{factor.factor}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{factor.probability}% chance this matters</div>
                </div>

                {/* Impact badge */}
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg shrink-0"
                    style={{ background: color + "18", color, border: `1px solid ${color}30` }}>
                    {impactLabel}
                </span>

                {open ? <ChevronUp size={14} className="text-slate-500 shrink-0" />
                    : <ChevronDown size={14} className="text-slate-500 shrink-0" />}
            </button>

            {open && (
                <div className="px-4 pb-4 border-t border-white/5 pt-3">
                    <p className="text-sm text-slate-400 leading-relaxed">{factor.detail}</p>
                    <div className="mt-3">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>Probability</span><span style={{ color }}>{factor.probability}%</span>
                        </div>
                        <div className="factor-bar-track">
                            <div className="factor-bar-fill" style={{ width: `${barWidth}%`, background: color }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Forecast Page ─────────────────────────────────────────────
const Forecast = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [horizon, setHorizon] = useState(30);
    const [chartData, setChartData] = useState([]);
    const todayRef = useRef("2026-03-16");


     const buildChartData = useCallback((brands) => {
        const allDates = {};
        brands.forEach((b) => {
            [...(b.historical || []), ...(b.forecast || [])].forEach((row) => {
                if (!allDates[row.date]) allDates[row.date] = { date: row.date };
                if (row.actual != null) allDates[row.date][`${b.id}_actual`] = row.actual;
                if (row.predicted != null) allDates[row.date][`${b.id}_forecast`] = row.predicted;
                if (row.upper != null) allDates[row.date][`${b.id}_upper`] = row.upper;
                if (row.lower != null) allDates[row.date][`${b.id}_lower`] = row.lower;
            });
        });
        setChartData(Object.values(allDates).sort((a, b) => a.date.localeCompare(b.date)));
    }, []);
    const fetchForecast = useCallback(async (h) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API}?horizon=${h}`);
            if (!res.ok) throw new Error("Failed to fetch forecast");
            const json = await res.json();
            setData(json);
            todayRef.current = json.as_of;
            buildChartData(json.brands);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [buildChartData, todayRef]); 

      

    useEffect(() => { fetchForecast(horizon); },[fetchForecast, horizon]);

    const handleHorizonChange = (val) => {
        setHorizon(val);
        // Only update the label while dragging — API fetch happens on release
    };

    const handleSliderRelease = (val) => {
        fetchForecast(val);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
                <div className="w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Generating forecast model&hellip;</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center text-red-400">
                <AlertTriangle className="mx-auto mb-3" size={40} />
                <p className="font-bold">Forecast unavailable</p>
                <p className="text-sm text-slate-500 mt-1">{error}</p>
                <button onClick={() => fetchForecast(horizon)}
                    className="mt-4 px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-bold hover:bg-blue-500/30 transition-colors flex items-center gap-2 mx-auto">
                    <RefreshCw size={14} /> Retry
                </button>
            </div>
        </div>
    );

    const brandColorList = (data?.brands || []).map((b) => ({
        id: b.id,
        color: BRAND_COLORS[b.id]?.solid || "#6366f1",
    }));

    const horizonLabels = [7, 14, 30, 60, 90];

    return (
        <div className="forecast-page space-y-8 animate-in fade-in duration-700">

            {/* ── Section 1: WAR ROOM ────────────────────────────────────── */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                            <Zap size={18} className="text-yellow-400" /> Sentiment War Room
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">Predicted brand battle over next {horizon} days</p>
                    </div>
                    <button onClick={() => fetchForecast(horizon)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5">
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="war-room-grid">
                    {data.brands.map((brand, i) => (
                        <React.Fragment key={brand.id}>
                            <WarCard brand={brand} index={i} />
                            {i < data.brands.length - 1 && (
                                <div className="vs-badge">VS</div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>


            {/* ── Section 3: TIME MACHINE ────────────────────────────────── */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">⏱️</span>
                    <h2 className="text-lg font-black text-white tracking-tight">Time Machine</h2>
                    <span className="ml-auto text-sm font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-0.5">
                        +{horizon} day forecast
                    </span>
                </div>
                <p className="text-xs text-slate-500 mb-5">Drag the slider to move the forecast horizon</p>

                <div className="flex items-center gap-4 mb-4 px-2">
                    {horizonLabels.map((h) => (
                        <span key={h} className={`text-xs font-bold cursor-pointer transition-colors ${horizon === h ? "text-blue-400" : "text-slate-600 hover:text-slate-400"}`}
                            onClick={() => { setHorizon(h); fetchForecast(h); }}>+{h}d</span>
                    ))}
                </div>

                <input type="range" min="7" max="90" step="1" value={horizon}
                    className="time-slider mb-6"
                    onChange={(e) => handleHorizonChange(Number(e.target.value))}
                    onMouseUp={(e) => handleSliderRelease(Number(e.target.value))}
                    onPointerUp={(e) => handleSliderRelease(Number(e.target.value))} />

                <ForecastChart data={chartData} brandColors={brandColorList} todayDate={todayRef.current} />

                <div className="flex gap-4 mt-4 justify-center">
                    {data.brands.map((b) => (
                        <span key={b.id} className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-4 h-0.5 inline-block rounded" style={{ background: BRAND_COLORS[b.id]?.solid }} />
                            {b.name}
                        </span>
                    ))}
                    <span className="text-xs text-slate-500 flex items-center gap-2">
                        <span className="w-4 inline-block border-t border-dashed border-slate-500" />
                        Forecast
                    </span>
                </div>
            </div>

            {/* ── Section 4: AI ANALYST SUMMARY ─────────────────────────── */}
            <div className="glass-card p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-purple-500/5 to-transparent pointer-events-none" />
                <div className="relative">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm">🤖</div>
                        <div>
                            <h2 className="text-sm font-black text-white">AI Analyst Report</h2>
                            <p className="text-xs text-slate-500">Generated by Market Intelligence Model</p>
                        </div>
                        <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-0.5 font-bold">● LIVE</span>
                    </div>
                    <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5">
                        <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{data.ai_summary}"</p>
                    </div>
                    <div className="flex gap-6 mt-4">
                        {data.brands.map((b) => (
                            <div key={b.id} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ background: BRAND_COLORS[b.id]?.solid }} />
                                <span className="text-xs text-slate-400">
                                    {b.name} <span className="font-bold" style={{ color: b.change_pct >= 0 ? "#10b981" : "#ef4444" }}>
                                        {b.change_pct > 0 ? "+" : ""}{b.change_pct}%
                                    </span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Sections 5 & 6: Drivers + Risk Factors ────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Section 5: Key Drivers */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
                            <TrendingUp size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight">Why This Forecast is Trending This Way</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Signals currently pushing sentiment in this direction</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {(data.drivers || []).map((d, i) => (
                            <FactorCard key={i} factor={d} type="driver" />
                        ))}
                    </div>
                </div>

                {/* Section 6: What Could Change */}
                <div className="glass-card p-6">
                    <div className="flex items-start gap-3 mb-5">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center shrink-0">
                            <AlertTriangle size={18} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white tracking-tight">Events That Could Flip This Forecast</h2>
                            <p className="text-xs text-slate-500 mt-0.5">External shocks that might invalidate the current prediction</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {(data.risk_factors || []).map((f, i) => (
                            <FactorCard key={i} factor={f} type="risk" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Forecast;
