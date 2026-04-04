import React, { useState, useEffect } from "react";
import { getSentimentExplorerData } from "../services/dashboardService";
import { Search, Hash, Target, ChevronDown, Activity, ChevronRight, BarChart } from "lucide-react";

const SentimentExplorer = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ results: [], total: 0 });
    const [filters, setFilters] = useState({
        source: "all",
        product: "all",
        sentiment: "all",
        topic: "all",
        search: "",
        page: 1
    });

    const topicOptions = [
        { id: "all", label: "All Topics" },
        { id: "Sound Quality", label: "Sound Quality" },
        { id: "Voice Recognition", label: "Voice Recognition" },
        { id: "Smart Home", label: "Smart Home" },
        { id: "Price", label: "Price" },
        { id: "Connectivity", label: "Connectivity" }
    ];

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
                const result = await getSentimentExplorerData(filters);
                setData(result);
            } catch (error) {
                console.error("Explorer load error:", error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        setFilters(prev => ({ ...prev, page: newPage }));
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-700 h-full">
            <div className="flex flex-col gap-1 shrink-0">
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
                    <Activity className="text-primary"/> Sentiment Explorer
                </h1>
                <p className="text-slate-400">Deep dive into raw consumer feedback and social signal data</p>
            </div>

            {/* Quick Filters - Pill Style */}
            <div className="flex items-center justify-between gap-4 bg-slate-900/50 p-3 rounded-2xl border border-white/5 backdrop-blur-md shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-2 border-r border-white/10 pr-4 mr-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Sentiment</span>
                        <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-white/5">
                            {["all", "positive", "neutral", "negative"].map(s => (
                                <button 
                                    key={s} 
                                    onClick={() => handleFilterChange("sentiment", s)}
                                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all ${
                                        filters.sentiment === s 
                                        ? s === "positive" ? "bg-accent/20 text-accent" : s === "negative" ? "bg-red-400/20 text-red-400" : s === "all" ? "bg-primary/20 text-primary" : "bg-white/10 text-white"
                                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Target size={14} className="text-slate-500" />
                        <select
                            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none pr-8"
                            value={filters.product}
                            onChange={(e) => handleFilterChange("product", e.target.value)}
                        >
                            {productOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-slate-500" />
                        <select
                            className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer appearance-none pr-8"
                            value={filters.topic}
                            onChange={(e) => handleFilterChange("topic", e.target.value)}
                        >
                            {topicOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="relative w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Search size={14}/></span>
                    <input
                        type="text"
                        placeholder="Search feedback..."
                        className="w-full bg-slate-950 border border-white/10 rounded-lg pl-9 pr-4 py-1.5 text-xs font-medium text-slate-200 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {/* DATA GRID TABLE 2.0 */}
            <div className="flex-1 overflow-hidden flex flex-col glass-card border border-white/5 rounded-2xl relative shadow-2xl">
                
                {/* Scrollable Container */}
                <div className="overflow-auto custom-scrollbar flex-1 relative">
                    <table className="w-full text-left border-collapse">
                        {/* STICKY GLASS HEADER */}
                        <thead className="sticky top-0 bg-slate-950/80 backdrop-blur-md z-10 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Source</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">Product / Topic</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 w-1/2">Key Feedback</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 text-right">Sentiment Impact</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-6"><div className="h-4 bg-white/5 rounded-full w-24"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-white/5 rounded-full w-32"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-white/5 rounded-full w-full"></div></td>
                                        <td className="px-6 py-6"><div className="h-4 bg-white/5 rounded-full w-16 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : data.results.length > 0 ? (
                                data.results.map((r, idx) => {
                                    const rawScore = r.sentiment_score || 0;
                                    const mappedProgress = Math.min(100, Math.max(5, Math.abs(rawScore * 100)));
                                    const baseColor = rawScore >= 0.2 ? 'accent' : rawScore <= -0.2 ? 'red-400' : 'slate-400';

                                    return (
                                        <tr key={idx} className="hover:bg-white/5 transition-colors group cursor-pointer">
                                            {/* Source Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <span className="px-3 py-1 rounded bg-slate-950 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 w-max">
                                                    <div className={`w-1.5 h-1.5 rounded-full bg-${baseColor}`}></div>
                                                    {r.platform}
                                                </span>
                                            </td>

                                            {/* Entity Cell */}
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-bold text-slate-200">{r.product}</span>
                                                    <span className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                                                        <Hash size={10} /> {r.topic}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Text Block */}
                                            <td className="px-6 py-5">
                                                <p className="text-sm text-slate-300 leading-relaxed max-w-xl group-hover:text-slate-100 transition-colors">
                                                    &ldquo;{r.text}&rdquo;
                                                </p>
                                            </td>

                                            {/* Sentiment Sparkline */}
                                            <td className="px-6 py-5 whitespace-nowrap text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border bg-${baseColor}/10 text-${baseColor} border-${baseColor}/20`}>
                                                        {r.sentiment_label}
                                                    </div>
                                                    
                                                    {/* Inline Horizontal Sparkbar */}
                                                    <div className="flex items-center gap-2 w-32 justify-end">
                                                        <span className="text-[10px] text-slate-500 font-bold">{rawScore.toFixed(2)}</span>
                                                        <div className="w-16 h-1.5 bg-slate-900 rounded-full overflow-hidden flex justify-start">
                                                            <div 
                                                                className={`h-full rounded-full transition-all duration-1000 bg-${baseColor} ${rawScore < 0 ? 'ml-auto' : ''}`}
                                                                style={{ width: `${mappedProgress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-500 italic">
                                            <span className="text-4xl mb-4 opacity-50"><BarChart/></span>
                                            No matching records found in the sentiment index.
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Pagination */}
            {data.results.length > 0 && !loading && (
                <div className="flex justify-center pt-4 pb-12">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handlePageChange(filters.page - 1)}
                            disabled={filters.page === 1}
                            className="px-4 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-300 disabled:opacity-30 hover:bg-slate-800 transition-all font-bold text-sm"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, Math.ceil(data.total / 20)))].map((_, i) => {
                                const p = i + 1;
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-10 h-10 rounded-xl border font-bold text-sm transition-all ${filters.page === p
                                                ? 'bg-primary text-slate-950 border-primary shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                                                : 'bg-slate-900 text-slate-400 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => handlePageChange(filters.page + 1)}
                            disabled={data.results.length < 20}
                            className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all font-bold text-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SentimentExplorer;
