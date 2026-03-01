'use client';

// Razorpay global type
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser, useClerk, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import {
  Code2,
  Menu,
  Search,
  MapPin,
  CheckCircle,
  Star,
  Lock,
  ChevronDown,
  Loader2
} from 'lucide-react';

import NewHero from '@/components/landing/NewHero';
import LogoCloud from '@/components/landing/LogoCloud';
import BentoGrid from '@/components/landing/BentoGrid';
import InteractiveHero from '@/components/landing/InteractiveHero';
import FeaturesSection from '@/components/landing/FeaturesSection';
import PricingSection from '@/components/landing/PricingSection';
import Footer from '@/components/landing/Footer';
import { ThemeToggle } from '@/components/theme-toggle';
import HowItWorksTerminal from '@/components/landing/HowItWorksTerminal';
import TestimonialMarquee from '@/components/landing/TestimonialMarquee';
import FaqAccordion from '@/components/landing/FaqAccordion';

export default function LandingPage() {
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-sh-background-light dark:bg-sh-background-dark text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-sh-primary/30 selection:text-sh-primary-dark">
      {/* Navbar */}
      <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-slate-200 dark:border-slate-800 bg-sh-surface-light/80 dark:bg-sh-surface-dark/80 backdrop-blur-md px-4 md:px-10 py-3">
        <Link href="/" className="flex items-center gap-4 text-slate-900 dark:text-white">
          <div className="h-10 md:h-12 flex items-center justify-start py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logo.svg" alt="SkillHire Logo" className="h-full w-auto object-contain" />
          </div>
        </Link>
        <div className="hidden md:flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <Link className="text-slate-600 dark:text-slate-300 hover:text-sh-primary font-medium text-sm transition-colors" href="/jobs">Jobs</Link>
            <Link className="text-slate-600 dark:text-slate-300 hover:text-sh-primary font-medium text-sm transition-colors" href="/resume">Resume</Link>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-slate-600 dark:text-slate-300 hover:text-sh-primary font-medium text-sm transition-colors bg-transparent border-0 p-0 cursor-pointer"
            >
              Pricing
            </button>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
            <SignedOut>
              <button
                onClick={() => openSignIn({ redirectUrl: window.location.href })}
                className="flex h-10 px-5 cursor-pointer items-center justify-center rounded-lg bg-sh-surface-light dark:bg-sh-surface-dark border border-slate-200 dark:border-slate-700 hover:border-sh-primary/50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => openSignIn({ redirectUrl: window.location.href })}
                className="flex h-10 px-5 cursor-pointer items-center justify-center rounded-lg bg-sh-primary hover:bg-sh-primary-dark text-white text-sm font-semibold shadow-sm transition-all"
              >
                Get Premium
              </button>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
        <div className="md:hidden text-slate-900 dark:text-white">
          <Menu />
        </div>
      </header>

      <NewHero />
      <LogoCloud />
      <HowItWorksTerminal />
      <BentoGrid />
      <TestimonialMarquee />

      {/* Restored Sections */}

      {/* Pricing Section */}
      <PricingSection />

      <FaqAccordion />

      {/* Footer */}
      <Footer />
    </div>
  );
}
