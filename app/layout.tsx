import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SkillHire | Skill-Based Hiring for 2023-2026 Freshers",
  description: "The ultimate skill-based hiring platform for 2023-2026 batch freshers. Match your expertise with top companies using our AI Resume Analyzer.",
  icons: {
    icon: [
      { url: "/assets/favicon.ico?v=3", sizes: "32x32" },
      { url: "/assets/favicon-16x16.png?v=3", sizes: "16x16" },
      { url: "/assets/favicon-32x32.png?v=3", sizes: "32x32" },
    ],
    apple: "/assets/apple-touch-icon.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Providers>
              {children}
              <Analytics />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
