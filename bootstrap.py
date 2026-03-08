#!/usr/bin/env python3
"""
Agentic Framework Bootstrap Script
Run this script in a new directory to set up the 3-Layer Agentic Architecture.
"""

import os
import sys

# Embedded content for the Skill Importer (execution/load_skill.py)
LOAD_SKILL_PY = r'''#!/usr/bin/env python3
import os
import argparse
import subprocess
import shutil
import logging
import stat
from urllib.parse import urlparse

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def setup_directories():
    """Ensure necessary directories exist."""
    base_dir = os.getcwd()
    tmp_dir = os.path.join(base_dir, ".tmp", "skill_importer")
    execution_dir = os.path.join(base_dir, "execution")
    directives_dir = os.path.join(base_dir, "directives")
    
    os.makedirs(tmp_dir, exist_ok=True)
    os.makedirs(execution_dir, exist_ok=True)
    os.makedirs(directives_dir, exist_ok=True)
    
    return base_dir, tmp_dir, execution_dir, directives_dir

def parse_github_url(url):
    """Parses a GitHub URL into repo, branch, and subpath."""
    parsed = urlparse(url)
    path_parts = parsed.path.strip("/").split("/")
    
    if len(path_parts) < 2:
        raise ValueError("Invalid GitHub URL. Must include owner and repo.")
        
    owner = path_parts[0]
    repo = path_parts[1]
    
    # Check if it's a subfolder link (contains /tree/branch/subpath)
    if len(path_parts) > 4 and path_parts[2] == "tree":
        branch = path_parts[3]
        subpath = "/".join(path_parts[4:])
    else:
        branch = "main" # Default branch assumption
        subpath = ""
        
    return f"https://github.com/{owner}/{repo}.git", branch, subpath, repo

def on_rm_error(func, path, exc_info):
    """
    Error handler for shutil.rmtree.
    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.
    """
    os.chmod(path, stat.S_IWRITE)
    os.unlink(path)

def clone_and_extract(repo_url, branch, subpath, skill_name, tmp_dir, execution_dir, directives_dir):
    """Clones repo (shallow) and extracts the skill."""
    clone_dir = os.path.join(tmp_dir, skill_name)
    
    # Clean previous attempts
    if os.path.exists(clone_dir):
        shutil.rmtree(clone_dir, onerror=on_rm_error)
        
    logging.info(f"Cloning {repo_url} (branch: {branch})...")
    
    try:
        # Shallow clone specific branch
        cmd = ["git", "clone", "--depth", "1", "--branch", branch, repo_url, clone_dir]
        subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        # Locate the skill source
        source_path = os.path.join(clone_dir, subpath)
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"Subpath '{subpath}' not found in repo.")
            
        logging.info(f"Skill found at {source_path}")
        
        # 1. Look for core instruction file (SKILL.md, README.md, or similar)
        instruction_file = None
        for name in ["SKILL.md", "README.md", "instruction.md"]:
            if os.path.exists(os.path.join(source_path, name)):
                instruction_file = os.path.join(source_path, name)
                break
        
        if instruction_file:
            target_directive = os.path.join(directives_dir, f"{skill_name}.md")
            shutil.copy(instruction_file, target_directive)
            logging.info(f"Created Directive: {target_directive}")
        else:
            logging.warning("No instruction file (SKILL.md/README.md) found. Creating placeholder.")
            with open(os.path.join(directives_dir, f"{skill_name}.md"), "w") as f:
                f.write(f"# Skill: {skill_name}\n\nImported from {repo_url}\n\nNo specific instructions found.")

        # 2. Copy Execution Code
        target_execution_path = os.path.join(execution_dir, skill_name)
        if os.path.exists(target_execution_path):
            shutil.rmtree(target_execution_path, onerror=on_rm_error)
        
        shutil.copytree(source_path, target_execution_path)
        logging.info(f"Copied execution code to: {target_execution_path}")
        
        return True

    except subprocess.CalledProcessError as e:
        logging.error(f"Git clone failed: {e}")
        return False
    except Exception as e:
        import traceback
        logging.error(f"Critical error: {e}")
        return False
    finally:
        # Cleanup
        if os.path.exists(clone_dir):
            shutil.rmtree(clone_dir, onerror=on_rm_error)

def main():
    parser = argparse.ArgumentParser(description="Skill Importer for Agentic Framework")
    parser.add_argument("url", help="GitHub URL of the skill folder")
    parser.add_argument("--name", help="Custom name for the skill (optional)")
    
    args = parser.parse_args()
    
    base_dir, tmp_dir, execution_dir, directives_dir = setup_directories()
    
    try:
        repo_url, branch, subpath, repo_name = parse_github_url(args.url)
        
        # Determine skill name
        if args.name:
            skill_name = args.name
        elif subpath:
            skill_name = os.path.basename(subpath)
        else:
            skill_name = repo_name
            
        logging.info(f"Importing skill '{skill_name}'...")
        
        success = clone_and_extract(repo_url, branch, subpath, skill_name, tmp_dir, execution_dir, directives_dir)
        
        if success:
            print(f"\nSUCCESS: Skill '{skill_name}' imported.")
            print(f"- Directive: directives/{skill_name}.md")
            print(f"- Execution: execution/{skill_name}/")
        else:
            print("\nFAILURE: Could not import skill.")
            
    except Exception as e:
        logging.error(f"Critical error: {e}")

if __name__ == "__main__":
    main()
'''

