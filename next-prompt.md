---
page: analyze_resume
---
A sleek, modern Resume Matcher / Analyzer page for "SkillHire" that helps freshers instantly check how well their resume matches a job description.

**DESIGN SYSTEM (REQUIRED):**
- Platform: Web, Desktop-first (Responsive)
- Theme: Light, specific "Shadcn" aesthetic (clean, bordered, minimal)
- Background: White (#ffffff)
- Primary Accent: Black (#09090b) for buttons
- Text Primary: Black (#09090b)
- Text Secondary: Gray (#71717a)
- Cards: White surface, thin border (#e4e4e7), rounded-lg
- Font: Sans-serif (Inter style)
- **Iconography**: Lucide style (clean strokes)

**Page Structure:**
1. **Header**: Sticky top bar.
   - Left: "SkillHire" Logo (Icon + Text).
   - Right: Navigation links (Jobs, Resume Checker) + Login button.
2. **Hero Section**:
   - Title: "Does your resume match the job?"
   - Subtitle: "Paste a job description and upload your resume to get an instant match score."
3. **Matcher Tool (Two-Column Layout)**:
   - **Left Column**: A large `<textarea>` for pasting the Job Description (label: "Job Description", placeholder: "Paste the job description here...").
   - **Right Column**: A file upload zone for uploading a PDF resume. Show a dashed-border dropzone with a cloud upload icon and text "Drag & drop your resume (PDF)".
4. **Analyze Button**: A large, full-width or centered Black (#09090b) "Analyze Match" button below both inputs.
5. **Results Section** (shown after analysis):
   - **Match Score**: A large circular progress indicator showing a percentage (e.g., 74%).
   - **Keyword Analysis**: Two columns showing "Matched Keywords" (green badges) and "Missing Keywords" (red/gray badges).
   - **Summary**: A short text paragraph with actionable improvement tips.
6. **Footer**: Simple copyright.

**Specific Tech/Code Instructions**:
- Generate this as a **React Component** using Tailwind CSS.
- Use `lucide-react` for icons (e.g., Upload, FileText, CheckCircle, XCircle).
- Use `shadcn/ui` style classes.
