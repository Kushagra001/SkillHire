import os
import random
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('../web/.env.local')
db = MongoClient(os.getenv('MONGODB_URI') or os.getenv('MONGO_URI')).get_database()

skills_presets = [
    ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
    ["Python", "Django", "PostgreSQL", "Docker", "Redis"],
    ["Java", "Spring Boot", "Microservices", "Kafka", "MySQL"],
    ["JavaScript", "HTML", "CSS", "TailwindCSS", "Figma"],
    ["Vue.js", "Laravel", "PHP", "Git", "Nginx"],
    ["C++", "Python", "Linux", "Algorithms", "Data Structures"]
]

jobs = db.jobs.find()
for j in jobs:
    db.jobs.update_one(
        {"_id": j["_id"]},
        {"$set": {
            "skills": random.choice(skills_presets),
            "tech_stack": random.choice(skills_presets),
            "batch": ["2024"],
            "salary_status": "12 LPA",
            "is_processed": True 
        }}
    )

print(f"Seeded valid UI blocks into {db.jobs.count_documents({})} jobs.")