# Embedded content for the Skill Importer Directive
LOAD_SKILL_MD = """# Directive: Import New Capability (Skill)

**Goal**: Extend the agent's capabilities by importing a "Skill" (code + instructions) from a GitHub repository.

## Inputs
- **GitHub URL**: The URL to the folder containing the skill (e.g., `https://github.com/anthropics/skills/tree/main/skills/docx`).
- **Skill Name** (Optional): A short name for the skill.

## Process
1. **Identify the Skill**: 
   - Locate the skill URL from `AgentSkills.md` or web research.
   
2. **Run Importer**:
   - Execute the importer script:
     ```bash
     python execution/load_skill.py <GITHUB_URL> --name <OPTIONAL_NAME>
     ```

3. **Verify Import**:
   - Check `directives/` for the new `.md` file.
   - Check `execution/` for the new code folder.
   
4. **Configuration**:
   - Open the new directive in `directives/` and read it.
   - Install any `requirements.txt` found in `execution/<skill_name>/`.
     ```bash
     pip install -r execution/<skill_name>/requirements.txt
     ```
   - Add any required API keys to `.env`.

## Tools
- `execution/load_skill.py`
"""

# Embedded content for Agents.md
AGENTS_MD = r'''# Agent Instructions

> This file is mirrored across CLAUDE.md, AGENTS.md, and GEMINI.md so the same instructions load in any AI environment.

You operate within a 3-layer architecture that separates concerns to maximize reliability. LLMs are probabilistic, whereas most business logic is deterministic and requires consistency. This system fixes that mismatch.

## The 3-Layer Architecture

**Layer 1: Directive (What to do)**
- Basically just SOPs written in Markdown, live in `directives/`
- Define the goals, inputs, tools/scripts to use, outputs, and edge cases
- Natural language instructions, like you'd give a mid-level employee

**Layer 2: Orchestration (Decision making)**
- This is you. Your job: intelligent routing.
- Read directives, call execution tools in the right order, handle errors, ask for clarification, update directives with learnings
- You're the glue between intent and execution. E.g you don't try scraping websites yourself—you read `directives/scrape_website.md` and come up with inputs/outputs and then run `execution/scrape_single_site.py`

**Layer 3: Execution (Doing the work)**
- Deterministic Python scripts in `execution/`
- Environment variables, api tokens, etc are stored in `.env`
- Handle API calls, data processing, file operations, database interactions
- Reliable, testable, fast. Use scripts instead of manual work. Commented well.

**Why this works:** if you do everything yourself, errors compound. 90% accuracy per step = 59% success over 5 steps. The solution is push complexity into deterministic code. That way you just focus on decision-making.

## Operating Principles

**1. Check for tools first**
Before writing a script, check `execution/` per your directive. Only create new scripts if none exist.

**2. Self-anneal when things break**
- Read error message and stack trace
- Fix the script and test it again (unless it uses paid tokens/credits/etc—in which case you check w user first)
- Update the directive with what you learned (API limits, timing, edge cases)
- Example: you hit an API rate limit → you then look into API → find a batch endpoint that would fix → rewrite script to accommodate → test → update directive.

**3. Update directives as you learn**
Directives are living documents. When you discover API constraints, better approaches, common errors, or timing expectations—update the directive. But don't create or overwrite directives without asking unless explicitly told to. Directives are your instruction set and must be preserved (and improved upon over time, not extemporaneously used and then discarded).

## Self-annealing loop

Errors are learning opportunities. When something breaks:
1. Fix it
2. Update the tool
3. Test tool, make sure it works
4. Update directive to include new flow
5. System is now stronger

## File Organization

**Deliverables vs Intermediates:**
- **Deliverables**: Google Sheets, Google Slides, or other cloud-based outputs that the user can access
- **Intermediates**: Temporary files needed during processing

**Directory structure:**
- `.tmp/` - All intermediate files (dossiers, scraped data, temp exports). Never commit, always regenerated.
- `execution/` - Python scripts (the deterministic tools)
- `directives/` - SOPs in Markdown (the instruction set)
- `.env` - Environment variables and API keys
- `credentials.json`, `token.json` - Google OAuth credentials (required files, in `.gitignore`)

**Key principle:** Local files are only for processing. Deliverables live in cloud services (Google Sheets, Slides, etc.) where the user can access them. Everything in `.tmp/` can be deleted and regenerated.

## Summary

You sit between human intent (directives) and deterministic execution (Python scripts). Read instructions, make decisions, call tools, handle errors, continuously improve the system.

Be pragmatic. Be reliable. Self-anneal.
'''

