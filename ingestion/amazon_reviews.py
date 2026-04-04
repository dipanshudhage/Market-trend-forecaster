import pandas as pd
import os

# 🔥 Absolute base path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 🔹 Input file path
input_path = os.path.join(BASE_DIR, "data/raw/amazon_alexa.tsv")

# 🔹 Output path
output_dir = os.path.join(BASE_DIR, "data/processed")
output_path = os.path.join(output_dir, "amazon_reviews_clean.csv")

# 🔹 Check file exists
if not os.path.exists(input_path):
    print(0)
    exit()

# 🔹 Load dataset
df = pd.read_csv(input_path, sep="\t")

# 🔹 Clean data
df_clean = pd.DataFrame({
    "product": "Amazon Alexa / Echo",
    "review_content": df["verified_reviews"].astype(str).str.lower().str.strip(),
    "rating": df["rating"],
    "review_date": df["date"],
    "variant": df["variation"],
    "source": "amazon"
})

# 🔹 Remove empty reviews
df_clean = df_clean.dropna(subset=["review_content"])
df_clean = df_clean[df_clean["review_content"].str.strip() != ""]

# 🔥 IMPORTANT: limit rows (for balanced multi-source data)
if len(df_clean) > 300:
    df_clean = df_clean.sample(n=300, random_state=42)

# 🔹 Ensure output folder exists
os.makedirs(output_dir, exist_ok=True)

# 🔹 Save file
df_clean.to_csv(output_path, index=False)

# 🔥 Return count (for backend)
print(len(df_clean))
