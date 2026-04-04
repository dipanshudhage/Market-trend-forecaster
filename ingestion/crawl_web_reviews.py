import asyncio
import pandas as pd
import re
import os
import warnings

warnings.filterwarnings("ignore")

# 🔥 SAFE IMPORT
try:
    from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
except ImportError:
    import sys
    print(
        "ERROR: 'crawl4ai' is not installed in the current Python environment.\n"
        f"Active interpreter: {sys.executable}\n\n"
        "Fix: Activate the project virtual environment before running this script:\n"
        "  source /home/prakhar/Market-trend-forecaster/venv/bin/activate\n"
        "  python ingestion/crawl_web_reviews.py\n\n"
        "Or run directly with the venv interpreter:\n"
        "  /home/prakhar/Market-trend-forecaster/venv/bin/python3 ingestion/crawl_web_reviews.py"
    )
    print(0)
    exit(1)

# 🔥 PATH FIX
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "data/processed")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "web_reviews_scraped.csv")

products = {
    "Google Nest Mini": "https://www.techradar.com/reviews/google-nest-mini",
    "Apple HomePod Mini": "https://www.techradar.com/reviews/apple-homepod-mini",
    "Amazon Alexa": "https://www.techradar.com/reviews/amazon-echo-dot"
}


def clean_text(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r"[^\w\s]", "", text)
    return text.strip()


async def crawl_reviews():
    all_reviews = []

    try:
        async with AsyncWebCrawler(verbose=False) as crawler:
            for product, url in products.items():
                try:
                    result = await crawler.arun(
                        url=url,
                        config=CrawlerRunConfig(cache_mode=CacheMode.BYPASS)
                    )

                    if result.success:
                        content = result.markdown
                        paragraphs = content.split("\n")

                        for p in paragraphs:
                            text = p.strip()
                            if len(text) > 60:
                                all_reviews.append({
                                    "product": product,
                                    "review_content": clean_text(text),
                                    "rating": None,
                                    "review_date": None,
                                    "variant": None,
                                    "source": "crawl4ai_techradar"
                                })
                except:
                    continue

    except:
        print(0)
        return

    if all_reviews:
        df = pd.DataFrame(all_reviews)

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        df.to_csv(OUTPUT_PATH, index=False)

        print(len(df))
    else:
        print(0)


# 🔥 SAFE ASYNC RUN (NO ERROR)
if __name__ == "__main__":
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            loop.create_task(crawl_reviews())
        else:
            loop.run_until_complete(crawl_reviews())
    except RuntimeError:
        asyncio.run(crawl_reviews())
