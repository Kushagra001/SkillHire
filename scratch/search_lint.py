
import os

file_path = r'c:\Users\kusha\OneDrive\Desktop\SkillHire\web\lint_output.txt'
search_term = 'PricingSection.tsx'

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-16') as f:
        content = f.read()
        lines = content.splitlines()
        found = False
        for i, line in enumerate(lines):
            if search_term in line:
                found = True
                print(f"Match found at line {i+1}:")
                # Print 10 lines before and after
                start = max(0, i - 2)
                end = min(len(lines), i + 10)
                for j in range(start, end):
                    print(lines[j])
        if not found:
            print("No match found for", search_term)
else:
    print("File not found:", file_path)
