import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

if not MONGODB_URL:
    raise Exception("MONGODB_URL is not set")

client = AsyncIOMotorClient(MONGODB_URL)

# DATABASE
database = client["market_trend_db"]

# COLLECTIONS (IMPORTANT)
users_collection = database["users"]
raw_data_collection = database["raw_data"]
