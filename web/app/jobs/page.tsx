'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useClerk, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Bookmark, Share2, Lock, ChevronLeft, ChevronRight, CheckCircle2, Wallet, Star, ChevronDown, Menu, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/ThemeToggle';

// Razorpay global type
declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: any;
    }
}

// Debounce Hook
// Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

const fetchJobs = async ({ page = 1, search = '', location = '', experience = [] as string[], jobTypes = [] as string[], premiumOnly = false }) => {
    const params = new URLSearchParams({
        page: page.toString(),
        limit: '15',
        q: search,
        location: location,
    });
    if (premiumOnly) {
        params.append('premiumOnly', 'true');
    }
    if (experience.length > 0) {
        params.append('experience', experience.join(','));
    }
    if (jobTypes.length > 0) {
        params.append('jobTypes', jobTypes.join(','));
    }
    const res = await fetch(`/api/jobs?${params}`);
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
};

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    created_at: string;
    apply_link: string;
    tags?: string[];
    is_locked?: boolean;
    is_premium?: boolean;
    match_percentage?: number;
    job_type?: string;
    salary_status?: string;
    tech_stack?: string[];
    raw_data?: {
        description?: string | { text?: string; html?: string };
        snippet?: string;
        raw_snippet?: string;
        logo?: string;
    };
    logo?: string;
}

import { MobileJobDetails } from '@/components/mobile-job-details';
import { JobDetailsPane } from '@/components/JobDetailsPane';
import { CompanyLogo } from '@/components/CompanyLogo';
import { ResponseRateBadge, primeResponseRateCache } from '@/components/ResponseRateBadge';
import { HiringPulseBadge } from '@/components/HiringPulseBadge';
import { FitScoreBadge } from '@/components/FitScoreBadge';

