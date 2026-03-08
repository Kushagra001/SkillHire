import os
import pymongo
from dotenv import load_dotenv

load_dotenv("web/.env.local")
uri = os.getenv("MONGODB_URI")
client = pymongo.MongoClient(uri)

print("List of Databases:")
for db_name in client.list_database_names():
    print(f"Name: '{db_name}' | Length: {len(db_name)} | Bytes: {list(db_name.encode('utf-8'))}")
