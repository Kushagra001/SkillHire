# Directive: Import New Capability (Skill)

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
