import os
import re
import datetime
import time
from pymongo import MongoClient, UpdateOne
from dotenv import load_dotenv

# --- HTML STRIPPING ---
_TAG_RE = re.compile(r'<[^>]+>')

def strip_html(text: str) -> str:
    """Remove HTML tags from a string before regex matching."""
    if not text:
        return ''
    return _TAG_RE.sub(' ', text)

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env.local'))

MONGO_URI = (os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "").strip()
DB_NAME = "test"  # Default to 'test' or 'skillire' based on connection string, usually extracted or set

# --- CONFIGURATION & REGEX PATTERNS ---

# 1. Batch Extraction Patterns
# Current Context: Feb 2026
CURRENT_YEAR = 2026
CURRENT_MONTH = 2

# Explicit Years
YEAR_PATTERN = re.compile(r'\b(202[4-7])\b')

# Relative Terms Mapping
RELATIVE_BATCH_MAPPING = {
    r'\b(final\s*year|last\s*semester)\b': [2026],
    r'\b(pre-?final|3rd\s*year|third\s*year)\b': [2027],
    r'\b(recent\s*graduate|fresher)\b': [2025, 2026],
    r'\b(0-1\s*years?)\b': [2024, 2025]
}

# 2. Tech Stack Dictionary
TECH_STACK_KEYWORDS = {
    # Frontend
    "React": r'\breact\b',
    "Next.js": r'\bnext\.?js\b',
    "Vue": r'\bvue(?:\.js)?\b',
    "Angular": r'\bangular\b',
    "Tailwind": r'\btailwind(?:\s*css)?\b',
    # Backend
    "Node.js": r'\bnode(?:\.js)?\b',
    "Express": r'\bexpress(?:\.js)?\b',
    "Django": r'\bdjango\b',
    "Spring Boot": r'\bspring\s*boot\b',
    "Go": r'\bgolang\b|\bgo\b',
    "FastApi": r'\bfastapi\b',
    # Mobile
    "React Native": r'\breact\s*native\b',
    "Flutter": r'\bflutter\b',
    "Swift": r'\bswift\b',
    "Kotlin": r'\bkotlin\b',
    # DevOps
    "AWS": r'\baws\b|amazon\s*web\s*services',
    "Docker": r'\bdocker\b',
    "Kubernetes": r'\bkubernetes\b|\bk8s\b',
    "CI/CD": r'\bci/?cd\b',
    # Data
    "Python": r'\bpython\b',
    "SQL": r'\bsql\b',
    "Pandas": r'\bpandas\b',
    "ML": r'\bmachine\s*learning\b|\bml\b'
}

# 3. Location Normalization
CITY_MAPPING = {
    "bengaluru": "Bangalore",
    "bangalore urban": "Bangalore",
    "gurugram": "Gurgaon",
    "mumbai city": "Mumbai",
    "new delhi": "Delhi"
}

import requests
import json
import traceback

def process_job_batch_with_groq(jobs_data):
    """
    Accepts an array of job dictionaries and runs a single LLaMA 3.3 inference to extract all of them.
    Returns a strictly formatted JSON array of parsed objects.
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        print("GROQ_API_KEY is missing from environment variables.")
        return []

    system_prompt = """You are an expert tech recruiter AI processing a batch of raw job descriptions.
Your task is to analyze the array of job objects provided and extract structured metadata for each one.
You MUST return ONLY a valid JSON array of objects, strictly adhering to this exact format:

```json
{
  "jobs": [
    {
      "id": "THE_EXACT_ID_PASSED_IN",
      "batch": ["2024", "2025"], 
      "experience": "0-2 Years",
      "job_type": "Full-time",
      "location": "Bangalore",
      "salary_status": "12 LPA",
      "tech_stack": ["React", "Node.js"],
      "skills": ["JavaScript", "TypeScript", "AWS"], 
      "formatted_about": "**Company Overview**: ...\\n\\n* **Position**: ...\\n* **Location**: ...\\n* **Experience**: ...\\n* **Qualification**: ...\\n* **Take Home**: ...\\n\\n**Benefits**: ...\\n\\n**Description**: ..."
    }
  ]
}
```

