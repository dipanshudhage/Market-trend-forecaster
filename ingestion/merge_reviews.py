import pandas as pd
import random
import os
from datetime import datetime

# 🔥 Absolute path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_FILE = os.path.join(BASE_DIR, "data/processed/all_reviews_clean.csv")


def standardize_date(date_str, platform):
    if platform == "amazon":
        return f"2026-02-{random.randint(1,28):02d}"

    if platform == "news":
        if not date_str or pd.isna(date_str):
            return "2026-03-01"
        return str(date_str)[:10]

    return f"2026-03-{random.randint(1,16):02d}"


# 🔹 SAFE LOAD
def safe_read(filename):
    path = os.path.join(BASE_DIR, filename)

    print(f"Reading: {path}")   # 🔥 DEBUG

    if not os.path.exists(path):
        print(f"File NOT FOUND: {path}")
        return pd.DataFrame()

    try:
        # Check if file has header by reading only 0 rows
        df_header = pd.read_csv(path, nrows=0)
        df = pd.read_csv(path)
        print(f"Loaded {len(df)} rows")
        return df
    except Exception as e:
        print(f"Error reading {path}: {e}")
        return pd.DataFrame()


amazon = safe_read("data/processed/amazon_reviews_clean.csv")
youtube = safe_read("data/processed/youtube_reviews_clean.csv")
web = safe_read("data/processed/web_reviews_scraped.csv")
news = safe_read("data/processed/news_articles_clean.csv")


# 🔹 SAFE COLUMN EXTRACTOR
def get_col(df, col, default=""):
    return df[col] if col in df.columns else [default]*len(df)


# 🔹 STANDARDIZE
def build_df(df, platform, text_col):
    if df.empty:
        return pd.DataFrame()

    text_series = get_col(df, text_col, "").astype(str)

    return pd.DataFrame({
        "platform": platform,
        "product": get_col(df, "product", ""),
        "text": text_series,
        "date": [standardize_date(None, platform) for _ in range(len(df))]
    })


amazon_std = build_df(amazon, "amazon", "review_content")
youtube_std = build_df(youtube, "youtube", "text")
web_std = build_df(web, "web", "review_content")
news_std = build_df(news, "news", "text")


# 🔹 MERGE
all_dfs = [df for df in [amazon_std, youtube_std, web_std, news_std] if not df.empty]

if not all_dfs:
    print(0)
    exit()

merged = pd.concat(all_dfs, ignore_index=True)


# 🔹 CLEAN (SAFE)
merged["text"] = merged["text"].astype(str)
merged["date"] = datetime.today().strftime("%Y-%m-%d")
merged = merged.drop_duplicates(subset=["text", "platform"])
merged = merged[merged["text"].str.len() > 20]


# 🔥 APPEND + COUNT

if os.path.exists(OUTPUT_FILE):
    try:
        existing = pd.read_csv(OUTPUT_FILE)
        combined = pd.concat([existing, merged], ignore_index=True)
        combined = combined.drop_duplicates(subset=["text", "platform"])
        added_count = len(combined) - len(existing)
        combined.to_csv(OUTPUT_FILE, index=False)
        print(max(added_count, 0))
    except Exception as e:
        # If file is corrupted or headerless, overwrite it correctly
        merged.to_csv(OUTPUT_FILE, index=False)
        print(len(merged))

else:
    merged.to_csv(OUTPUT_FILE, index=False)
    print(len(merged))
