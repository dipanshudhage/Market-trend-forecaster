import os
import requests
import pandas as pd
import time
from dotenv import load_dotenv

load_dotenv(dotenv_path="backend/.env")

API_KEY = os.getenv("YOUTUBE_API_KEY")

PRODUCT_QUERIES = [
    "Google Nest Mini review",
    "Apple HomePod Mini review"
]

OUTPUT_PATH = "data/processed/youtube_reviews_clean.csv"


def search_videos(query, max_results=5):
    url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "key": API_KEY
    }
    r = requests.get(url, params=params)
    data = r.json()
    videos = []

    for item in data.get("items", []):
        videos.append({
            "video_id": item["id"]["videoId"],
            "title": item["snippet"]["title"]
        })

    return videos


def get_comments(video_id, max_comments=100):
    url = "https://www.googleapis.com/youtube/v3/commentThreads"
    params = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": 100,
        "key": API_KEY,
        "textFormat": "plainText"
    }

    comments = []
    r = requests.get(url, params=params)
    data = r.json()

    for item in data.get("items", []):
        text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
        comments.append(text)

    return comments


all_rows = []

for query in PRODUCT_QUERIES:
    print(f"Searching videos for: {query}")
    videos = search_videos(query)

    product = "Google Nest Mini" if "Nest" in query else "Apple HomePod Mini"

    for v in videos:
        print("Fetching comments from:", v["title"])
        comments = get_comments(v["video_id"])

        for c in comments:
            if len(c) > 20:
                all_rows.append({
                    "platform": "youtube",
                    "product": product,
                    "title": v["title"],
                    "text": c
                })

        time.sleep(1)

df = pd.DataFrame(all_rows)

if df.empty:
    print("No YouTube comments collected")
else:
    df = df.drop_duplicates(subset=["text"])
    df.to_csv(OUTPUT_PATH, index=False)
    print(f"Saved {len(df)} YouTube reviews to {OUTPUT_PATH}")
