
import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load Env
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')

def test_connection():
    print(f"Testing Connection to: {MONGO_URI.split('@')[1] if '@' in MONGO_URI else 'Localhost'}...")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        # Force a call to check connection
        info = client.server_info()
        print("✅ Connection Successful!")
        print(f"Server Version: {info.get('version')}")
        
        db = client.get_database()
        print(f"Database: {db.name}")
        
        # Check collections
        collections = db.list_collection_names()
        print(f"Collections: {collections}")
        
    except Exception as e:
        print(f"❌ Connection Failed: {e}")

if __name__ == "__main__":
    if not MONGO_URI:
        print("Error: MONGODB_URI not found in .env.local")
    else:
        test_connection()
