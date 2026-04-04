import os
import pandas as pd
import asyncio
import httpx
import json
from dotenv import load_dotenv

# Load env variables including OPENROUTER_API_KEY
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend/.env"))

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INPUT_FILE = os.path.join(BASE_DIR, "data/processed/all_reviews_clean.csv")
OUTPUT_FILE = os.path.join(BASE_DIR, "data/sentiment_output.csv")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

SYSTEM_PROMPT = """
You are an expert sentiment analyzer.
Analyze the user review and determine its sentiment.
Return ONLY a strictly valid JSON object with the following keys:
- sentiment_label: exactly one of "Positive", "Negative", or "Neutral"
- sentiment_score: a float between -1.0 (extremely negative) and 1.0 (extremely positive), where 0.0 is perfect neutral.

Do NOT return any other text, markdown blocks, or explanation. Just the JSON object.
"""

async def analyze_batch(reviews):
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    # Process up to 5 API calls simultaneously
    semaphore = asyncio.Semaphore(5)
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        async def fetch_sentiment(review):
            async with semaphore:
                data = {
                    "model": "meta-llama/llama-3-8b-instruct",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Review: {review}"}
                    ],
                    "temperature": 0.1
                }
                try:
                    response = await client.post(
                        "https://openrouter.ai/api/v1/chat/completions",
                        headers=headers,
                        json=data
                    )
                    response.raise_for_status()
                    content = response.json()["choices"][0]["message"]["content"]
                    
                    # Clean up JSON formatting if the model responds with markdown blocks
                    content = content.replace("```json", "").replace("```", "").strip()
                    parsed = json.loads(content)
                    return parsed
                except Exception as e:
                    print(f"Failed to analyze review: {e}")
                    return {"sentiment_label": "Neutral", "sentiment_score": 0.0}

        tasks = [fetch_sentiment(r) for r in reviews]
        results = await asyncio.gather(*tasks)
                
    return results

def main():
    if not OPENROUTER_API_KEY:
        print("Error: Missing OPENROUTER_API_KEY in environment variables.")
        return

    if not os.path.exists(INPUT_FILE):
        print(f"Input file not found: {INPUT_FILE}")
        return

    df_in = pd.read_csv(INPUT_FILE)
    if df_in.empty:
        print("No input data to process.")
        return
        
    df_in['text'] = df_in['text'].astype(str)

    # Read output file if it exists
    if os.path.exists(OUTPUT_FILE):
        try:
            # The sentiment file is tab-separated
            df_out = pd.read_csv(OUTPUT_FILE, sep='\t')
            df_out['text'] = df_out['text'].astype(str)
            existing_texts = set(df_out['text'].tolist())
        except Exception as e:
            print(f"Error reading existing sentiment file: {e}")
            existing_texts = set()
    else:
        existing_texts = set()

    # Find completely new reviews
    df_new = df_in[~df_in['text'].isin(existing_texts)].copy()

    if df_new.empty:
        print("No new reviews require sentiment analysis.")
        return

    print(f"Found {len(df_new)} new reviews to analyze.")

    reviews_to_analyze = df_new['text'].tolist()
    
    print("Running batch sentiment analysis via OpenRouter (Llama-3)...")
    results = asyncio.run(analyze_batch(reviews_to_analyze))
    
    labels = [r.get("sentiment_label", "Neutral") for r in results]
    scores = [float(r.get("sentiment_score", 0.0)) for r in results]
    
    df_new['sentiment_label'] = labels
    df_new['sentiment_score'] = scores
    
    # Reorder columns to exactly match sentiment_output.csv
    # Original schema: platform, product, text, sentiment_label, sentiment_score, date
    cols = ['platform', 'product', 'text', 'sentiment_label', 'sentiment_score', 'date']
    # Filter only available columns to prevent key errors
    cols = [c for c in cols if c in df_new.columns]
    df_new = df_new[cols]
    
    # Append to sentiment_output.csv using tabs
    if os.path.exists(OUTPUT_FILE):
        df_new.to_csv(OUTPUT_FILE, mode='a', header=False, index=False, sep='\t')
    else:
        df_new.to_csv(OUTPUT_FILE, index=False, sep='\t')

    print(f"Successfully processed and appended {len(df_new)} reviews to sentiment_output.csv.")

if __name__ == "__main__":
    main()
