import os
from pymongo import MongoClient
import dotenv

script_dir = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(script_dir, '../web/.env.local'))

MONGO_URI = os.getenv('MONGODB_URI')

def list_dbs():
    if not MONGO_URI:
        print("Error: MONGODB_URI not found.")
        return

    client = MongoClient(MONGO_URI)
    print("Databases available:")
    for db_name in client.list_database_names():
        db = client[db_name]
        print(f"- {db_name} (Collections: {db.list_collection_names()})")

if __name__ == "__main__":
    list_dbs()
