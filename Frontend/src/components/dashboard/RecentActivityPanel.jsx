import React from "react";
import { useNavigate } from "react-router-dom";

const RecentActivityPanel = ({ activities }) => {
    const navigate = useNavigate();
    if (!activities || activities.length === 0) return null;

    return (
        <div className="glass-card flex flex-col overflow-hidden max-h-130">

    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span className="text-xl">🕒</span> Recent Activity
        </h3>
        <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
            Live Feed
        </span>
    </div>
        <div className="overflow-y-auto p-2">
        <div className="flex flex-col gap-4">
            {activities.map((activity, idx) => (
                <div
                    key={idx}
                    className="p-4 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                >
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${activity.sentiment_label === 'Positive' ? 'bg-accent' :
                                        activity.sentiment_label === 'Negative' ? 'bg-red-400' : 'bg-slate-400'
                                        }`} />
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        {activity.platform}
                                    </span>
                                </div>
                                <span className="text-[10px] font-medium text-slate-500">
                                    {activity.product}
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed group-hover:text-slate-100 transition-colors">
                                &ldquo;{activity.text}&rdquo;
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-white/5 text-center">
                <button
                    onClick={() => navigate('/dashboard/explorer')}
                    className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors cursor-pointer uppercase tracking-widest"
                >
                    View All Feedback →
                </button>
            </div>
        </div>
    );
};

export default RecentActivityPanel;
