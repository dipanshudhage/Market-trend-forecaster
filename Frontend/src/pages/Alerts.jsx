import React, { useState, useEffect, useMemo } from 'react';
import { getAlerts } from '../services/dashboardService';

// ─── Severity config ─────────────────────────────────────────────────────────
const SEV = {
    Critical: {
        badge: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
        border: 'border-l-red-500',
        icon_bg: 'bg-red-500/12',
        glow: 'shadow-[0_0_20px_rgba(239,68,68,0.08)]',
        text: 'text-red-400',
        dot: 'bg-red-400',
        pulse: true,
        emoji: '🔴',
    },
    Medium: {
        badge: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-400/30',
        border: 'border-l-amber-500',
        icon_bg: 'bg-amber-500/12',
        glow: '',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        pulse: false,
        emoji: '🟡',
    },
    Low: {
        badge: 'bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-400/20',
        border: 'border-l-emerald-500',
        icon_bg: 'bg-emerald-500/10',
        glow: '',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        pulse: false,
        emoji: '🟢',
    },
};

// ─── Alert type meta ──────────────────────────────────────────────────────────
const TYPE_META = {
    'Sentiment Spike': { icon: '📉', label: 'Sentiment Spike', color: '#f59e0b' },
    'Brand Risk': { icon: '⚠️', label: 'Brand Risk', color: '#ef4444' },
    'Trending Topic': { icon: '🔥', label: 'Trending Topic', color: '#38bdf8' },
    'Mention Surge': { icon: '📈', label: 'Mention Surge', color: '#10b981' },
    'Competitor Advantage': { icon: '⚔️', label: 'Competitor Advantage', color: '#a78bfa' },
};

