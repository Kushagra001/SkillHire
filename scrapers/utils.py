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

# --- Premium Job Evaluation Logic ---

PREMIUM_COMPANIES = {
    "google", "microsoft", "amazon", "apple", "meta", "netflix", 
    "uber", "airbnb", "stripe", "atlassian", "razorpay", "cred", 
    "swiggy", "zomato", "flipkart", "phonepe", "paytm", "postman",
    "browserstack", "browser stack", "coinbase", "rubrik", "snowflake",
    "databricks", "openai", "anthropic"
}

HYPE_ROLES = [
    "ai", "artificial intelligence", "ml", "machine learning", 
    "deep learning", "nlp", "llm", "generative ai", "genai", "gen-ai",
    "data scientist", "web3", "blockchain", "smart contract",
    "site reliability", "sre", "devops", "platform engineer",
    "staff engineer", "principal engineer", "architect"
]

HIGH_PAY_KEYWORDS = [
    "30lpa", "40lpa", "50lpa", "60lpa", "100k", "150k", "200k", "competitive ctc",
    "highly competitive", "esop", "equity", "stock options"
]

def evaluate_premium_status(job_doc):
    """
    Evaluates a job dictionary and returns True if it meets premium criteria,
    otherwise returns False.
    Criteria:
    1. Belongs to a top tech giant or unicorn.
    2. Is a 100% remote role.
    3. Mentions high salary or equity.
    4. Is a highly sought-after hype role (AI/ML/Web3/etc.).
    """
    title = str(job_doc.get("title") or "").lower()
    company = str(job_doc.get("company") or "").lower().strip()
    location = str(job_doc.get("location") or "").lower()
    desc = str(job_doc.get("description") or "").lower()
    salary = str(job_doc.get("salary_status") or "").lower()

    # 1. Tech Giants
    if company in PREMIUM_COMPANIES or any(c in company for c in PREMIUM_COMPANIES if len(c) > 4):
        return True
    
    # 2. Remote Roles
    if "remote" in location or "remote" in title:
        return True
    
    # 3. High Salary / Equity
    combined_pay_text = f"{title} {desc} {salary}"
    if any(keyword in combined_pay_text for keyword in HIGH_PAY_KEYWORDS):
        return True
    
    # 4. Hype Roles
    if any(role in title for role in HYPE_ROLES) or "ai" in title.split():
        return True

    return False
