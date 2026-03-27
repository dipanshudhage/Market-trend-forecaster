import asyncio
import pandas as pd
import re
from crawl4ai import AsyncWebCrawler, CrawlerRunConfig, CacheMode
from crawl4ai.extraction_strategy import LLMExtractionStrategy # For future use
import os

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
    
    async with AsyncWebCrawler(verbose=True) as crawler:
        for product, url in products.items():
            print(f"Crawling: {product} from {url}")
            
            # Simple crawl without LLM for now, focusing on markdown extraction
            result = await crawler.arun(
                url=url,
                config=CrawlerRunConfig(
                    cache_mode=CacheMode.BYPASS
                )
            )
            
            if result.success:
                # Crawl4AI provides cleaned markdown by default
                content = result.markdown
                # Break into paragraphs or sentences for our schema
                # This is a simple heuristic: split by double newlines or single newlines
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
            else:
                print(f"Failed to crawl {product}: {result.error_message}")

    if all_reviews:
        df = pd.DataFrame(all_reviews)
        os.makedirs("data/processed", exist_ok=True)
        output_path = "data/processed/web_reviews_scraped.csv"
        df.to_csv(output_path, index=False)
        print(f"Saved {len(df)} crawl4ai reviews to {output_path}")
    else:
        print("No reviews crawled.")

if __name__ == "__main__":
    asyncio.run(crawl_reviews())