const SOURCE_ICONS = {
    'Amazon Reviews': { icon: '🛋️', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
    'YouTube Comments': { icon: '📹', color: 'text-red-400    bg-red-500/10    border-red-500/20' },
    'Web Reviews': { icon: '🌐', color: 'text-sky-400    bg-sky-500/10    border-sky-500/20' },
    'News Articles': { icon: '📰', color: 'text-slate-300  bg-slate-500/10  border-slate-500/20' },
};

const TREND_CFG = {
    'Increasing': { icon: '⬆️', label: 'Increasing', color: 'text-red-400    bg-red-500/10' },
    'Stabilizing': { icon: '➡️', label: 'Stabilizing', color: 'text-amber-400 bg-amber-500/10' },
    'Declining': { icon: '⬇️', label: 'Declining', color: 'text-emerald-400 bg-emerald-500/10' },
};

const PRODUCT_COLOR = {
    'Echo Dot': '#38bdf8',
    'Nest Mini': '#10b981',
    'HomePod Mini': '#818cf8',
};


// ─── Static alert rules ─────────────────────────────────────────────────────
const ALERT_RULES = [
    { id: 'r1', icon: '⚠️', name: 'Brand Risk Alert', condition: 'Negative sentiment > 40%', severity: 'Critical', status: 'Active' },
    { id: 'r2', icon: '📉', name: 'Sentiment Spike Detector', condition: 'Sentiment swing > 25% in 12 hours', severity: 'Medium', status: 'Active' },
    { id: 'r3', icon: '🔥', name: 'Trending Topic Monitor', condition: 'Topic share > 50% of brand mentions', severity: 'Low', status: 'Active' },
    { id: 'r4', icon: '📈', name: 'Mention Surge Alert', condition: 'Mentions increase > 50% vs baseline', severity: 'Medium', status: 'Active' },
    { id: 'r5', icon: '⚔️', name: 'Competitor Advantage Watch', condition: 'Sentiment gap > 20% or volume gap > 45%', severity: 'Medium', status: 'Active' },
    { id: 'r6', icon: '🎯', name: 'Positive Sentiment Spike', condition: 'Positive sentiment increase > 30%', severity: 'Low', status: 'Paused' },
];

// ─── Static history ───────────────────────────────────────────────────────────
const HISTORY_DATA = [
    { id: 'h1', type: 'Sentiment Spike', product: 'Nest Mini', severity: 'Critical', description: 'Negative sentiment spike to 58% resolved after trend reversal.', resolvedAt: new Date('2026-03-10T14:22:00'), duration: '2h 14m' },
    { id: 'h2', type: 'Mention Surge', product: 'Echo Dot', severity: 'Medium', description: 'Mention surge subsided after viral video engagement peaked.', resolvedAt: new Date('2026-03-10T09:45:00'), duration: '45m' },
    { id: 'h3', type: 'Trending Topic', product: 'HomePod Mini', severity: 'Low', description: 'Connectivity topic spike normalized.', resolvedAt: new Date('2026-03-09T18:30:00'), duration: '1h 30m' },
    { id: 'h4', type: 'Brand Risk', product: 'Nest Mini', severity: 'Medium', description: 'Sentiment recovered after product update announcement.', resolvedAt: new Date('2026-03-08T22:00:00'), duration: '5h 10m' },
    { id: 'h5', type: 'Mention Surge', product: 'HomePod Mini', severity: 'Low', description: 'Organic surge from tech blog review — positive signal.', resolvedAt: new Date('2026-03-07T11:20:00'), duration: '3h 05m' },
    { id: 'h6', type: 'Competitor Advantage', product: 'Echo Dot', severity: 'Medium', description: 'Echo Dot volume advantage vs HomePod Mini normalised after new launch.', resolvedAt: new Date('2026-03-06T16:00:00'), duration: '4h 22m' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relTime(minutesAgo) {
    if (minutesAgo < 60) return `${minutesAgo}m ago`;
    const h = Math.floor(minutesAgo / 60);
    const m = minutesAgo % 60;
    return m > 0 ? `${h}h ${m}m ago` : `${h}h ago`;
}

function fmtDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' · ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
    const cfg = SEV[severity] || SEV.Low;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${cfg.badge}`}>
            {cfg.pulse
                ? <span className="relative flex w-1.5 h-1.5">
                    <span className="animate-ping absolute h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative rounded-full w-1.5 h-1.5 bg-red-400" />
                </span>
                : <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            }
            {severity}
        </span>
    );
}

function OverviewCard({ label, value, icon, color, sub, loading }) {
    return (
        <div className="glass-card p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                <span className="text-xl">{icon}</span>
            </div>
            {loading
                ? <div className="h-10 w-16 rounded-lg bg-white/5 animate-pulse" />
                : <div className={`text-4xl font-black tabular-nums ${color}`}>{value}</div>
            }
            {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
    );
}

// ── AI Alert Card ─────────────────────────────────────────────────────────────
function AlertCard({ alert, onDismiss }) {
    const cfg = SEV[alert.severity] || SEV.Low;
    const meta = TYPE_META[alert.type] || { icon: '🔔', label: alert.type, color: '#94a3b8' };
    const pColor = PRODUCT_COLOR[alert.product] || '#94a3b8';
    const trend = TREND_CFG[alert.trend] || TREND_CFG['Stabilizing'];

    const [reportSent, setReportSent] = React.useState(false);
    const [investigating, setInvestigating] = React.useState(false);

    function handleInvestigate() {
        setInvestigating(true);
        setTimeout(() => setInvestigating(false), 1800);
    }
    function handleReport() {
        setReportSent(true);
        setTimeout(() => setReportSent(false), 2500);
    }

    return (
        <div className={`glass-card border-l-4 ${cfg.border} ${cfg.glow} transition-all hover:bg-white/4 group`}>
            <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">

                {/* Type icon badge */}
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${cfg.icon_bg} ring-1 ring-white/5`}>
                    {meta.icon}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0 flex flex-col gap-2.5">

                    {/* Title row */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{meta.label}</span>
                        <SeverityBadge severity={alert.severity} />
                        {/* Product pill */}
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase"
                            style={{ background: `${pColor}18`, color: pColor, border: `1px solid ${pColor}28` }}>
                            {alert.product}
                        </span>
                        {/* vs Competitor pill */}
                        {alert.competitor && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                ⚔️ vs {alert.competitor}
                            </span>
                        )}
                        {/* Topic pill */}
                        {alert.topic && alert.topic !== 'Overall Sentiment' && (
                            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[10px] font-bold uppercase">
                                {alert.topic}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-sm text-slate-300 leading-relaxed">{alert.description}</p>

                    {/* Metric row */}
                    <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Metric</span>
                            <span className={`text-xs font-black font-mono ${cfg.text}`}>{alert.metric}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change</span>
                            <span className={`text-xs font-black ${cfg.text}`}>{alert.change}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/5">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Threshold</span>
                            <span className="text-xs font-mono text-slate-400">{alert.threshold}</span>
                        </div>
                        {/* Trend chip */}
                        {alert.trend && (
                            <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase border border-white/5 ${trend.color}`}>
                                {trend.icon} Trend: {trend.label}
                            </div>
                        )}
                        {/* AI confidence badge */}
                        {alert.ai_confidence !== undefined && (
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">🧠 AI Confidence</span>
                                <span className="text-xs font-black text-indigo-300">{alert.ai_confidence}%</span>
                            </div>
                        )}
                    </div>

                    {/* Source channels row */}
                    {alert.sources && alert.sources.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Sources:</span>
                            {alert.sources.map(src => {
                                const s = SOURCE_ICONS[src] || { icon: '📊', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' };
                                return (
                                    <span key={src} className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${s.color}`}>
                                        {s.icon} {src}
                                    </span>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>🕐 Detected: {relTime(alert.minutes_ago)}</span>
                        <span>📡 {alert.channel}</span>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex flex-col gap-2 shrink-0 self-start opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                    <button
                        onClick={handleInvestigate}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${investigating
                            ? 'bg-indigo-500/25 text-indigo-300 border border-indigo-400/30'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20'
                            }`}
                    >
                        {investigating ? '⏳ Investigating…' : '🔍 Investigate'}
                    </button>
                    <button
                        onClick={handleReport}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${reportSent
                            ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30'
                            : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-slate-200'
                            }`}
                    >
                        {reportSent ? '✅ Report Sent' : '📄 Generate Report'}
                    </button>
                    <button
                        onClick={() => onDismiss(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-xs font-bold border border-white/8 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                    >
                        ✕ Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dismissed, setDismissed] = useState(new Set());
    const [filterSev, setFilterSev] = useState('All');
    const [filterType, setFilterType] = useState('All');
    const [tab, setTab] = useState('active');

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const data = await getAlerts();
                setAlerts(data.alerts || []);
                setSummary(data.summary || {});
            } catch (e) {
                console.error('Alerts fetch error:', e);
                setError('Could not load alerts from backend.');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const visibleAlerts = useMemo(() =>
        alerts.filter(a => {
            if (dismissed.has(a.id)) return false;
            if (filterSev !== 'All' && a.severity !== filterSev) return false;
            if (filterType !== 'All' && a.type !== filterType) return false;
            return true;
        }), [alerts, dismissed, filterSev, filterType]);

    const activeCount = alerts.length - dismissed.size;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">

            {/* ── HEADER ─────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">🔔 Alerts</h1>
                    <p className="text-slate-400 mt-1">AI-powered monitoring of sentiment changes and market anomalies</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 self-start">
                    <span className="relative flex w-2 h-2">
                        <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative rounded-full w-2 h-2 bg-emerald-400" />
                    </span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Live Monitoring</span>
                </div>
            </div>

            {/* ── OVERVIEW CARDS ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <OverviewCard loading={loading} label="Active Alerts" icon="🔔" value={activeCount} color="text-slate-100" sub="Real-time alerts" />
                <OverviewCard loading={loading} label="Critical" icon="🚨" value={summary.critical ?? 0} color="text-red-400" sub="Require immediate action" />
                <OverviewCard loading={loading} label="Sentiment Spikes" icon="📉" value={summary.spikes ?? 0} color="text-amber-400" sub="AI-detected anomalies" />
                <OverviewCard loading={loading} label="Resolved (7d)" icon="✅" value={HISTORY_DATA.length} color="text-emerald-400" sub="Last 7 days resolved" />
            </div>

            {/* ── TYPE BREAKDOWN STRIP ───────────────────────────────────────── */}
            {!loading && !error && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { key: 'Brand Risk', icon: '⚠️', count: summary.risks ?? 0, color: 'text-red-400', bg: 'bg-red-500/8' },
                        { key: 'Sentiment Spike', icon: '📉', count: summary.spikes ?? 0, color: 'text-amber-400', bg: 'bg-amber-500/8' },
                        { key: 'Trending Topic', icon: '🔥', count: summary.trending ?? 0, color: 'text-sky-400', bg: 'bg-sky-500/8' },
                        { key: 'Mention Surge', icon: '📈', count: summary.surges ?? 0, color: 'text-emerald-400', bg: 'bg-emerald-500/8' },
                        { key: 'Competitor Advantage', icon: '⚔️', count: summary.competitors ?? 0, color: 'text-violet-400', bg: 'bg-violet-500/8' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => setFilterType(prev => prev === t.key ? 'All' : t.key)}
                            className={`glass-card p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-all ${filterType === t.key ? 'border border-primary/30 bg-primary/5' : ''
                                }`}
                        >
                            <span className={`w-9 h-9 rounded-xl ${t.bg} flex items-center justify-center text-base shrink-0`}>
                                {t.icon}
                            </span>
                            <div className="min-w-0">
                                <div className={`text-xl font-black tabular-nums ${t.color}`}>{t.count}</div>
                                <div className="text-[10px] text-slate-500 font-bold uppercase truncate">{t.key}</div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* ── TABS ────────────────────────────────────────────────────────── */}
            <div className="flex gap-1 p-1 bg-slate-900/60 border border-white/5 rounded-xl w-fit">
                {[
                    { key: 'active', label: 'Active Alerts', badge: activeCount },
                    { key: 'rules', label: 'Alert Rules', badge: ALERT_RULES.length },
                    { key: 'history', label: 'History', badge: HISTORY_DATA.length },
                ].map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${tab === t.key
                            ? 'bg-primary/15 text-primary border border-primary/20'
                            : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        {t.label}
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'
                            }`}>{t.badge}</span>
                    </button>
                ))}
            </div>

            {/* ── ACTIVE ALERTS ────────────────────────────────────────────────── */}
            {tab === 'active' && (
                <div className="flex flex-col gap-5">
                    {/* Filter bar */}
                    <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-600">Severity</span>
                            {['All', 'Critical', 'Medium', 'Low'].map(s => (
                                <button key={s} onClick={() => setFilterSev(s)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterSev === s
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'bg-white/5 text-slate-400 hover:text-slate-200'
                                        }`}>{s}</button>
                            ))}
                        </div>
                        <div className="w-px h-4 bg-white/10 hidden sm:block" />
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs text-slate-600">Type</span>
                            {['All', 'Sentiment Spike', 'Brand Risk', 'Trending Topic', 'Mention Surge', 'Competitor Advantage'].map(t => (
                                <button key={t} onClick={() => setFilterType(t)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterType === t
                                        ? 'bg-primary/15 text-primary border border-primary/20'
                                        : 'bg-white/5 text-slate-400 hover:text-slate-200'
                                        }`}>{t}</button>
                            ))}
                        </div>
                        {(filterSev !== 'All' || filterType !== 'All') && (
                            <button onClick={() => { setFilterSev('All'); setFilterType('All'); }}
                                className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
                                Clear filters ✕
                            </button>
                        )}
                    </div>

                    {/* Loading skeleton */}
                    {loading && (
                        <div className="flex flex-col gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card p-5 border-l-4 border-l-white/10">
                                    <div className="flex gap-4">
                                        <div className="w-11 h-11 rounded-2xl bg-white/5 animate-pulse" />
                                        <div className="flex-1 flex flex-col gap-2">
                                            <div className="h-4 w-1/3 rounded-full bg-white/5 animate-pulse" />
                                            <div className="h-3 w-2/3 rounded-full bg-white/5 animate-pulse" />
                                            <div className="h-3 w-1/2 rounded-full bg-white/5 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Error state */}
                    {error && !loading && (
                        <div className="glass-card p-8 text-center text-red-400 border border-red-500/20">
                            <p className="text-lg font-bold mb-1">⚠️ Backend Unavailable</p>
                            <p className="text-sm text-slate-400">{error}</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && visibleAlerts.length === 0 && (
                        <div className="glass-card p-12 flex flex-col items-center gap-3 text-slate-500">
                            <span className="text-5xl">✅</span>
                            <p className="font-bold text-slate-400 mt-2">No alerts match your filters</p>
                            <p className="text-xs">All clear — or try adjusting the filters above</p>
                        </div>
                    )}

                    {/* Alert cards */}
                    {!loading && !error && visibleAlerts.length > 0 && (
                        <div className="flex flex-col gap-4">
                            {visibleAlerts.map(alert => (
                                <AlertCard
                                    key={alert.id}
                                    alert={alert}
                                    onDismiss={id => setDismissed(prev => new Set([...prev, id]))}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── ALERT RULES ──────────────────────────────────────────────────── */}
            {tab === 'rules' && (
                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            ⚙️ Alert Rules
                            <span className="text-xs font-normal text-slate-500 ml-1">Conditions that trigger AI alerts</span>
                        </h2>
                        <span className="text-xs text-slate-500">{ALERT_RULES.filter(r => r.status === 'Active').length} Active</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10">
                                    <th className="px-5 py-3">Rule</th>
                                    <th className="px-5 py-3">Condition</th>
                                    <th className="px-5 py-3 hidden sm:table-cell">Severity</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {ALERT_RULES.map(rule => (
                                    <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg">{rule.icon}</span>
                                                <span className="font-semibold text-slate-200 text-sm">{rule.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <code className="text-xs bg-white/5 px-2 py-1 rounded-lg text-slate-300 font-mono">{rule.condition}</code>
                                        </td>
                                        <td className="px-5 py-4 hidden sm:table-cell"><SeverityBadge severity={rule.severity} /></td>
                                        <td className="px-5 py-4">
                                            <span className={`text-xs font-bold ${rule.status === 'Active' ? 'text-emerald-400' : 'text-slate-500'}`}>
                                                {rule.status === 'Active' ? '● Active' : '○ Paused'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ── ALERT HISTORY ────────────────────────────────────────────────── */}
            {tab === 'history' && (
                <div className="glass-card overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-white/5">
                        <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                            📜 Alert History
                            <span className="text-xs font-normal text-slate-500 ml-1">Previously resolved alerts</span>
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-white/10">
                                    <th className="px-5 py-3">Alert</th>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3 hidden sm:table-cell">Notes</th>
                                    <th className="px-5 py-3">Resolved</th>
                                    <th className="px-5 py-3 hidden md:table-cell">Duration</th>
                                    <th className="px-5 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {HISTORY_DATA.map(h => {
                                    const pColor = PRODUCT_COLOR[h.product] || '#94a3b8';
                                    const meta = TYPE_META[h.type] || { icon: '🔔' };
                                    return (
                                        <tr key={h.id} className="hover:bg-white/5 transition-colors opacity-70 hover:opacity-100">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base">{meta.icon}</span>
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-300">{h.type}</p>
                                                        <SeverityBadge severity={h.severity} />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                                                    style={{ background: `${pColor}18`, color: pColor }}>
                                                    {h.product}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-400 hidden sm:table-cell max-w-xs">
                                                <span className="line-clamp-2">{h.description}</span>
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-400 whitespace-nowrap">{fmtDate(h.resolvedAt)}</td>
                                            <td className="px-5 py-4 text-xs text-slate-500 hidden md:table-cell">{h.duration}</td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400">
                                                    ✓ Resolved
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Alerts;