Critical Rules:
1. "skills" MUST be an array of up to 5 core technical skills. IF NONE EXIST, return ["Communication"]. NEVER REMOVE THE "skills" KEY.
2. "batch" MUST be an array. If no year is mentioned, use ["Any"].
3. Wrap your entire response in the `{"jobs": [...] }` object structure exactly as shown.
"""

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    # Strip unserializable MongoDB ObjectIds before sending to Groq
    clean_jobs_data = []
    for j in jobs_data:
        j_copy = j.copy()
        if "_original_id" in j_copy:
            del j_copy["_original_id"]
        clean_jobs_data.append(j_copy)

    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(clean_jobs_data)}
        ],
        "temperature": 0.1,
        "max_completion_tokens": 8000,
        "response_format": {"type": "json_object"}
    }
    
    # We must wrap the output instruction because json_object requires an object, not an array natively
    payload["messages"][0]["content"] += "\nReturn your JSON array wrapped inside an object with the key 'jobs'."

    from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

    @retry(
        wait=wait_exponential(multiplier=2, min=5, max=60),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type(Exception),
        reraise=True
    )
    def _execute_groq():
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()

    try:
        result = _execute_groq()
        content = result['choices'][0]['message']['content']
        data = json.loads(content)
        return data.get('jobs', [])
        
    except Exception as e:
        print(f"Groq API Error during batch processing (Failed after retries): {e}")
        return []

def _process_batch(collection, jobs_to_process):
    """Enrich a batch of jobs and bulk-write results back to DB."""
    updates = []
    
    # We will bundle valid jobs into chunks to send to the Groq API
    BATCH_LIMIT = 10
    current_chunk = []
    
    # Helper to flush a chunk to the Groq API and map the result
    def flush_chunk():
        if not current_chunk:
            return
            
        print(f"Sending batch of {len(current_chunk)} jobs to Groq... (sleeping 4s to prevent 429 rate limit)")
        time.sleep(4.0)
        extracted_results = process_job_batch_with_groq(current_chunk)
        
        # Map the results back by ID
        result_map = {res.get('id'): res for res in extracted_results if res.get('id')}
        
        for job_payload in current_chunk:
            job_id_str = job_payload['id']
            job_id_obj = job_payload['_original_id']
            
            gemini_data = result_map.get(job_id_str)
            if not gemini_data:
                # API failed or dropped this job
                updates.append(UpdateOne(
                    {"_id": job_id_obj},
                    {"$set": {"is_processed": True, "refinery_error": True, "processed_at": datetime.datetime.utcnow()}}
                ))
                continue
                
            # Parse logic constraint for international
            is_active = True
            if gemini_data.get('location', '') == "International":
                is_active = False

            # Premium Logic Analysis
            is_premium = False
            
            # 1. Salary Check
            salary_str = str(gemini_data.get('salary_status', '')).lower()
            if "lpa" in salary_str:
                nums = re.findall(r'\d+', salary_str)
                if nums and any(int(n) >= 12 for n in nums):
                    is_premium = True
            elif "k" in salary_str and "month" in salary_str:
                nums = re.findall(r'\d+', salary_str)
                if nums and any(int(n) >= 30 for n in nums):
                    is_premium = True
            
            # 2. Top Tier Company
            company = str(job_payload.get('company', '')).lower()
            top_tier = ["google", "microsoft", "amazon", "apple", "meta", "netflix", "uber", "stripe", "atlassian", "adobe", "flipkart", "swiggy", "zomato", "cred", "razorpay"]
            if any(tier in company for tier in top_tier):
                is_premium = True

            # 3. Freshness (< 48h)
            created_at = job_payload.get('created_at')
            if created_at and isinstance(created_at, datetime.datetime):
                age = datetime.datetime.utcnow() - created_at
                if age.total_seconds() < 48 * 3600:
                    is_premium = True
                    
            # 4. Hidden Gems
            tags = job_payload.get('tags', [])
            if any(hq in str(t).lower() for t in tags for hq in ['greenhouse', 'instahyre', 'lever', 'ashby']):
                is_premium = True
                
            processed_data = {
                "batch": gemini_data.get('batch', ["Any"]),
                "tech_stack": gemini_data.get('tech_stack', []),
                "skills": gemini_data.get('skills', []),
                "normalized_location": gemini_data.get('location', 'Unknown'),
                "experience": gemini_data.get('experience', 'Not Disclosed'),
                "job_type": gemini_data.get('job_type', 'Full-time'),
                "salary_status": gemini_data.get('salary_status', 'Not Disclosed'),
                "formatted_about": gemini_data.get('formatted_about', ''),
                "is_active": is_active,
                "is_premium": is_premium,
                "is_processed": True,
                "processed_at": datetime.datetime.utcnow()
            }
            
            # Merge new Batch:YYYY tags into existing tags array
            # We must retrieve existing tags from the DB, but since we don't have the full original job object here,
            # we rely on the caller or just instantiate. For simplicity, we create a fresh tags list.
            new_tags = set()
            for b in processed_data['batch']:
                new_tags.add(f"Batch:{b}")
            processed_data['tags'] = list(new_tags)

            updates.append(UpdateOne(
                {"_id": job_id_obj},
                {"$set": processed_data}
            ))
            
        current_chunk.clear()


    for job in jobs_to_process:
        # Short-circuit if no meaningful description text exists
        raw_data = job.get('raw_data', {})
        text_to_analyze = str(job.get('description', '')).strip()
        
        if not text_to_analyze:
            text_to_analyze = str(
                job.get('raw_snippet') or 
                raw_data.get('snippet') or 
                raw_data.get('raw_snippet') or 
                ""
            )
            
        # Check dictionary descriptions (like Apify/Indeed)
        if not text_to_analyze and isinstance(raw_data.get('description'), dict):
            d = raw_data.get('description')
            text_to_analyze = str(d.get('text') or d.get('html') or "")
        elif not text_to_analyze and isinstance(raw_data.get('description'), str):
            text_to_analyze = str(raw_data.get('description'))

        if not text_to_analyze.strip():
            # Apply defaults using $set so we don't overwrite title/company/apply_link/job_type
            updates.append(UpdateOne(
                {"_id": job["_id"]},
                {"$set": {
                    "is_processed": True,
                    "batch": ["Any"],
                    "salary_status": "Not Disclosed",
                    "processed_at": datetime.datetime.utcnow()
                }}
            ))
            continue

        desc = strip_html(text_to_analyze)
        
        # Add to the current Groq chunk
        current_chunk.append({
            "id": str(job["_id"]),
            "_original_id": job["_id"], # Keep for mongo update mapping
            "title": job.get('title', ''),
            "location": job.get('location', ''),
            "company": job.get('company', ''),
            "created_at": job.get('created_at').isoformat() if isinstance(job.get('created_at'), datetime.datetime) else str(job.get('created_at')),
            "tags": job.get('tags', []),
            "description": desc[:3000] # Cap length to save LLM tokens per job
        })
        
        if len(current_chunk) >= BATCH_LIMIT:
            flush_chunk()
            
    # Flush any remaining jobs
    flush_chunk()

    if updates:
        try:
            result = collection.bulk_write(updates)
            return result.modified_count
        except Exception as e:
            print(f"Bulk write error: {e}")
    return 0


def main():
    if not MONGO_URI:
        print("Error: MONGO_URI not set")
        return
        
    client = MongoClient(MONGO_URI)
    db = client.get_database()
    collection = db.jobs

    query = {"$or": [{"is_processed": False}, {"is_processed": {"$exists": False}}]}
    BATCH_SIZE = 100  # Process up to 100 at a time to avoid memory issues

    total_processed = 0
    round_num = 0

    # Loop until all unprocessed jobs are done (removes the old hard limit of 50)
    while True:
        round_num += 1
        jobs_to_process = list(
            collection.find(query).sort("created_at", -1).limit(BATCH_SIZE)
        )

        if not jobs_to_process:
            break

        print(f"[Round {round_num}] Processing {len(jobs_to_process)} jobs...")
        count = _process_batch(collection, jobs_to_process)
        total_processed += count
        print(f"[Round {round_num}] Modified {count} jobs.")

        # If we got fewer than a full batch, we're done
        if len(jobs_to_process) < BATCH_SIZE:
            break

    if total_processed == 0:
        print("No new jobs to process.")
    else:
        print(f"Done. Total enriched: {total_processed} jobs.")


if __name__ == "__main__":
    main()
