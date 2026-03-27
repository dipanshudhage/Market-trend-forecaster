import pandas as pd
import os

# Load Alexa TSV dataset
df = pd.read_csv("data/raw/amazon_alexa.tsv", sep="\t")

# Rename columns to normalized schema
df_clean = pd.DataFrame({
    "product": "Amazon Alexa / Echo",
    "review_content": df["verified_reviews"].str.lower().str.strip(),
    "rating": df["rating"],
    "review_date": df["date"],
    "variant": df["variation"],
    "source": "kaggle_amazon_alexa"
})

# Drop empty reviews
df_clean = df_clean.dropna(subset=["review_content"])

# Ensure output directory exists
os.makedirs("data/processed", exist_ok=True)

# Save cleaned data
output_path = "data/processed/amazon_reviews_clean.csv"
df_clean.to_csv(output_path, index=False)

print(f"Saved {len(df_clean)} Alexa reviews to {output_path}")
