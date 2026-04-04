import os
import requests
import pandas as pd
import time
from dotenv import load_dotenv

# 🔥 FIX: absolute base path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 🔹 Load .env correctly
load_dotenv(os.path.join(BASE_DIR, "backend/.env"))

API_KEY = os.getenv("GNEWS_API_KEY")

PRODUCTS = [
    "Amazon Alexa",
    "Google Nest Mini",
    "Apple HomePod Mini"
]

# 🔹 Correct output path
OUTPUT_PATH = os.path.join(BASE_DIR, "data/processed/news_articles_clean.csv")

all_articles = []

# ❌ If API key missing → safe exit
if not API_KEY:
    print(0)
    exit()

for product in PRODUCTS:
    try:
        url = "https://gnews.io/api/v4/search"
        params = {
            "q": product,
            "lang": "en",
            "max": 50,
            "apikey": API_KEY
        }

        response = requests.get(url, params=params, timeout=10)

        if response.status_code != 200:
            continue

        data = response.json().get("articles", [])

        for article in data:
            all_articles.append({
                "platform": "news",
                "product": product,
                "title": article.get("title", ""),
                "text": article.get("description", ""),
                "source": article.get("source", {}).get("name", ""),
                "published_at": article.get("publishedAt", ""),
                "url": article.get("url", "")
            })

        time.sleep(1)

    except:
        continue

df = pd.DataFrame(all_articles)

if df.empty:
    print(0)
else:
    df = df.drop_duplicates(subset=["title"])
    df = df[df["text"].astype(str).str.len() > 30]

    # 🔹 Ensure folder exists
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    df.to_csv(OUTPUT_PATH, index=False)

    print(len(df))  # 🔥 IMPORTANT: return only number