def create_file(path, content):
    print(f"Creating {path}...")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    print("Bootstrapping Agentic Framework...")
    
    # 0. Create Agents.md (Instructions)
    create_file("Agents.md", AGENTS_MD)

    # 1. Create Directory Structure
    dirs = ["directives", "execution", ".tmp"]
    for d in dirs:
        os.makedirs(d, exist_ok=True)
        print(f"Checked directory: {d}/")

    # 2. Create .gitignore
    gitignore_path = ".gitignore"
    if not os.path.exists(gitignore_path):
        create_file(gitignore_path, ".tmp/\n.env\n__pycache__/\n*.pyc\n")
    
    # 3. Create .env.example
    env_example_path = ".env.example"
    if not os.path.exists(env_example_path):
        create_file(env_example_path, "# Add your API keys here\nOPENAI_API_KEY=\nANTHROPIC_API_KEY=\n")

    # 4. Create Skill Importer Script
    load_skill_path = os.path.join("execution", "load_skill.py")
    create_file(load_skill_path, LOAD_SKILL_PY)
    
    # 5. Create Skill Importer Directive
    load_skill_md_path = os.path.join("directives", "load_skill.md")
    create_file(load_skill_md_path, LOAD_SKILL_MD)

    print("\n--- Setup Complete ---")
    print("Your agentic framework is ready.")
    print("Files created:")
    print("  - Agents.md (Core instructions)")
    print("  - directives/ (SOPs)")
    print("  - execution/ (Scripts)")
    print("  - .tmp/ (Temp storage)")
    print("\nTo import a skill, run:")
    print("  python execution/load_skill.py <GITHUB_URL>")

if __name__ == "__main__":
    main()