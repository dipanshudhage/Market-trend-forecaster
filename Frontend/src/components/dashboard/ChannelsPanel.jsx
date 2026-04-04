import React from "react";
import { useNavigate } from "react-router-dom";

const ChannelsPanel = ({ channels }) => {
  const navigate = useNavigate();
  const totalMentions = (channels || []).reduce((acc, c) => acc + c.mentions, 0);

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full max-h-[500px]">

  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
    <span className="text-xl">🌐</span> Channels
  </h3>

  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
    Mention distribution by source
  </p>

  <div className="flex flex-col gap-3">
    {(channels || []).map((c) => {
      const pct = totalMentions > 0 ? (c.mentions / totalMentions) * 100 : 0;

      return (
        <div key={c.name} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all group">

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-200">{c.name}</span>

            <span className="px-2 py-0.5 rounded text-xs font-black bg-slate-950 text-slate-300 border border-white/5">
              {pct.toFixed(1)}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary/60 rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>

            <span className="text-[10px] text-slate-500 shrink-0">
              {c.mentions.toLocaleString()} mentions
            </span>
          </div>

        </div>
      );
    })}
  </div>

  <div className="pt-5 border-t border-white/5">
    <button
      onClick={() => navigate('/dashboard/explorer')}
      className="w-full py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 transition-all cursor-pointer"
    >
      View All Channels →
    </button>
  </div>

</div>
  );
};

export default ChannelsPanel;
