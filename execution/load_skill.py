#!/usr/bin/env python3
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
