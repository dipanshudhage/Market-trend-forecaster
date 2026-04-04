import React from "react";
import {Link} from "react-router-dom";
import { Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SummaryPanel = ({ text }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-card mb-0 p-1 relative overflow-hidden group h-full"
    >
      <div className="absolute inset-0 mesh-gradient opacity-30 group-hover:opacity-50 transition-opacity duration-1000"></div>
      <div className="relative h-full bg-slate-950/40 backdrop-blur-xl p-6 rounded-[14px] flex flex-col md:flex-row items-center gap-6 border border-white/5">
        <div className="flex flex-col gap-1 w-full md:w-auto shrink-0">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap size={20} />
            </div>
            AI Insights
          </h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1 ml-[48px]">
            Generated Analysis
          </p>
        </div>

        <div className="hidden md:block w-px h-12 bg-white/10 shrink-0 mx-2" />

        <div className="flex-1 text-center md:text-left">
          <p className="text-[15px] text-slate-300 font-medium leading-relaxed italic pr-4">
            &ldquo;{text}&rdquo;
          </p>
        </div>

        <div className="pt-4 border-t border-white/10 md:border-t-0 md:pt-0 shrink-0">
          <Link to="/dashboard/reports" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-blue-400 font-bold text-xs transition-all flex items-center gap-2 group/btn cursor-pointer w-max">
            Detailed Report <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>  
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryPanel;