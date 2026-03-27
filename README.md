# MarketForecaster

> AI-powered consumer sentiment analysis and market trend forecasting dashboard for smart speaker products.

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)](https://fastapi.tiangolo.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen)](https://www.mongodb.com/)

---

## Overview

MarketForecaster aggregates consumer sentiment data from multiple sources — Amazon reviews, YouTube comments, news articles, and web-scraped product reviews — and presents AI-generated insights through an interactive dashboard.

**Products tracked:**
- Amazon Echo Dot
- Google Nest Mini
- Apple HomePod Mini

**Key features:**
- Real-time sentiment trend charts (Last 7, 30, 90 days)
- Brand comparison analytics with dynamic date filtering
- AI-detected anomaly alerts with live feed
- Sentiment Explorer with full-text search and faceted filters
- **Market Forecast**: AI-powered sentiment predictions (p-value based) with Risk Meter and Key Drivers panels
- **Live AI Assistant**: Context-aware floating chatbot that answers questions about the current page data
- **Premium Reports**: Exportable PDF/Excel intelligence with dynamic charts and AI insights
- **Intelligent Profile**: Progress tracking, image uploads (Avatar/Banner), and Quick Actions
- User authentication (JWT)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.10+ |
| Database | MongoDB (local or Atlas) |
| Data sources | Amazon Kaggle dataset, YouTube Data API, GNews API, Crawl4AI web scraping |
| Auth | JWT stored in localStorage |

---

## Project Structure

```
Market-trend-forecaster/
├── Frontend/          # React + Vite app
│   └── src/
│       ├── pages/     # Dashboard, Reports, Chatbot, Profile ...
│       ├── components/# Shared UI & Layout components
│       ├── services/  # API services (auth, reports, dashboard)
│       └── routes/    # App routing
├── backend/           # FastAPI server
│   ├── app/
│   │   ├── routes/    # API endpoints (reports, user, auth)
│   │   ├── static/    # User uploads (avatars, banners)
│   │   └── main.py
│   └── .env           # Environment variables
├── ingestion/         # Data ingestion pipelines
└── data/              # Datasets
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

---

### 1 — Clone the repo

```bash
git clone https://github.com/Prakhar1903/Market-trend-forecaster.git
cd Market-trend-forecaster
```

---

### 2 — Backend Setup (FastAPI)

```bash
# Create and activate virtual environment
python -m venv backend/venv
source backend/venv/bin/activate        # Windows: backend\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your values (see below)

# Start the server
cd backend
./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# (Windows: .\venv\Scripts\uvicorn app.main:app --reload --host 0.0.0.0 --port 8000)
```

API docs available at: **http://localhost:8000/docs**

#### `backend/.env` variables

```env
MONGODB_URL=mongodb://localhost:27017
DB_NAME=market_forecaster
JWT_SECRET=your_secret_key_here
OPENROUTER_API_KEY=your_openrouter_key
```

---

### 3 — Frontend Setup (React + Vite)

```bash
cd Frontend
npm install
npm run dev
```

App available at: **http://localhost:5173**

> The frontend expects the backend running at `http://localhost:8000`.

---

## App Pages & Routes

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/signup` | Sign up |
| `/dashboard` | Overview (KPIs, trends, topics, alerts) |
| `/dashboard/brands` | Brand Comparison (Date filtering synced) |
| `/dashboard/explorer` | Sentiment Explorer (search + filter) |
| `/dashboard/alerts` | AI Alerts (Live context-aware feed) |
| `/dashboard/reports` | Exportable PDF/Excel Reports |
| `/dashboard/chatbot` | **Market Consultant AI** (Markdown + SSE Streaming) |
| `/dashboard/forecast` | **Market Forecast** (Risk score + Key Drivers) |
| `/dashboard/profile` | User Profile |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| CORS errors | Ensure frontend runs at `http://localhost:5173` |
| Empty dashboard | Ensure MongoDB is running and `MONGODB_URL` is set correctly |
| `ERR_CONNECTION_REFUSED` | Standardized Port is **8000**. Check all service files use this. |
| `No module named 'openpyxl'` | Run `pip install -r backend/requirements.txt` to get report dependencies. |
| Login not working | Check `JWT_SECRET` is set in `backend/.env` |
| Backend won't start | Run `pip install -r backend/requirements.txt` inside the venv |


---

## Data

~2,679 reviews/comments across 3 products sourced from:
- Amazon product reviews (Kaggle)
- YouTube comments (YouTube Data API)
- News articles (GNews API)
- Web reviews (Crawl4AI scraping)
