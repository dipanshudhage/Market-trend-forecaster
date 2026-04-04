# 🚀 Market Trend Forecaster

> **AI-powered consumer sentiment analysis and market trend forecasting dashboard.**

Analyze consumer signals from Amazon, YouTube, News, and Web sources for smart speaker products (Echo Dot, Nest Mini, HomePod Mini) using a high-fidelity React dashboard and a FastAPI backend.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Framer Motion, Chart.js/Recharts
- **Backend**: FastAPI (Python 3.10+), Pandas
- **Database**: MongoDB (User Auth & Alerts)
- **Data Source**: Tab-separated CSV (`data/sentiment_output.csv`)

---

## 🏃 Quick Start (First-Time Setup)

If you're running this for the first time, follow these exact steps:

### 1. Clone & Prepare
```bash
git clone https://github.com/Prakhar1903/Market-trend-forecaster.git
cd Market-trend-forecaster
```

### 2. Backend Setup
The backend handles data processing and serves the API.
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Configure environment
cp backend/.env.example backend/.env 
# [Optional] Edit backend/.env to add your AI keys

# Start the server
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
> **Note**: Ensure `data/sentiment_output.csv` exists in the root. This is the primary data source.

### 3. Frontend Setup
The frontend provides the interactive dashboard.
```bash
cd Frontend
npm install
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** to see the dashboard!

---

## 📁 Project Structure

| Folder | Description |
| :--- | :--- |
| `Frontend/` | React application with pages for Dashboard, Brands, Explorer, and Chat. |
| `backend/` | FastAPI server managing sentiment processing, PDF reports, and AI insights. |
| `ingestion/` | Python scripts for scraping and cleaning data from various platforms. |
| `data/` | Contains the core `sentiment_output.csv` and raw datasets. |

---

## 🧩 Key Features

- **Sentiment War Room**: Real-time comparison of brand performance with GAINING/LOSING indicators.
- **Time Machine**: Predictive forecasting with an interactive horizon slider.
- **Sentiment Explorer**: Deep-dive into raw feedback with keyword search and faceted filters.
- **AI Specialist**: A context-aware chatbot for natural language analysis of market data.
- **Professional Reports**: One-click PDF/Excel export of intelligence summaries.

---

## ⚠️ Troubleshooting

| Problem | Solution |
| :--- | :--- |
| **Empty Charts** | Ensure the backend is running and `data/sentiment_output.csv` has data. |
| **Authentication Failed** | Make sure a `JWT_SECRET` is defined in your `backend/.env`. |
| **Port Conflicts** | The backend uses port `8000` and frontend uses `5173`. Ensure these are free. |
| **Import Errors** | Always run backend commands *inside* the activated virtual environment. |

---

## 📧 Contact & Contributions
Feel free to open an issue or submit a pull request if you find any bugs or have feature suggestions!
