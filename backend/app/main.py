from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

# -------------------- INIT APP --------------------
app = FastAPI(
    title="Market Trend Forecaster API",
    description="AI-powered Market Trend & Consumer Sentiment Forecaster",
    version="1.0.0"
)

# -------------------- CORS CONFIG (FINAL FIX) --------------------
# 🔥 VERY IMPORTANT: include ALL possible frontend URLs

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",

    # Production (Vercel)
    "https://market-trend-forecaster.vercel.app",
    "https://market-trend-forecaster-git-main-dipanshudhages-projects.vercel.app",
    "market-trend-forecaster-rap1y17pv-dipanshudhages-projects.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # ✅ MUST NOT be "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- STATIC FILES --------------------
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")

if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# -------------------- IMPORT ROUTES --------------------
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.raw_data_routes import router as raw_data_router
from app.routes.sentiment_routes import router as sentiment_router
from app.routes.chat_routes import router as chat_router
from app.routes.reports_routes import router as reports_router
from app.routes.forecast_routes import router as forecast_router

# -------------------- ROUTES --------------------
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(raw_data_router, prefix="/api", tags=["raw_data"])
app.include_router(sentiment_router, prefix="/api", tags=["sentiment"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(reports_router, prefix="/api", tags=["reports"])
app.include_router(forecast_router, prefix="/api", tags=["forecast"])

# -------------------- ROOT --------------------
@app.get("/")
def root():
    return {
        "status": "API running 🚀",
        "message": "Market Trend Forecaster Backend is live"
    }

# -------------------- HEALTH --------------------
@app.get("/health")
def health():
    return {"status": "healthy"}
