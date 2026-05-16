import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Tech Jobs",
  description: "Browse 2,400+ curated remote and tech jobs for software engineers. Get instant AI resume match scores.",
};

export default function JobsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
