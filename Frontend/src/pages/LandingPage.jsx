import React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ShieldCheck, Sparkles, BarChart3, Brain, Search, ChevronRight, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MouseGlow from "../components/common/MouseGlow";
import AnimatedCounter from "../components/common/AnimatedCounter";

import echo from "../assets/echo.png";
import nest from "../assets/nest.png";
import homepod from "../assets/homepod.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.2 } 
    }
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white font-inter overflow-x-hidden group">
      <Navbar />
      <MouseGlow />

      <main className="pt-20">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center px-6 overflow-hidden">
          {/* Animated Background Atmosphere */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 blur-[150px] rounded-full -z-10 animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-secondary/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Next-Gen Sentiment Analysis</span>
              </motion.div>

              <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl font-black mb-8 leading-[1.1] tracking-tighter">
                Predict Market <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary bg-[length:200%_auto] animate-gradient-x italic">
                  Trends Early
                </span>
              </motion.h1>

              <motion.p variants={fadeInUp} className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                Unlock high-fidelity consumer insights before the market shifts. 
                Data-driven forecasting powered by enterprise-grade AI.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center gap-6">
                <button
                  onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
                  className="btn-primary text-xl px-12 py-5 flex items-center justify-center gap-3 group"
                >
                  Explore Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
                  className="px-12 py-5 border border-white/10 hover:border-primary/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-slate-300 hover:text-white font-bold backdrop-blur-md bg-white/5"
                >
                  Get Started
                </button>
              </motion.div>
            </motion.div>

            {/* STATS */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-12 mt-24 max-w-4xl mx-auto border-t border-white/5 pt-16"
            >
              <div className="text-center group">
                <h3 className="text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                  <AnimatedCounter value={12} />K+
                </h3>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3 group-hover:text-slate-300 transition-colors">Reviews Analyzed</p>
              </div>

              <div className="text-center group">
                <h3 className="text-5xl font-black text-secondary drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">
                  <AnimatedCounter value={95} />%
                </h3>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3 group-hover:text-slate-300 transition-colors">Accuracy Rate</p>
              </div>

              <div className="text-center group">
                <h3 className="text-5xl font-black text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                  <AnimatedCounter value={3} />
                </h3>
                <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3 group-hover:text-slate-300 transition-colors">Products Tracked</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="py-40 px-6 max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
             <h2 className="text-4xl md:text-5xl font-black mb-6">
              Products We <span className="text-primary italic">Analyze</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Focused intelligence on leading smart ecosystem devices.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProductCard
              img={echo}
              name="Amazon Echo Dot"
              desc="Alexa powered smart speaker with deep neural language understanding."
            />

            <ProductCard
              img={nest}
              name="Google Nest Mini"
              desc="Google Assistant intelligence with multi-room audio capabilities."
            />

            <ProductCard
              img={homepod}
              name="Apple HomePod Mini"
              desc="Premium Siri-integrated speaker featuring computational audio analysis."
            />
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-40 px-6 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Powerful <span className="text-secondary italic">Analytics</span>
            </h2>
            <p className="text-slate-400">Leveraging state-of-the-art LLMs for market dominance.</p>
          </motion.div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature icon={<Brain className="w-8 h-8" />} title="AI Sentiment" desc="Deep neural networks decode nuanced consumer opinions and emotional subtext." />
            <Feature icon={<Zap className="w-8 h-8" />} title="Trend Forecasting" desc="Predictive modeling identifies emerging market shifts before they become mainstream." />
            <Feature icon={<Search className="w-8 h-8" />} title="Topic Modeling" desc="Extract latent discussion clusters to understand what truly drives your customers." />
            <Feature icon={<ShieldCheck className="w-8 h-8" />} title="Smart Insights" desc="RAG-powered intelligence reports for enterprise-level strategic decision making." />
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-48 px-6 text-center max-w-5xl mx-auto relative">
           <div className="absolute inset-0 bg-primary/5 blur-[100px] rounded-full opacity-30 -z-10" />
          
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-12 uppercase tracking-tighter">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary underline decoration-primary/30">Vision</span>
            </h2>

            <p className="text-2xl md:text-3xl text-slate-200 leading-tight font-medium max-w-4xl mx-auto">
              "We bridges the gap between raw consumer feedback and actionable strategy. 
              By synthesizing billions of data points into clear visual patterns, 
              we empower brands to lead market evolution rather than reacting to it."
            </p>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="py-40 px-6 text-center bg-slate-950 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-40 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h2 className="text-5xl md:text-8xl font-black mb-14 text-white leading-none tracking-tighter">
              Ready to <br />
              <span className="text-primary italic">Outsmart</span> the Market?
            </h2>

            <button
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
              className="btn-primary text-2xl px-16 py-8 font-black flex items-center justify-center gap-4 mx-auto group shadow-2xl shadow-primary/20"
            >
              {isLoggedIn ? "Access Intelligence" : "Get Started Now"}
              <ChevronRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function ProductCard({ img, name, desc }) {
  return (
    <motion.div 
      whileHover={{ y: -12 }}
      className="glass-card p-10 text-center group transition-all duration-500 hover:border-primary/40 flex flex-col items-center"
    >
      <div className="w-32 h-32 mb-10 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <img src={img} alt={name} className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
      </div>

      <h3 className="text-2xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight">{name}</h3>

      <p className="text-slate-400 group-hover:text-slate-300 transition-colors text-sm leading-relaxed mb-8">{desc}</p>

      <div className="mt-auto flex gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
            <Sparkles key={s} className={`w-4 h-4 ${s === 5 ? 'text-slate-600' : 'text-primary shadow-glow'}`} />
        ))}
      </div>
    </motion.div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="glass-card p-10 border-t-2 border-t-primary/20 hover:border-t-primary transition-all duration-500 flex flex-col h-full bg-slate-900/30 backdrop-blur-3xl"
    >
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-8 border border-primary/20">
        {icon}
      </div>

      <h4 className="text-xl font-black mb-4 tracking-tight uppercase italic">{title}</h4>

      <p className="text-slate-400 text-sm leading-6">{desc}</p>
    </motion.div>
  );
}

export default LandingPage;