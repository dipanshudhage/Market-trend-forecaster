import pandas as pd
from datetime import datetime, timedelta
import random

def standardize_date(date_str, platform):
    """Modernize old dates and assign defaults for missing ones to create a continuous demo timeline."""
    target_date = datetime(2026, 3, 16) # Current "Now" for demo
    
    if platform == "amazon":
        # Amazon Alexa data is from 2018. Shift it to Feb 2026 for a "Previous Month" look.
        # Original format: 31-Jul-18
        try:
            # We'll spread these across February 2026
            day = random.randint(1, 28)
            return f"2026-02-{day:02d}"
        except:
            return "2026-02-15"
            
    if platform == "news":
        # News already has 2026-02-12T14:04:48Z, just clean it
        if not date_str or pd.isna(date_str):
            return "2026-03-01"
        return str(date_str)[:10]

    # For YouTube and Web (currently missing dates in merged input), spread them across March 2026
    day = random.randint(1, 16)
    return f"2026-03-{day:02d}"

# Load raw processed files
amazon = pd.read_csv("data/processed/amazon_reviews_clean.csv")
youtube = pd.read_csv("data/processed/youtube_reviews_clean.csv")
web = pd.read_csv("data/processed/web_reviews_scraped.csv")
# Also include news if available (it was missing from original merge_reviews.py)
try:
    news = pd.read_csv("data/processed/news_articles_clean.csv")
except:
    news = pd.DataFrame()

# Standardize Amazon
amazon_std = pd.DataFrame({
    "platform": "amazon",
    "product": amazon["product"],
    "text": amazon["review_content"],
    "date": [standardize_date(d, "amazon") for d in amazon.get("review_date", [None]*len(amazon))]
})

# Standardize Youtube
youtube_std = pd.DataFrame({
    "platform": "youtube",
    "product": youtube["product"],
    "text": youtube["text"],
    "date": [standardize_date(None, "youtube") for _ in range(len(youtube))]
})

# Standardize Web
web_std = pd.DataFrame({
    "platform": "web",
    "product": web["product"],
    "text": web["review_content"],
    "date": [standardize_date(None, "web") for _ in range(len(web))]
})

# Standardize News
news_std = pd.DataFrame()
if not news.empty:
    news_std = pd.DataFrame({
        "platform": "news",
        "product": news["product"],
        "text": news["text"],
        "date": [standardize_date(d, "news") for d in news.get("published_at", [None]*len(news))]
    })

# Merge everything
all_dfs = [amazon_std, youtube_std, web_std]
if not news_std.empty:
    all_dfs.append(news_std)

merged = pd.concat(all_dfs, ignore_index=True)

merged = merged.drop_duplicates(subset=["text"])
merged = merged[merged["text"].astype(str).str.len() > 20]

# Filter out rows where date is the column header or invalid
merged = merged[~merged["date"].str.contains("published_at|date", case=False, na=False)]

merged.to_csv("data/processed/all_reviews_clean.csv", index=False)

print(f"Saved {len(merged)} total reviews with date metadata to data/processed/all_reviews_clean.csv")
