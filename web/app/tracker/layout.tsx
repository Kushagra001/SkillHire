import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Application Tracker",
  description: "Track your job applications in a Kanban board. Log your interviews, offers, and rejections all in one place.",
};

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
