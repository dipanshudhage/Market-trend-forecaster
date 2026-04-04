import React, { useState, useEffect } from "react";
import { Heart, MessageSquareText, ThumbsUp, BellRing } from "lucide-react";
import { motion } from "framer-motion";

const AnimatedNumber = ({ value, duration = 1000, suffix = "", decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const startValue = displayValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = progress * (endValue - startValue) + startValue;

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  if (isNaN(displayValue)) return <span>0{suffix}</span>;

  return <span>{displayValue.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
};

const KpiRow = ({ summary, filters }) => {
  if (!summary) return null;

  const kpis = [
    {
      label: "Overall Sentiment",
      value: summary.overallSentiment * 100,
      suffix: "%",
      decimals: 0,
      color: summary.overallSentiment >= 0.2 ? "text-accent" : summary.overallSentiment <= -0.2 ? "text-red-400" : "text-primary",
      trend: summary.overallSentiment >= 0 ? "↑" : "↓",
      percentage: "12%",
      trendColor: summary.overallSentiment >= 0 ? "text-accent" : "text-red-400",
      icon: <Heart className={`w-4 h-4 ${summary.overallSentiment >= 0 ? 'text-accent' : 'text-red-400'}`} />
    },
    {
      label: "Total Mentions",
      value: summary.mentions,
      suffix: "",
      decimals: 0,
      color: "text-secondary",
      trend: "↑",
      percentage: "8%",
      trendColor: "text-accent",
      icon: <MessageSquareText className="w-4 h-4 text-secondary" />
    },
    {
      label: "Positive / Negative",
      value: summary.positivePct,
      suffix: "%",
      decimals: 2,
      subValue: summary.negativePct,
      color: "text-slate-100",
      trend: "↑",
      percentage: "5%",
      trendColor: "text-accent",
      icon: <ThumbsUp className="w-4 h-4 text-emerald-400" />
    },
    {
      label: "Active Alerts",
      value: summary.activeAlerts,
      suffix: "",
      decimals: 0,
      color: summary.activeAlerts > 0 ? "text-red-400" : "text-slate-400",
      trend: "↓",
      percentage: "2%",
      trendColor: "text-accent",
      icon: <BellRing className={`w-4 h-4 ${summary.activeAlerts > 0 ? 'text-red-400' : 'text-slate-400'}`} />
    },
  ];

  const sourceLabel = filters.source === 'all' ? 'All Sources' : filters.source.replace(/-/g, ' ').toUpperCase();
  const productLabel = filters.product === 'all' ? 'All Products' : filters.product.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kpis.map((kpi, i) => (
        <motion.div
           key={i}
           whileHover={{ scale: 1.02, y: -2 }}
           transition={{ type: "spring", stiffness: 300, damping: 20 }}
           className="glass-card p-6 relative group overflow-hidden flex flex-col justify-between min-h-35"
        >
          <div className={`absolute top-0 left-0 w-1 h-full opacity-50 ${kpi.trendColor === 'text-accent' ? 'bg-accent' : 'bg-red-400'}`} />

          <div>
            <div className="flex justify-between items-start mb-1 h-6">
              <div className="flex items-center gap-1.5">
                {kpi.icon}
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{kpi.label}</p>
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${kpi.trendColor} bg-white/5 px-2 py-0.5 rounded-full`}>
                {kpi.trend} {kpi.percentage}
              </div>
            </div>

            <div className={`flex flex-col gap-1 ${kpi.color}`}>
              <div className="flex items-baseline gap-2">
                {kpi.subValue !== undefined && <span className="text-[10px] font-bold text-slate-500 uppercase w-16">Positive:</span>}
                <h3 className="text-3xl font-black tracking-tighter">
                  <AnimatedNumber value={kpi.value} suffix={kpi.suffix} decimals={kpi.decimals} />
                </h3>
              </div>
              {kpi.subValue !== undefined && (
                <div className="flex items-baseline gap-2 border-t border-white/5 pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase w-16">Negative:</span>
                  <p className="text-xl font-bold tracking-tighter text-red-400">
                    <AnimatedNumber value={kpi.subValue} suffix={kpi.suffix} decimals={kpi.decimals} />
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter truncate">
              {sourceLabel} <span className="mx-1 opacity-30">|</span> {productLabel}
            </p>
          </div>

          {/* Subtle background glow */}
          <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${kpi.trendColor === 'text-accent' ? 'bg-accent' : 'bg-red-400'}`} />
        </motion.div>
      ))}
    </div>
  );
};

export default KpiRow;
