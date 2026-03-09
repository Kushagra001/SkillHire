import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL = 'https://skillhire.in';

export const metadata: Metadata = {
  title: {
    default: "SkillHire | Hired for What You Know",
    template: "%s | SkillHire",
  },
  description: "Skill-based hiring for 2023-2026 freshers. Get matched to top companies based on what you can build.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "SkillHire | Hired for What You Know",
    description: "Skill-based hiring for 2023-2026 freshers. Get matched to top companies based on what you can build.",
    url: BASE_URL,
    siteName: "SkillHire",
    type: "website",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkillHire — Hired for What You Know",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillHire | Hired for What You Know",
    description: "Skill-based hiring for 2023-2026 freshers. Get matched to top companies based on what you can build.",
    images: ["/assets/og-image.png"],
  },
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
              <JsonLd />
              {children}
              <Analytics />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
