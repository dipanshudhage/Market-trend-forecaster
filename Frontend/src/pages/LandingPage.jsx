import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import echo from "../assets/echo.png";
import nest from "../assets/nest.png";
import homepod from "../assets/homepod.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="bg-slate-950 min-h-screen text-white font-inter">
      <Navbar />

      <main className="pt-22">
        {/* HERO SECTION */}
        <section className="relative py-20 px-8 text-center max-w-7xl mx-auto overflow-hidden text-white">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-200 bg-primary/20 blur-[150px] rounded-full -z-10"></div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              Predict Market Trends
            </span>
            <br />
            Before They Happen
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-6 leading-relaxed">
            AI powered consumer sentiment analysis and trend forecasting
            to help businesses understand what customers want next.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">
            <button
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
              className="btn-primary text-xl px-10 py-5"
            >
              Explore Dashboard
            </button>

            <button
              onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
              className="px-10 py-5 border border-white/10 hover:border-primary/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 text-slate-300 hover:text-white font-bold"
            >
              Get Started
            </button>
          </div>

          {/* STATS */}
          <div className="flex justify-center gap-16 mt-20 flex-wrap">
            <div className="text-center">
              <h3 className="text-5xl font-black text-primary drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">12K+</h3>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3">Reviews Analyzed</p>
            </div>

            <div className="text-center">
              <h3 className="text-5xl font-black text-secondary drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]">95%</h3>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3">Accuracy Rate</p>
            </div>

            <div className="text-center">
              <h3 className="text-5xl font-black text-accent drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]">3</h3>
              <p className="text-slate-500 font-bold tracking-widest uppercase text-xs mt-3">Products Tracked</p>
            </div>
          </div>
        </section>

        {/* PRODUCTS */}
        <section id="products" className="py-40 px-8 max-w-7xl mx-auto border-t border-white/5">
          <h2 className="text-4xl md:text-5xl font-black text-center mb-24">
            Products We <span className="text-primary">Analyze</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ProductCard
              img={echo}
              name="Amazon Echo Dot"
              desc="Alexa powered smart speaker with powerful smart home integration."
            />

            <ProductCard
              img={nest}
              name="Google Nest Mini"
              desc="Google Assistant smart speaker with voice intelligence."
            />

            <ProductCard
              img={homepod}
              name="Apple HomePod Mini"
              desc="Premium smart speaker with Siri and Apple ecosystem support."
            />
          </div>
        </section>

        {/* FEATURES */}
        <section id="features" className="py-40 px-8 bg-slate-900/40 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -z-10" />
          <h2 className="text-4xl md:text-5xl font-black text-center mb-24">
            Powerful <span className="text-secondary">Analytics</span>
          </h2>

          <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <Feature icon="🤖" title="AI Sentiment" desc="Deep LLM based opinion analysis." />
            <Feature icon="📈" title="Trend Forecasting" desc="Predict future consumer behavior." />
            <Feature icon="🧠" title="Topic Modeling" desc="Identify key discussion clusters." />
            <Feature icon="🔍" title="Smart Insights" desc="RAG driven business reports." />
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="py-48 px-8 text-center max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black mb-10">
            About the <span className="text-gradient">Project</span>
          </h2>

          <p className="text-2xl text-slate-400 leading-relaxed italic font-light">
            "MarketForecaster collects consumer data from reviews, social media,
            and news articles. Using AI powered sentiment analysis,
            topic modeling and RAG pipelines we generate actionable insights
            to help businesses predict market demand and customer preferences."
          </p>
        </section>

        {/* CTA */}
        <section className="py-40 text-center bg-linear-to-b from-slate-950 to-slate-900 border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5 opacity-30 pointer-events-none" />
          <h2 className="text-5xl md:text-7xl font-black mb-14 text-white relative z-10">
            Ready for <span className="text-primary">Market Insights?</span>
          </h2>

          <button
            onClick={() => navigate(isLoggedIn ? "/dashboard" : "/signup")}
            className="btn-primary text-2xl px-16 py-7 relative z-10 font-black"
          >
            {isLoggedIn ? "View Your Dashboard" : "Get Started Now"}
          </button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function ProductCard({ img, name, desc }) {
  return (
    <div className="glass-card p-10 text-center group hover:border-primary/40 transition-all duration-500 hover:-translate-y-2">
      <div className="w-24 h-24 mx-auto mb-8 relative p-2">
        <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        <img src={img} alt={name} className="w-full h-full object-contain relative z-10 filter drop-shadow-2xl" />
      </div>

      <h3 className="text-2xl font-bold mb-4">{name}</h3>

      <p className="text-slate-400 group-hover:text-slate-300 transition-colors">{desc}</p>

      <div className="mt-6 text-yellow-400 text-xl tracking-tight">
        ⭐⭐⭐⭐☆
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="glass-card p-8 border-l-4 border-l-primary hover:bg-slate-800/60 transition-all duration-300">
      <div className="text-5xl mb-6">{icon}</div>

      <h4 className="text-xl font-bold mb-3">{title}</h4>

      <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default LandingPage;