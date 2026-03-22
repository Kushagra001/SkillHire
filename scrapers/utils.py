import re
import hashlib
from datetime import datetime, timedelta
import random
import urllib.parse

# Canonical Values
EXP_RANGES = ["0-2 Years", "2-5 Years", "5+ Years", "Fresher"]
JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract", "Remote", "Hybrid"]

def normalize_experience(exp_text, job_title=""):
    """
    Standardizes experience strings into SkillHire canonical values.
    """
    if not exp_text:
        # Fallback to title keywords if text is missing
        title_lower = (job_title or "").lower()
        if any(x in title_lower for x in ["intern", "fresher", "new grad", "trainee", "entry"]):
            return "Fresher"
        return "Not Specified"

    text = str(exp_text).lower().strip()
    
    # Direct mappings
    if any(x in text for x in ["fresher", "0 years", "0-0", "no experience", "entry level"]):
        return "Fresher"
    
    # Regex extraction
    # Matches: "2-5 years", "3 years", "5+ yrs", "2 to 4 years"
    match = re.search(r'(\d+)\+?\s*(?:to|-|–)?\s*(\d+)?\s*(?:years?|yrs?|yr)', text)
    if match:
        min_y = int(match.group(1))
        max_y = int(match.group(2)) if match.group(2) else None
        
        if min_y == 0 and (max_y is None or max_y <= 1):
            return "Fresher"
        if min_y < 2:
            return "0-2 Years"
        if min_y < 5:
            return "2-5 Years"
        return "5+ Years"

    return "0-2 Years" # Default for tech hub scrapers if it looks entry-level

def normalize_job_type(type_text, job_title=""):
    """
    Standardizes job types into SkillHire canonical values.
    """
    text = str(type_text or "").lower().replace("_", " ").replace("-", " ").strip()
    title_lower = (job_title or "").lower()

    if "intern" in text or "intern" in title_lower:
        return "Internship"
    if "part time" in text:
        return "Part-time"
    if "contract" in text or "freelance" in text or "temporary" in text:
        return "Contract"
    if "remote" in text:
        return "Remote"
    if "hybrid" in text:
        return "Hybrid"
    
    return "Full-time"

def get_logo(company_name):
    """
    Returns None — logo resolution is handled at the API/display layer.
    Previously this returned a ui-avatars.com URL, but storing placeholder logos
    in the DB made it impossible to distinguish 'real logo' from 'no logo'.
    The frontend chains: stored logo → logo.dev (by domain) → ui-avatars fallback.
    """
    return None

def generate_source_hash(prefix, title, company, location):
    """
    Generates a consistent deterministic hash for deduplication.
    """
    clean_title = re.sub(r'\W+', '', (title or "").lower())
    clean_company = re.sub(r'\W+', '', (company or "").lower())
    clean_loc = re.sub(r'\W+', '', (location or "remote").lower())
    
    dedupe_str = f"{clean_title}{clean_company}{clean_loc}"
    link_hash = hashlib.md5(dedupe_str.encode('utf-8')).hexdigest()
    return f"{prefix}_{link_hash}"

def get_random_created_at():
    """
    Returns a UTC datetime slightly in the past for realistic jitter.
    """
    return datetime.utcnow() - timedelta(minutes=random.randint(5, 120))
