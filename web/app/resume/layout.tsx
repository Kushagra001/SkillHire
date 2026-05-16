import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Resume Matcher",
  description: "Analyze your resume against any job description. Get instant feedback on missing keywords to beat the ATS.",
};

export default function ResumeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
