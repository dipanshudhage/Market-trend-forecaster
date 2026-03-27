import os
import requests
import pandas as pd
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

API_KEY = os.getenv("GNEWS_API_KEY")

PRODUCTS = [
    "Amazon Alexa",
    "Google Nest Mini",
    "Apple HomePod Mini"
]

OUTPUT_PATH = "data/processed/news_articles_clean.csv"

all_articles = []

for product in PRODUCTS:
    print(f"Fetching news for: {product}")

    url = "https://gnews.io/api/v4/search"
    params = {
        "q": product,
        "lang": "en",
        "max": 50,
        "apikey": API_KEY
    }

    response = requests.get(url, params=params)

    if response.status_code != 200:
        print("Error:", response.status_code)
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

    time.sleep(2)

df = pd.DataFrame(all_articles)

if df.empty:
    print("No news collected")
else:
    df = df.drop_duplicates(subset=["title"])
    df = df[df["text"].astype(str).str.len() > 30]

    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(df)} news articles to {OUTPUT_PATH}")