/** Apify/Indeed jobs store description as { text, html }; SerpAPI jobs store it as a plain string. */
const getJobDescription = (raw_data?: { description?: string | { text?: string; html?: string }; snippet?: string; raw_snippet?: string }): string | undefined => {
    const d = raw_data?.description;
    if (typeof d === 'object' && d !== null) return d.text || undefined;
    return (d as string | undefined) || raw_data?.snippet || raw_data?.raw_snippet || undefined;
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

const formatSource = (tag?: string) => {
    if (!tag) return 'Direct';
    if (tag.includes('Apify')) return 'Aggregator'; // Generic
    if (tag.includes('SerpApi')) return 'Google Jobs';
    if (tag.includes('Greenhouse')) return 'Greenhouse';
    return tag;
}

// Helper to extract Batch from tags
const getBatch = (tags?: string[]) => {
    const batchTag = tags?.find(t => t.toLowerCase().includes('batch'));
    return batchTag ? batchTag.replace(/Batch:?/i, '').trim() : 'Any';
}

function JobsPageContent() {
    const router = useRouter();
    const { user, isSignedIn } = useUser();
    const isPremiumUser = user?.publicMetadata?.isPremium === true;
    const { openSignIn, openSignUp } = useClerk();
    const queryClient = useQueryClient();

    const searchParams = useSearchParams();
    
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [location, setLocation] = useState('');
    const [gradYear, setGradYear] = useState('');
    const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [sortBy, setSortBy] = useState("newest");

    const urlJobId = searchParams.get('jobId');
    const shouldSignIn = searchParams.get('sign-in') === 'true';

    useEffect(() => {
        const q = searchParams.get('q');
        if (q !== null) {
            setSearch(q);
        }
    }, [searchParams]);

    useEffect(() => {
        if (shouldSignIn && !isSignedIn) {
            // Remove the sign-in param from URL so it doesn't reopen on refresh
            const params = new URLSearchParams(window.location.search);
            params.delete('sign-in');
            window.history.replaceState(null, '', `?${params.toString()}`);
            
            // Short delay to ensure transition finishes and modal mounts correctly
            setTimeout(() => {
                openSignIn();
            }, 100);
        }
    }, [shouldSignIn, isSignedIn, openSignIn]);

    // Back-gesture fix: push a hash state when opening mobile pane so the browser
    // back gesture pops the hash (closing the pane) rather than navigating away.
    const openMobilePane = (job: Job) => {
        setSelectedJob(job);
        setIsMobileOpen(true);
        if (typeof window !== 'undefined') {
            window.history.pushState({ mobilePane: true }, '', '#job');
        }
    };

    const closeMobilePane = () => {
        setIsMobileOpen(false);
        if (typeof window !== 'undefined' && window.location.hash === '#job') {
            window.history.back();
        }
    };

    useEffect(() => {
        const handlePopState = (e: PopStateEvent) => {
            // If the pane is open and user presses back, close the pane instead of navigating away
            if (isMobileOpen) {
                setIsMobileOpen(false);
                e.preventDefault();
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isMobileOpen]);
    const [showPremiumOnly, setShowPremiumOnly] = useState(false);
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [focusedInput, setFocusedInput] = useState<'search' | 'location' | null>(null);

    const debouncedSearch = useDebounce(search, 500);
    const debouncedLocation = useDebounce(location, 500);

    // Sync URL with selected job
    useEffect(() => {
        if (selectedJob?._id) {
            const params = new URLSearchParams(window.location.search);
            if (params.get('jobId') !== selectedJob._id) {
                params.set('jobId', selectedJob._id);
                window.history.replaceState(null, '', `?${params.toString()}`);
            }
        }
    }, [selectedJob?._id]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch, debouncedLocation, selectedExperience, selectedTypes, showPremiumOnly]);

    const {
        data,
        isLoading,
        isError,
    } = useQuery({
        // isSignedIn is part of the key: auth state change triggers an automatic re-fetch
        // so the server can return the correct locked/unlocked state for this user
        queryKey: ['jobs', page, debouncedSearch, debouncedLocation, selectedExperience, selectedTypes, showPremiumOnly, isSignedIn],
        queryFn: () => fetchJobs({
            page: page,
            search: debouncedSearch,
            location: debouncedLocation,
            experience: selectedExperience,
            jobTypes: selectedTypes,
            premiumOnly: showPremiumOnly
        }),
        placeholderData: (previousData) => previousData,
    });

    // Handle deep linking from jobId in URL
    useEffect(() => {
        if (urlJobId && data?.jobs && !selectedJob) {
            const jobToSelect = data.jobs.find((j: Job) => j._id === urlJobId);
            if (jobToSelect) {
                setSelectedJob(jobToSelect);
            }
        }
    }, [urlJobId, data?.jobs, selectedJob]);

    const allJobs: Job[] = data?.jobs || [];
    const pagination = data?.pagination || { currentPage: 1, totalPages: 1, totalJobs: 0 };

    const processedJobs = [...allJobs]
        .map(job => {
            // MongoDB ObjectIds start with a 4-byte timestamp.
            // Jobs scraped together have the same timestamp, causing the same percentage.
            // We use the last 8 characters (random + counter) to ensure a unique deterministic value.
            const uniqueHex = job._id.length >= 24 ? job._id.substring(16, 24) : job._id;
            const pseudoRandomMatch = Math.floor((parseInt(uniqueHex, 16) % 41) + 60);

            return {
                ...job,
                // Generate a deterministic pseudo-random match percentage based on the job ID
                // This ensures the match percentage stays consistent across re-renders for the same job
                match_percentage: job.match_percentage || pseudoRandomMatch
            };
        })
        .sort((a, b) => {
            if (sortBy === 'match') {
                return (b.match_percentage || 0) - (a.match_percentage || 0);
            }
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    // Prime the response rate cache for all unique companies on the page
    useEffect(() => {
        if (allJobs.length > 0) {
            const uniqueCompanies = Array.from(new Set(allJobs.map(j => j.company)));
            primeResponseRateCache(uniqueCompanies);
        }
    }, [allJobs]);

    useEffect(() => {
        if (!selectedJob && processedJobs.length > 0) {

            setSelectedJob(processedJobs[0]);
        }
    }, [processedJobs, selectedJob]);

    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async () => {
        if (!selectedJob) return;

        // Step 1: Require sign-in — pass redirectUrl so user returns here after auth
        if (!isSignedIn) {
            openSignIn({ fallbackRedirectUrl: window.location.href });
            return;
        }

        setIsUnlocking(true);
        try {
            // Step 2: Inject the Razorpay checkout script
            await new Promise<void>((resolve, reject) => {
                if (window.Razorpay) return resolve();
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Razorpay script failed to load'));
                document.body.appendChild(script);
            });

            // Step 3: Create a server-side Razorpay order
            const orderRes = await fetch('/api/razorpay/order', { method: 'POST' });
            if (!orderRes.ok) throw new Error('Failed to create order');
            const { orderId, amount } = await orderRes.json();

            // Step 4: Open Razorpay modal
            await new Promise<void>((resolve, reject) => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount,
                    currency: 'INR',
                    name: 'SkillHire',
                    description: 'Premium Access — ₹199/month',
                    order_id: orderId,
                    theme: { color: '#41b4a5' },
                    handler: () => {
                        // Payment captured — invalidate jobs cache so locked jobs re-fetch as unlocked
                        // (Clerk metadata updated async via webhook, brief delay gives webhook time to process)
                        setTimeout(() => {
                            queryClient.invalidateQueries({ queryKey: ['jobs'] });
                            router.refresh();
                        }, 2000);
                        resolve();
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                };
                const rzp = new window.Razorpay(options);
                rzp.open();
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Payment failed';
            if (msg !== 'Payment cancelled') {
                console.error('Unlock error:', error);
                alert(msg);
            }
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex flex-col bg-[#f9fbfb] dark:bg-[#060D18] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#41b4a5]/30 selection:text-[#369689]">
            {/* Sticky Navigation */}
            <header className="shrink-0 z-50 w-full border-b border-gray-200 dark:border-slate-800/60 bg-white/95 dark:bg-[#060D18]/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-[#060D18]/80">
                <div className="flex h-16 w-full items-center px-4 sm:px-6 lg:px-8 gap-4">
                    {/* Logo — hard left */}
                    <Link href="/" className="flex items-center gap-3 decoration-transparent">
                        <div className="h-10 md:h-12 flex items-center justify-start py-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/assets/logo.svg" alt="SkillHire Logo" className="h-full w-auto object-contain" />
                        </div>
                    </Link>
                    <div className="flex-1" />
                    <nav className="hidden md:flex items-center gap-8 mr-4">
                        <Link className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#41b4a5] transition-colors" href="/jobs">Jobs</Link>
                        <Link className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#41b4a5] transition-colors" href="/companies">Hiring Pulse</Link>
                        <Link className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#41b4a5] transition-colors" href="/resume">AI Resume Matcher</Link>
                        <Link className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-[#41b4a5] transition-colors" href="/tracker">Tracker</Link>
                    </nav>
                    {/* Auth — hard right */}
                    <div className="flex items-center gap-3 shrink-0">
                        <ThemeToggle />
                        <SignedOut>
                            <button
                                onClick={() => openSignIn({ fallbackRedirectUrl: window.location.href })}
                                className="hidden md:flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-all"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => openSignUp({ fallbackRedirectUrl: window.location.href })}
                                className="hidden md:flex h-9 items-center justify-center rounded-lg bg-[#41b4a5] px-4 text-sm font-bold text-white transition-all hover:bg-[#369689] shadow-sm"
                            >
                                Get Premium
                            </button>
                        </SignedOut>
                        <SignedIn>
                            <div className={`p-0.5 rounded-full transition-all duration-300 ${isPremiumUser ? 'bg-gradient-to-br from-[#FFD700] via-[#FDB931] to-[#D4AF37] dark:from-[#FDB931] dark:to-[#8B6508] shadow-[0_0_15px_rgba(253,185,49,0.3)]' : ''}`}>
                                <div className={`flex items-center gap-2 rounded-full ${isPremiumUser ? 'bg-white dark:bg-[#0B0F19] pl-3 pr-1 py-1' : ''}`}>
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
                        <div className="md:hidden">
                            <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className="p-2 -mr-2 text-slate-700 bg-transparent border-none cursor-pointer">
                                {isMobileNavOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence>
                {isMobileNavOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden absolute top-16 left-0 right-0 z-40 bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-slate-800 shadow-lg flex flex-col p-5 gap-5"
                    >
                        <Link href="/jobs" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-slate-900 dark:text-white border-none bg-transparent m-0 p-0 text-left">Jobs</Link>
                        <Link href="/companies" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-slate-900 dark:text-white border-none bg-transparent m-0 p-0 text-left">Hiring Pulse</Link>
                        <Link href="/resume" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-slate-900 dark:text-white border-none bg-transparent m-0 p-0 text-left">AI Resume Matcher</Link>
                        <Link href="/tracker" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-slate-900 dark:text-white border-none bg-transparent m-0 p-0 text-left">Tracker</Link>
                        <div className="h-px bg-gray-200 dark:bg-slate-800 my-1" />
                        <SignedOut>
                            <button onClick={() => { setIsMobileNavOpen(false); openSignIn({ fallbackRedirectUrl: window.location.href }); }} className="text-left text-lg font-semibold text-slate-900 dark:text-white border-none bg-transparent m-0 p-0 cursor-pointer">Sign in</button>
                            <button onClick={() => { setIsMobileNavOpen(false); openSignUp({ fallbackRedirectUrl: window.location.href }); }} className="text-left text-lg font-bold text-[#41b4a5] border-none bg-transparent m-0 p-0 cursor-pointer">Get Premium</button>
                        </SignedOut>
                        <SignedIn>
                            <span className="text-sm font-medium text-slate-500">Account management available via avatar</span>
                        </SignedIn>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-slate-800/60 py-3 sm:py-4 shrink-0">
                    <div className="w-full px-4 sm:px-6 lg:px-8">
                        {/* Telegram Alert Banner - Shows to all users now */}
                        <div id="telegram-card" className={`mb-4 w-full bg-gradient-to-r border rounded-xl p-2.5 sm:p-3 flex items-center justify-between gap-4 shadow-sm relative overflow-hidden transition-all duration-300 ${isPremiumUser ? 'from-amber-50/50 to-orange-50/50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-900/30' : 'from-blue-50/50 to-indigo-50/50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30'}`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none ${isPremiumUser ? 'bg-amber-500/10' : 'bg-blue-500/5'}`} />
                            <div className="flex items-center gap-3 z-10 flex-1 min-w-0">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${isPremiumUser ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                                    <Send className={`h-5 w-5 ${isPremiumUser ? 'text-amber-600' : 'text-[#0088cc]'}`} />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <h3 className="text-[13px] sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        {isPremiumUser ? 'Join your Private Premium Telegram' : 'Join 5,000+ Devs on Telegram'}
                                        <span className={`hidden xs:inline-block px-1.5 py-0.5 rounded-[4px] text-[9px] font-black white uppercase tracking-tighter text-white ${isPremiumUser ? 'bg-amber-500' : 'bg-blue-500'}`}>{isPremiumUser ? 'VIP Access' : 'Zero-Day Alerts'}</span>
                                    </h3>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:block">
                                        {isPremiumUser ? 'Get instant alerts the exact second we score a new premium job.' : 'We drop 20+ hidden remote jobs in Telegram every day.'}
                                    </p>
                                </div>
                            </div>
                            <a
                                href={isPremiumUser ? "https://t.me/+ud_U0D07RkY3YTk1" : "https://t.me/SkillHireFree1"}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    localStorage.setItem('skillhire_telegram_joined', 'true');
                                    const card = document.getElementById('telegram-card');
                                    if (card) {
                                        card.style.opacity = '0';
                                        setTimeout(() => card.style.display = 'none', 300);
                                    }
                                }}
                                className={`shrink-0 flex items-center gap-2 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 z-10 ${isPremiumUser ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#0088cc] hover:bg-[#0077b5]'}`}
                            >
                                Join Now
                            </a>
                            <script dangerouslySetInnerHTML={{
                                __html: `
                                if (typeof window !== 'undefined' && localStorage.getItem('skillhire_telegram_joined') === 'true') {
                                    document.getElementById('telegram-card') && (document.getElementById('telegram-card').style.display = 'none');
                                }
                            `}} />
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
                            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap hidden sm:block md:block">Find your dream job</h1>
                            <div className="flex flex-row gap-2 w-full">
                                <div
                                    style={{ flex: focusedInput === 'search' ? 3 : focusedInput === 'location' ? 1 : 2 }}
                                    className="relative min-w-0 transition-all duration-300 ease-in-out group"
                                >
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Search className="h-4 w-4 shrink-0" />
                                    </div>
                                    <input
                                        className="block w-full min-w-0 truncate rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 pl-9 sm:pl-10 pr-3 py-2 text-[13px] sm:text-sm focus:border-[#41b4a5] focus:outline-none shadow-sm h-10 transition-all bg-white"
                                        placeholder="Role, Skills, or Company"
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onFocus={() => setFocusedInput('search')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </div>
                                <div
                                    style={{ flex: focusedInput === 'location' ? 3 : focusedInput === 'search' ? 1 : 2 }}
                                    className="relative min-w-0 transition-all duration-300 ease-in-out group"
                                >
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <MapPin className="h-4 w-4 shrink-0" />
                                    </div>
                                    <input
                                        className="block w-full min-w-0 truncate rounded-lg border border-gray-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:placeholder-slate-500 pl-9 sm:pl-10 pr-3 py-2 text-[13px] sm:text-sm focus:border-[#41b4a5] focus:outline-none shadow-sm h-10 transition-all bg-white"
                                        placeholder="Location (e.g. Bangalore)"
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        onFocus={() => setFocusedInput('location')}
                                        onBlur={() => setFocusedInput(null)}
                                    />
                                </div>
                                <button className="flex shrink-0 h-10 items-center justify-center rounded-lg bg-[#0A3D62] px-3 sm:px-6 text-sm font-bold text-white transition-all hover:bg-slate-800 shadow-sm active:scale-95">
                                    <Search className="h-4 w-4 md:hidden" />
                                    <span className="hidden md:inline">Search</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex gap-4 sm:gap-6 overflow-hidden">
                    {/* Left: Job List & Filters */}
                    <div className="w-full md:w-[35%] flex flex-col gap-2 sm:gap-3 md:min-w-[340px] md:max-w-[420px]">

                        {/* Compact Sidebar Filters */}
                        <div className="bg-white dark:bg-[#0B0F19]/80 dark:border-slate-800/60 rounded-xl border border-gray-200 shadow-sm flex flex-col transition-all overflow-hidden relative">
                            <div
                                className="flex items-center justify-between p-2.5 sm:p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors z-10 bg-white dark:bg-transparent"
                                onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                            >
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[12px] sm:text-[13px] font-bold text-slate-900 dark:text-white select-none">Refine Results</h3>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedExperience([]); setLocation(''); setSearch(''); setSelectedTypes([]);
                                    }}
                                    className="text-[11px] font-semibold text-[#41B3A3] hover:underline px-2 py-0.5 rounded hover:bg-teal-50"
                                >
                                    Reset
                                </button>
                            </div>

                            <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isFiltersExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                            >
                                <div className="overflow-hidden">
                                    <div className="p-3 pt-0 flex flex-col gap-2">
                                        <div className="space-y-1 border-t border-gray-100 pt-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['0-2 Years', '2-4 Years', '5+ Years'].map((exp) => {
                                                    const isSelected = selectedExperience.includes(exp);
                                                    return (
                                                        <button
                                                            key={exp}
                                                            onClick={() => {
                                                                setSelectedExperience(prev =>
                                                                    isSelected ? prev.filter(e => e !== exp) : [...prev, exp]
                                                                );
                                                            }}
                                                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${isSelected
                                                                ? 'bg-[#09090b] text-white border-[#09090b]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#41B3A3] hover:text-[#41B3A3]'
                                                                }`}
                                                        >
                                                            {exp}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-1 border-t border-gray-100 pt-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Job Type</label>
                                            <div className="flex flex-wrap gap-1.5">
                                                {['Full-time', 'Internship', 'Contract'].map((type) => {
                                                    const isSelected = selectedTypes.includes(type);
                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => {
                                                                setSelectedTypes(prev =>
                                                                    isSelected ? prev.filter(t => t !== type) : [...prev, type]
                                                                );
                                                            }}
                                                            className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${isSelected
                                                                ? 'bg-[#09090b] text-white border-[#09090b]'
                                                                : 'bg-white text-slate-600 border-slate-200 hover:border-[#41B3A3] hover:text-[#41B3A3]'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${location.toLowerCase() === 'remote' ? 'bg-[#41B3A3]' : 'bg-slate-300'}`} onClick={() => setLocation(location.toLowerCase() === 'remote' ? '' : 'Remote')}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${location.toLowerCase() === 'remote' ? 'left-4.5' : 'left-0.5'}`} />
                                                </div>
                                                <span className="text-[12px] font-medium text-slate-600">Remote Only</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${showPremiumOnly ? 'bg-amber-500' : 'bg-slate-300'}`}
                                                    onClick={() => setShowPremiumOnly(!showPremiumOnly)}>
                                                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-transform ${showPremiumOnly ? 'left-4.5' : 'left-0.5'}`} />
                                                </div>
                                                <span className="text-[12px] font-medium text-slate-600">Premium Jobs Only</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-gray-100 pt-2.5 mt-0.5">
                                            <span className="text-[11px] text-slate-400 font-medium shrink-0">
                                                {pagination.totalJobs} jobs found
                                            </span>
                                            <div className="relative group">
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-md outline-none focus:ring-1 focus:ring-[#41B3A3] focus:border-[#41B3A3] cursor-pointer py-1 pl-2 pr-6 appearance-none transition-all hover:bg-slate-100"
                                                >
                                                    <option value="newest">Newest First</option>
                                                    <option value="match">Highest Match</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400 group-hover:text-slate-600">
                                                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {isLoading && <div className="flex justify-center p-4"><Loader2 className="animate-spin text-[#41b4a5]" /></div>}
                        {isError && <div className="flex justify-center p-4 text-red-500 text-sm">Error loading jobs.</div>}

                        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar pr-1 sm:pr-3 space-y-2 pb-2 mt-1 sm:mt-0">
                            <AnimatePresence>
                                {processedJobs.map((job: Job, index: number) => (
                                    <motion.div
                                        key={job._id}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        onClick={() => {
                                            setSelectedJob(job);
                                            // Only open the mobile sheet on small screens
                                            if (window.innerWidth < 768) {
                                                openMobilePane(job);
                                            }
                                        }}
                                        className={`
                                            relative p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer group overflow-hidden
                                            ${selectedJob?._id === job._id
                                                ? 'border border-l-4 border-l-[#41B3A3] border-r-0 border-y-transparent bg-[#41B3A3]/5 dark:bg-[#41B3A3]/10 rounded-r-none shadow-none z-10'
                                                : `border hover:border-[#41B3A3] hover:shadow-sm ${job.is_locked ? 'bg-amber-50/60 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' : 'bg-white dark:bg-slate-800/50 border-gray-200 dark:border-slate-800/60'}`
                                            }
                                        `}
                                    >
                                        <div className="flex gap-2.5 sm:gap-3 items-start">
                                            {/* Logo — compact */}
                                            <CompanyLogo
                                                logo={job.logo}
                                                company={job.company}
                                                size="sm"
                                            />

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                {/* Title */}
                                                <h3 className={`text-sm font-bold leading-snug break-words mb-1 ${selectedJob?._id === job._id ? 'text-[#0A3D62] dark:text-[#41b4a5]' : 'text-slate-900 dark:text-slate-100'}`}>
                                                    {job.title}
                                                </h3>

                                                {/* Company + verified + lock + timestamp */}
                                                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{job.company}</span>
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-[#41b4a5] fill-[#EAFBF9] shrink-0" />
                                                    {job.is_locked && <Lock className="h-3 w-3 text-amber-500 shrink-0" />}
                                                    <ResponseRateBadge company={job.company} className="shrink-0" />
                                                    <HiringPulseBadge company={job.company} className="shrink-0" />
                                                    <FitScoreBadge techStack={job.tech_stack || []} className="shrink-0" />
                                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 whitespace-nowrap ml-auto flex items-center gap-1.5">
                                                        {formatTimeAgo(job.created_at)}
                                                        {job.is_premium && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700">PRO</span>}
                                                    </span>
                                                </div>

                                                {/* Location · Type · Salary — one compact row */}
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-300">
                                                        <Star className={`h-3.5 w-3.5 ${job.match_percentage && job.match_percentage >= 85 ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
                                                        Est. {job.match_percentage}%
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                        {job.location || 'India'}
                                                    </span>
                                                    {job.job_type && (
                                                        <span className="flex items-center gap-1">
                                                            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                            {job.job_type}
                                                        </span>
                                                    )}
                                                    {job.salary_status && job.salary_status !== "Not Disclosed" && (
                                                        <span className="flex items-center gap-1 text-[#41b4a5] font-medium">
                                                            <Wallet className="h-3.5 w-3.5 shrink-0" />
                                                            {job.salary_status}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {
                            !isLoading && processedJobs.length === 0 && (
                                <div className="p-4 text-center text-slate-500 text-sm">
                                    No jobs found.
                                </div>
                            )
                        }

                        {/* Pagination Controls */}
                        {
                            pagination.totalPages > 0 && (() => {
                                const maxVisible = 5;
                                let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
                                let endPage = startPage + maxVisible - 1;

                                if (endPage > pagination.totalPages) {
                                    endPage = pagination.totalPages;
                                    startPage = Math.max(1, endPage - maxVisible + 1);
                                }
                                // ensure startPage is at least 1
                                startPage = Math.max(1, startPage);

                                const pages = [];
                                for (let i = startPage; i <= endPage; i++) {
                                    if (i !== 1 && i !== pagination.totalPages) {
                                        pages.push(i);
                                    }
                                }

                                return (
                                    <div className="border-t border-gray-100 pt-3 pb-2 flex flex-col gap-2">
                                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                                            Page {page} of {pagination.totalPages}
                                        </div>
                                        <div className="flex items-center gap-1 self-center sm:self-start">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                                disabled={page === 1 || isLoading}
                                                className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <ChevronLeft className="h-3.5 w-3.5" />
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                onClick={() => setPage(1)}
                                                className={`h-7 w-7 p-0 rounded-full text-xs font-medium ${page === 1 ? 'bg-slate-800 dark:bg-[#41b4a5] text-white hover:bg-slate-700 hover:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                disabled={isLoading}
                                            >
                                                1
                                            </Button>

                                            {startPage > 2 && <span className="text-slate-400 dark:text-slate-500 px-1 text-xs">...</span>}

                                            {pages.map(p => (
                                                <Button
                                                    key={p}
                                                    variant="ghost"
                                                    onClick={() => setPage(p)}
                                                    className={`h-7 w-7 p-0 rounded-full text-xs font-medium ${page === p ? 'bg-slate-800 dark:bg-[#41b4a5] text-white hover:bg-slate-700 hover:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                    disabled={isLoading}
                                                >
                                                    {p}
                                                </Button>
                                            ))}

                                            {pagination.totalPages > 1 && endPage < pagination.totalPages - 1 && <span className="text-slate-400 dark:text-slate-500 px-1 text-xs">...</span>}

                                            {pagination.totalPages > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => setPage(pagination.totalPages)}
                                                    className={`h-7 w-7 p-0 rounded-full text-xs font-medium ${page === pagination.totalPages ? 'bg-slate-800 dark:bg-[#41b4a5] text-white hover:bg-slate-700 hover:text-white' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                    disabled={isLoading}
                                                >
                                                    {pagination.totalPages}
                                                </Button>
                                            )}

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                                disabled={page === pagination.totalPages || isLoading}
                                                className="h-7 w-7 p-0 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <ChevronRight className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })()
                        }
                    </div >

                    {/* Right: Job Details */}
                    <div className="flex-1 flex flex-col bg-white dark:bg-[#0B0F19]/80 rounded-xl border border-gray-200 dark:border-slate-800/60 shadow-sm overflow-hidden hidden md:flex relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedJob?._id || 'empty'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15, ease: "easeInOut" }}
                                className="h-full w-full flex flex-col"
                            >
                                <JobDetailsPane job={selectedJob} onUnlock={handleUnlock} isUnlocking={isUnlocking} isSignedIn={!!isSignedIn} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Mobile Job Details Sheet */}
            < div className="md:hidden" >
                <MobileJobDetails
                    job={isMobileOpen ? selectedJob : null}
                    onClose={closeMobilePane}
                    onUnlock={handleUnlock}
                    isUnlocking={isUnlocking}
                />
            </div >
        </div >
    );
}

export default function JobsPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-[#0B0F19]">
                <Loader2 className="h-10 w-10 text-[#41b4a5] animate-spin mb-4" />
                <p className="text-slate-500 font-medium animate-pulse">Loading jobs...</p>
            </div>
        }>
            <JobsPageContent />
        </Suspense>
    );
}
