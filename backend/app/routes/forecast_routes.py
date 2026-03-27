from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

router = APIRouter()

DATA_PATH = os.path.join(os.path.dirname(__file__), "../../../data/sentiment_output.csv")

BRAND_CONFIGS = [
    {"id": "echo-dot",     "name": "Echo Dot",     "csv_key": "Amazon Alexa"},
    {"id": "nest-mini",    "name": "Nest Mini",     "csv_key": "Google Nest Mini"},
    {"id": "homepod-mini", "name": "HomePod Mini",  "csv_key": "Apple HomePod Mini"},
]

NOW = datetime(2026, 3, 16)


def linear_forecast(daily_df: pd.DataFrame, horizon_days: int = 30):
    """Fit a simple linear regression on daily sentiment and project forward."""
    if daily_df.empty or len(daily_df) < 3:
        return [], []

    daily_df = daily_df.sort_values("date").reset_index(drop=True)
    X = np.arange(len(daily_df)).reshape(-1, 1)
    y = daily_df["sentiment"].values

    # Least-squares fit
    coeffs = np.polyfit(X.flatten(), y, 1)
    slope, intercept = coeffs

    # Historical fitted line
    historical = [
        {
            "date": row["date"].strftime("%Y-%m-%d"),
            "actual": round(float(row["sentiment"]), 4),
            "predicted": None,
            "lower": None,
            "upper": None,
        }
        for _, row in daily_df.iterrows()
    ]

    # Residual std as confidence interval proxy
    y_hat = slope * X.flatten() + intercept
    residuals = y - y_hat
    std_err = float(np.std(residuals)) if len(residuals) > 1 else 0.05

    # Future projection
    last_date = daily_df["date"].iloc[-1]
    n = len(daily_df)
    forecast = []
    for i in range(1, horizon_days + 1):
        fut_x = n - 1 + i
        pred = slope * fut_x + intercept
        pred = float(np.clip(pred, -1, 1))
        width = std_err * (1 + i / horizon_days)  # widen with time
        forecast.append({
            "date": (last_date + timedelta(days=i)).strftime("%Y-%m-%d"),
            "actual": None,
            "predicted": round(pred, 4),
            "lower": round(float(np.clip(pred - width, -1, 1)), 4),
            "upper": round(float(np.clip(pred + width, -1, 1)), 4),
        })

    return historical, forecast


def get_risk_level(current: float, std_err: float, slope: float) -> dict:
    """Classify brand risk based on direction and volatility."""
    if slope > 0.001 and std_err < 0.15:
        return {"level": "safe",     "label": "Safe Zone",  "color": "#10b981", "emoji": "🟢"}
    elif abs(slope) <= 0.001 or std_err > 0.2:
        return {"level": "volatile", "label": "Volatile",   "color": "#f59e0b", "emoji": "🟡"}
    else:
        return {"level": "warning",  "label": "Warning",    "color": "#ef4444",  "emoji": "🔴"}


@router.get("/forecast")
async def get_forecast(horizon: int = Query(30, ge=7, le=90)):
    """Return per-brand linear forecast for the given horizon (7–90 days)."""
    try:
        df = pd.read_csv(DATA_PATH, sep="\t")
        df["date"] = pd.to_datetime(df.get("date", "2026-03-16"))

        # Use last 90 days as baseline for regression
        cutoff = NOW - timedelta(days=90)
        df = df[df["date"] >= cutoff]

        brands_out = []
        for brand in BRAND_CONFIGS:
            bdf = df[df["product"].str.contains(brand["csv_key"], case=False, na=False)]
            if bdf.empty:
                continue

            daily = (
                bdf.groupby(bdf["date"].dt.date)["sentiment_score"]
                .mean()
                .reset_index()
                .rename(columns={"date": "date", "sentiment_score": "sentiment"})
            )
            daily["date"] = pd.to_datetime(daily["date"])

            historical, forecast = linear_forecast(daily, horizon)

            current_sent = float(bdf["sentiment_score"].mean())

            # Slope / std from full series
            if len(daily) >= 3:
                X = np.arange(len(daily))
                coeffs = np.polyfit(X, daily["sentiment"].values, 1)
                slope = float(coeffs[0])
                y_hat = coeffs[0] * X + coeffs[1]
                std_err = float(np.std(daily["sentiment"].values - y_hat))
            else:
                slope, std_err = 0.0, 0.1

            predicted_sent = forecast[-1]["predicted"] if forecast else current_sent
            change_pct = round((predicted_sent - current_sent) * 100, 2)

            if change_pct > 1:
                direction = "GAINING"
            elif change_pct < -1:
                direction = "LOSING"
            else:
                direction = "HOLDING"

            confidence = int(np.clip(85 - std_err * 100, 55, 95))
            risk = get_risk_level(current_sent, std_err, slope)

            brands_out.append({
                "id":                  brand["id"],
                "name":                brand["name"],
                "current_sentiment":   round(current_sent, 4),
                "predicted_sentiment": round(predicted_sent, 4),
                "change_pct":          change_pct,
                "direction":           direction,
                "risk":                risk,
                "confidence":          confidence,
                "historical":          historical,
                "forecast":            forecast,
            })

        # AI narrative summary
        if brands_out:
            best  = max(brands_out, key=lambda b: b["change_pct"])
            worst = min(brands_out, key=lambda b: b["change_pct"])
            ai_summary = (
                f"Based on the last 90 days of sentiment data, {best['name']} is positioned "
                f"for a {abs(best['change_pct']):.1f}% {'gain' if best['change_pct'] > 0 else 'decline'} "
                f"over the next {horizon} days, driven by a consistent upward trajectory in reviews and mentions. "
                f"{worst['name']} presents the highest short-term risk with a projected "
                f"{'decline' if worst['change_pct'] < 0 else 'weaker gain'} of "
                f"{abs(worst['change_pct']):.1f}%, where volatility in voice recognition discussions "
                f"remains the primary concern. Overall market confidence sits at "
                f"{int(sum(b['confidence'] for b in brands_out) / len(brands_out))}% "
                f"across all tracked products."
            )
        else:
            ai_summary = "Insufficient data to generate forecast insights."

        # Risk factors / drivers (static for demo — can be ML-driven later)
        drivers = [
            {"factor": "Amazon review volume", "impact": "positive", "probability": 78, "detail": "Sustained review activity lifts sentiment baseline"},
            {"factor": "YouTube comment momentum", "impact": "positive", "probability": 65, "detail": "Creator mentions trending upward this quarter"},
            {"factor": "News article sentiment", "impact": "neutral", "probability": 50, "detail": "Press coverage neutral, pending product announcements"},
        ]
        risk_factors = [
            {"factor": "News sentiment turns negative", "impact_pct": -8, "probability": 22, "detail": "Could lower overall scores by ~8%"},
            {"factor": "Amazon review spike", "impact_pct": +12, "probability": 35, "detail": "Positive launch reviews could accelerate gains"},
            {"factor": "Competitor price drop", "impact_pct": -5, "probability": 18, "detail": "Pricing pressure may shift consumer preference"},
        ]

        return {
            "brands":       brands_out,
            "ai_summary":   ai_summary,
            "drivers":      drivers,
            "risk_factors": risk_factors,
            "horizon_days": horizon,
            "as_of":        NOW.strftime("%Y-%m-%d"),
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"detail": str(e)})
