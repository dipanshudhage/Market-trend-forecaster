import React from "react";
import { useNavigate } from "react-router-dom";

const TopicsPanel = ({ topics }) => {
  const navigate = useNavigate();
  return (
    <div className="glass-card p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <span className="text-xl">🔥</span> Trending Topics
        </h3>
        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">
          Topic share based on total mentions
        </p>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        {topics.map((t) => (
          <div
            key={t.name}
            className="group relative w-full flex flex-col gap-1.5 bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-primary/30 p-3 rounded-2xl transition-all cursor-pointer backdrop-blur-sm"
          >
            {/* Name row */}
            <div className="flex items-center justify-between w-full gap-2">
              <span className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors truncate">
                {t.name}
              </span>
              <span className="text-[10px] font-black text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                {(t.popularity || 0).toFixed(0)}%
              </span>
            </div>

            {/* Progress + sentiment row */}
            <div className="flex items-center gap-2 w-full">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-1000 ${t.sentiment > 0.1 ? 'bg-accent' : t.sentiment < -0.1 ? 'bg-red-400' : 'bg-primary'
                    }`}
                  style={{ width: `${(t.popularity || 0)}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold uppercase tracking-tighter shrink-0 ${t.sentiment > 0.1 ? 'text-accent' : t.sentiment < -0.1 ? 'text-red-400' : 'text-slate-400'
                }`}>
                {t.sentiment > 0.1 ? 'Positive' : t.sentiment < -0.1 ? 'Negative' : 'Neutral'}
              </span>
            </div>

            {/* Hover tooltip */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-950 text-white text-[9px] font-bold py-1 px-3 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl">
              {(t.mentions || 0).toLocaleString()} Mentions
            </div>
          </div>
        ))}
      </div>

      {(!topics || topics.length === 0) && (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-2 italic mt-8">
          <div className="text-2xl opacity-20">🏷️</div>
          <span className="text-xs">No topics identified in this segment</span>
        </div>
      )}

      <div className="mt-auto pt-6 border-t border-white/5">
        <button
          onClick={() => navigate('/dashboard/explorer?topic=all')}
          className="w-full py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 transition-all cursor-pointer"
        >
          Explore All Topics →
        </button>
      </div>
    </div>
  );
};

export default TopicsPanel;
