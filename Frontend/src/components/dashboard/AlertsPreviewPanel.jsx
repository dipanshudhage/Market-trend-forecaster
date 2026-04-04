import React from "react";
import { useNavigate } from "react-router-dom";

const AlertsPreviewPanel = ({ alerts }) => {
  const navigate = useNavigate();

  const levelColor = (l = "") => {
    const lvl = l.toLowerCase();
    if (lvl === "high" || lvl === "critical") return { border: "border-l-red-500", label: "text-red-400" };
    if (lvl === "medium") return { border: "border-l-yellow-500", label: "text-yellow-400" };
    return { border: "border-l-blue-500", label: "text-blue-400" };
  };

  return (
    <div className="glass-card p-6 flex flex-col gap-4 h-full max-h-[500px]">

      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
        <span className="text-xl">🔔</span> Recent Alerts
      </h3>

      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
        Latest AI-detected anomalies
      </p>

      <div className="flex flex-col gap-3 overflow-y-auto pr-2">
        {(alerts || []).map((a, idx) => {
          const { border, label } = levelColor(a.level);
          return (
            <div key={idx} className={`p-4 rounded-xl bg-slate-800/20 border border-white/5 border-l-4 ${border} flex flex-col gap-2 group hover:bg-slate-800/40 transition-all`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-black uppercase tracking-widest ${label}`}>
                  {a.level} Priority
                </span>

                {a.time && (
                  <span className="text-[10px] text-slate-600 font-medium shrink-0">
                    🕐 {a.time}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-300 leading-relaxed group-hover:text-slate-100 transition-colors">
                {a.message}
              </p>
            </div>
          );
        })}
      </div>

      <div className="pt-5 border-t border-white/5">
        <button
          onClick={() => navigate('/dashboard/alerts')}
          className="w-full py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/10 transition-all cursor-pointer"
        >
          View All Alerts →
        </button>
      </div>

    </div>
  );
};

export default AlertsPreviewPanel;
