"""
MongoDB Index Creation Script
Run once (or whenever the schema changes) to set up optimal indexes.

Usage:
    python web/scripts/create_indexes.py
"""

import os
from pymongo import MongoClient, ASCENDING, DESCENDING, TEXT
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

MONGO_URI = os.getenv('MONGODB_URI') or 'mongodb://localhost:27017/skillhire'


def _make_index(jobs, keys, **kwargs):
    """Create an index, gracefully skipping if it already exists."""
    name = kwargs.get("name", str(keys))
    try:
        jobs.create_index(keys, **kwargs)
        print(f"  ✓ Created: {name}")
    except Exception as e:
        if "already exists" in str(e) or "IndexOptionsConflict" in str(e) or "already have" in str(e):
            print(f"  – Skipped (already exists): {name}")
        else:
            print(f"  ✗ Error creating {name}: {e}")


def create_indexes():
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    jobs = db.jobs

    print("Creating indexes on 'jobs' collection...")

    # 1. Full-text search on title + company (replaces slow $regex scans)
    _make_index(jobs,
        [("title", TEXT), ("company", TEXT)],
        name="text_search",
        default_language="english",
        weights={"title": 10, "company": 5}
    )

    # 2. Primary listing sort + pagination
    _make_index(jobs,
        [("is_active", ASCENDING), ("created_at", DESCENDING)],
        name="active_created_at"
    )

    # 3. Refinery queue — find unprocessed jobs fast
    _make_index(jobs,
        [("is_processed", ASCENDING), ("created_at", ASCENDING)],
        name="refinery_queue"
    )

    # 4. Grad year / batch filter (tags array)
    _make_index(jobs, [("tags", ASCENDING)], name="tags")

    # 5. Location filter
    _make_index(jobs, [("normalized_location", ASCENDING)], name="normalized_location")

    # 6. Work mode filter
    _make_index(jobs, [("work_mode", ASCENDING)], name="work_mode")

    # 7. Job type filter
    _make_index(jobs, [("job_type", ASCENDING)], name="job_type")

    # 8. Dedup: unique source hash
    _make_index(jobs, [("source_hash", ASCENDING)], unique=True, name="source_hash_unique")

    print("\nAll indexes processed.")
    client.close()


if __name__ == "__main__":
    create_indexes()

