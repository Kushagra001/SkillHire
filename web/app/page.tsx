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
import { motion, AnimatePresence } from 'framer-motion';
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
  Loader2,
  X
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
import SocialSection from '@/components/landing/SocialSection';

export default function LandingPage() {
  const { user, isSignedIn } = useUser();
  const isPremiumUser = user?.publicMetadata?.isPremium === true;
  const { openSignIn } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link className="text-slate-600 dark:text-slate-300 hover:text-sh-primary font-medium text-sm transition-colors" href="/companies">Hiring Pulse</Link>
            <Link className="text-slate-600 dark:text-slate-300 hover:text-sh-primary font-medium text-sm transition-colors" href="/resume">AI Resume Matcher</Link>
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
                onClick={() => openSignIn({ fallbackRedirectUrl: window.location.href })}
                className="flex h-10 px-5 cursor-pointer items-center justify-center rounded-lg bg-sh-surface-light dark:bg-sh-surface-dark border border-slate-200 dark:border-slate-700 hover:border-sh-primary/50 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-all"
              >
                Sign in
              </button>
              <button
                onClick={() => openSignIn({ fallbackRedirectUrl: window.location.href })}
                className="flex h-10 px-5 cursor-pointer items-center justify-center rounded-lg bg-sh-primary hover:bg-sh-primary-dark text-white text-sm font-semibold shadow-sm transition-all"
              >
                Get Premium
              </button>
            </SignedOut>
            <SignedIn>
              <div className={`p-0.5 rounded-full transition-all duration-300 ${isPremiumUser ? 'bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] dark:from-[#FDB931] dark:to-[#8B6508] shadow-[0_0_15px_rgba(253,185,49,0.3)]' : ''}`}>
                <div className={`flex items-center gap-2 rounded-full ${isPremiumUser ? 'bg-white pl-3 pr-1 py-1 dark:bg-[#0B0F19]' : ''}`}>
                  {isPremiumUser && (
                    <span className="text-[10px] font-black tracking-widest text-[#B8860B] dark:text-[#FDB931] uppercase flex items-center pr-1">
                      PRO <Star className="w-3.5 h-3.5 fill-[#FDB931] text-[#FDB931] ml-1.5 drop-shadow-[0_0_5px_rgba(253,185,49,0.5)]" />
                    </span>
                  )}
                  <div className={isPremiumUser ? "" : "py-1"}>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </SignedIn>
          </div>
        </div>
        <div className="md:hidden text-slate-900 dark:text-white">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 bg-transparent border-0 cursor-pointer text-inherit">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed top-[64px] left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex flex-col px-4 py-6 gap-6">
              <Link href="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 dark:text-white">
                Jobs
              </Link>
              <Link href="/companies" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 dark:text-white">
                Hiring Pulse
              </Link>
              <Link href="/resume" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-900 dark:text-white">
                AI Resume Matcher
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-left text-lg font-medium text-slate-900 dark:text-white bg-transparent border-0 p-0 cursor-pointer"
              >
                Pricing
              </button>

              <div className="h-px w-full bg-slate-200 dark:bg-slate-800 my-2" />

              <SignedOut>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openSignIn({ fallbackRedirectUrl: window.location.href });
                    }}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-base font-semibold"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openSignIn({ fallbackRedirectUrl: window.location.href });
                    }}
                    className="flex h-12 w-full items-center justify-center rounded-lg bg-sh-primary hover:bg-sh-primary-dark text-white text-base font-semibold shadow-sm"
                  >
                    Get Premium
                  </button>
                </div>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3 py-2">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-slate-900 dark:text-white font-medium text-sm">Account</span>
                </div>
              </SignedIn>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NewHero />
      <LogoCloud />
      <HowItWorksTerminal />
      <BentoGrid />
      <TestimonialMarquee />

      {/* Restored Sections */}

      {/* Pricing Section */}
      <PricingSection />

      <FaqAccordion />

      {/* Social Community Section */}
      <SocialSection />

      {/* Footer */}
      <Footer />
    </div>
  );
}
