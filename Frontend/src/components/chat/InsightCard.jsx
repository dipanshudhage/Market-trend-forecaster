import React from "react";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

/**
 * Modern dashboard card for product sentiment data.
 */
const InsightCard = ({ product, positive, negative, trend }) => {
    const isUp = trend === "up";

    return (
        <div className="chat-insight-card p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group my-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {product} Sentiment Analysis
                </h4>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${isUp ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                    {isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {isUp ? "+12%" : "-8%"}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Critical Positive</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-100">{positive}%</span>
                        <ArrowUpRight size={14} className="text-emerald-500 opacity-50" />
                    </div>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Critical Negative</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-bold text-gray-100">{negative}%</span>
                    </div>
                </div>
            </div>

            <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                <div style={{ width: `${positive}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div style={{ width: `${negative}%` }} className="h-full bg-rose-500/50" />
            </div>
        </div>
    );
};

export default InsightCard;
