import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Providers from "@/components/providers";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import JsonLd from "@/components/JsonLd";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const BASE_URL = 'https://skillhire.in';

export const metadata: Metadata = {
  title: {
    default: "SkillHire | Outsmart the ATS & Get Hired Faster",
    template: "%s | SkillHire",
  },
  description: "The ultimate AI-powered job hunt platform for 2024-2026 grads. Instantly match your resume to top roles, track company response rates, and organize your applications.",
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: "SkillHire | Outsmart the ATS & Get Hired Faster",
    description: "The ultimate AI-powered job hunt platform for 2024-2026 grads. Instantly match your resume to top roles, track company response rates, and organize your applications.",
    url: BASE_URL,
    siteName: "SkillHire",
    type: "website",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "SkillHire - Outsmart the ATS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillHire | Outsmart the ATS & Get Hired Faster",
    description: "The ultimate AI-powered job hunt platform for 2024-2026 grads. Instantly match your resume to top roles, track company response rates, and organize your applications.",
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
  other: {
    "impact-site-verification": "412bed01-1702-4363-8fec-ff77b7b46bff",
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
              <Toaster position="top-right" richColors />
            </Providers>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
