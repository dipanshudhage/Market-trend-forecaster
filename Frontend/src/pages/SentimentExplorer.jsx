import React, { useState, useEffect } from "react";
import { getSentimentExplorerData } from "../services/dashboardService";

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
        <div className="flex flex-col gap-8 animate-in fade-in duration-700">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">Sentiment Explorer</h1>
                <p className="text-slate-400">Deep dive into raw consumer feedback and social signal data</p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col gap-4 bg-slate-900/50 p-6 rounded-2xl border border-white/5 backdrop-blur-md">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Source</label>
                        <select
                            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={filters.source}
                            onChange={(e) => handleFilterChange("source", e.target.value)}
                        >
                            <option value="all">All Sources</option>
                            <option value="amazon-reviews">Amazon Reviews</option>
                            <option value="youtube">YouTube Comments</option>
                            <option value="news">News Articles</option>
                            <option value="web-reviews">Review Sites</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Product</label>
                        <select
                            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={filters.product}
                            onChange={(e) => handleFilterChange("product", e.target.value)}
                        >
                            {productOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sentiment</label>
                        <select
                            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={filters.sentiment}
                            onChange={(e) => handleFilterChange("sentiment", e.target.value)}
                        >
                            <option value="all">All Sentiments</option>
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Topic</label>
                        <select
                            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-300 outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
                            value={filters.topic}
                            onChange={(e) => handleFilterChange("topic", e.target.value)}
                        >
                            {topicOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="h-px bg-white/5 my-2" />

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Search Keywords</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Search across reviews and comments..."
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={filters.search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between px-2">
                <span className="text-sm font-bold text-slate-400">
                    Showing <span className="text-slate-100">{data.results.length}</span> of <span className="text-slate-100">{data.total}</span> results
                </span>

                {/* Pagination Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={filters.page === 1 || loading}
                        className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 disabled:opacity-30 hover:bg-slate-800 transition-all"
                    >
                        ← Prev
                    </button>
                    <span className="text-xs font-black text-slate-500 bg-slate-900 px-3 py-2 rounded-lg border border-white/5">
                        Page {filters.page}
                    </span>
                    <button
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={data.results.length < 20 || loading}
                        className="p-2 rounded-lg bg-slate-900 border border-white/5 text-slate-400 disabled:opacity-30 hover:bg-slate-800 transition-all"
                    >
                        Next →
                    </button>
                </div>
            </div>

            {/* Results List */}
            <div className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-40 bg-slate-900/40 rounded-2xl border border-white/5" />
                        ))}
                    </div>
                ) : data.results.length > 0 ? (
                    data.results.map((r, idx) => (
                        <div key={idx} className="glass-card p-6 flex flex-col gap-4 hover:border-primary/30 transition-all group">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-1 rounded bg-slate-950 border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {r.platform}
                                    </span>
                                    <span className="px-2.5 py-1 rounded bg-slate-950 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest">
                                        {r.product}
                                    </span>
                                    <span className="px-2.5 py-1 rounded bg-slate-950 border border-white/10 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        {r.topic}
                                    </span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${r.sentiment_label === 'Positive' ? 'bg-accent/10 text-accent border-accent/20' :
                                        r.sentiment_label === 'Negative' ? 'bg-red-400/10 text-red-400 border-red-400/20' :
                                            'bg-slate-400/10 text-slate-400 border-slate-400/20'
                                    }`}>
                                    {r.sentiment_label}
                                </div>
                            </div>

                            <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">
                                "{r.text}"
                            </p>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Sentiment Score: {r.sentiment_score.toFixed(2)}</span>
                                </div>
                                <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline transition-all">
                                    Analyze Record →
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/20 border border-dashed border-white/10 rounded-2xl italic">
                        <span className="text-3xl mb-2">🔍</span>
                        No matching records found for this selection
                    </div>
                )}
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
