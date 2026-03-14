"""
normalize_job_fields.py — Job Data Normalization Script
========================================================
Fixes misbehaving scraped job data in MongoDB by normalizing
`experience` and `job_type` fields to standard values that
the frontend filter system expects.

Run this script:
    python scripts/normalize_job_fields.py

Environment:
    Requires MONGODB_URI in .env (same as the main app).
"""

import os
import re
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection

# ─── Config ────────────────────────────────────────────────────────────────────
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "skillhire")
COLLECTION_NAME = "jobs"

# ─── Normalization Rules ────────────────────────────────────────────────────────

EXPERIENCE_RULES = [
    # (pattern, canonical_value)
    (re.compile(r'\b(0|zero|no|fresher|entry[\s\-]?level|fresh\s*graduate)\b', re.I), "0-2 Years"),
    (re.compile(r'\b(0[\s\-]?to[\s\-]?1|0[\s\-]?–[\s\-]?1|0[\s\-]?\+|0\s*year|less\s+than\s+1)\b', re.I), "0-2 Years"),
    (re.compile(r'\b(1[\s\-]?to[\s\-]?2|1[\s\-]?–[\s\-]?2|1\s*year|2\s*year)\b', re.I), "0-2 Years"),
    (re.compile(r'\b(2[\s\-]?to[\s\-]?3|2[\s\-]?–[\s\-]?3|3\s*year)\b', re.I), "2-5 Years"),
    (re.compile(r'\b(3[\s\-]?to[\s\-]?5|4\s*year|5\s*year|mid[\s\-]?level)\b', re.I), "2-5 Years"),
    (re.compile(r'\b(5\+|5[\s\-]?to[\s\-]?8|6|7|8\s*year|senior)\b', re.I), "5+ Years"),
    (re.compile(r'\b(8\+|10\+|lead|principal|director|vp)\b', re.I), "5+ Years"),
]

JOB_TYPE_RULES = [
    # (pattern, canonical_value)
    (re.compile(r'\b(intern|internship|trainee|apprentice|co[\s\-]?op)\b', re.I), "Internship"),
    (re.compile(r'\b(full[\s\-]?time|fulltime|permanent|regular|ft\b)\b', re.I), "Full-time"),
    (re.compile(r'\b(part[\s\-]?time|parttime|pt\b)\b', re.I), "Part-time"),
    (re.compile(r'\b(contract|freelance|consultant|fixed[\s\-]?term|c2h)\b', re.I), "Contract"),
    (re.compile(r'\b(remote|wfh|work[\s\-]?from[\s\-]?home)\b', re.I), "Remote"),
    (re.compile(r'\b(hybrid)\b', re.I), "Hybrid"),
]

KNOWN_EXPERIENCE_VALUES = {"0-2 Years", "2-5 Years", "5+ Years", "Fresher", "Entry Level"}
KNOWN_JOB_TYPE_VALUES = {"Full-time", "Part-time", "Internship", "Contract", "Remote", "Hybrid"}


def normalize_experience(raw: str) -> str | None:
    """Map a raw experience string to a canonical value, or None if already canonical."""
    if not raw or raw in KNOWN_EXPERIENCE_VALUES:
        return None  # Already normalized, skip
    for pattern, canonical in EXPERIENCE_RULES:
        if pattern.search(raw):
            return canonical
    return None  # Can't normalize — leave as-is


def normalize_job_type(raw: str) -> str | None:
    """Map a raw job_type string to a canonical value, or None if already canonical."""
    if not raw or raw in KNOWN_JOB_TYPE_VALUES:
        return None  # Already normalized, skip
    for pattern, canonical in JOB_TYPE_RULES:
        if pattern.search(raw):
            return canonical
    return None  # Can't normalize — leave as-is


def run_normalization(collection: Collection, dry_run: bool = False) -> dict:
    """Run normalization on all jobs. Returns stats."""
    stats = {
        "scanned": 0,
        "experience_updated": 0,
        "job_type_updated": 0,
        "errors": 0,
    }

    # Only process jobs where these fields might be non-standard
    cursor = collection.find(
        {"is_active": True},
        {"_id": 1, "experience": 1, "job_type": 1, "title": 1}
    )

    for doc in cursor:
        stats["scanned"] += 1
        updates = {}

        # Normalize experience
        raw_exp = doc.get("experience", "")
        if raw_exp:
            canonical_exp = normalize_experience(raw_exp)
            if canonical_exp:
                updates["experience"] = canonical_exp
                stats["experience_updated"] += 1
                title_safe = doc.get('title', '?')[:60].encode('ascii', 'ignore').decode('ascii')
                print(f"  [experience] '{raw_exp}' -> '{canonical_exp}'  ({title_safe})")

        # Normalize job_type
        raw_type = doc.get("job_type", "")
        if raw_type:
            canonical_type = normalize_job_type(raw_type)
            if canonical_type:
                updates["job_type"] = canonical_type
                stats["job_type_updated"] += 1
                title_safe = doc.get('title', '?')[:60].encode('ascii', 'ignore').decode('ascii')
                print(f"  [job_type]   '{raw_type}' -> '{canonical_type}'  ({title_safe})")

        # Apply update
        if updates and not dry_run:
            try:
                collection.update_one({"_id": doc["_id"]}, {"$set": updates})
            except Exception as e:
                print(f"  [ERROR] Failed to update {doc['_id']}: {e}", file=sys.stderr)
                stats["errors"] += 1

    return stats


def main():
    # Allow --dry-run flag to preview changes without writing
    dry_run = "--dry-run" in sys.argv
    if dry_run:
        print("=== DRY RUN MODE — No changes will be written ===\n")

    if not MONGODB_URI:
        print("ERROR: MONGODB_URI not set in .env", file=sys.stderr)
        sys.exit(1)

    print(f"Connecting to MongoDB ({DB_NAME}/{COLLECTION_NAME})...")
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]

    print("Starting normalization...\n")
    stats = run_normalization(collection, dry_run=dry_run)

    print("\n=== NORMALIZATION COMPLETE ===")
    print(f"  Jobs scanned:           {stats['scanned']}")
    print(f"  Experience updated:     {stats['experience_updated']}")
    print(f"  Job type updated:       {stats['job_type_updated']}")
    print(f"  Errors:                 {stats['errors']}")
    if dry_run:
        print("\n[DRY RUN] No changes were committed. Remove --dry-run to apply.")

    client.close()


if __name__ == "__main__":
    main()
