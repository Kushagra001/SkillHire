'use client';

import { useState, useEffect } from 'react';
import { UploadCloud, FileText, Activity, Zap, FileUp, Check, X, Lightbulb, ExternalLink, ChevronDown, Loader2, RefreshCw, Menu, Star } from 'lucide-react';
import { useClerk, SignedIn, SignedOut, UserButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, animate } from 'framer-motion';

interface AnalysisResult {
    job_title?: string;
    match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    ai_recommendation: string;
}

export default function ResumePage() {
    const { openSignIn, openSignUp } = useClerk();
    const { user } = useUser();
    const isPremiumUser = user?.publicMetadata?.isPremium === true;
    const [file, setFile] = useState<File | null>(null);
    const [jobDescription, setJobDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [displayLimit, setDisplayLimit] = useState(5);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

    // Framer Motion & Loading States
    const [loadingStep, setLoadingStep] = useState(0);
    const [animatedScore, setAnimatedScore] = useState(0);
    const loadingPhrases = [
        "Parsing PDF structure...",
        "Extracting job keywords...",
        "Running ATS algorithms...",
        "Finalizing match score..."
    ];

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAnalyzing) {
            setLoadingStep(0);
            interval = setInterval(() => {
                setLoadingStep((prev) => (prev < loadingPhrases.length - 1 ? prev + 1 : prev));
            }, 1500);
        }
        return () => clearInterval(interval);
    }, [isAnalyzing]);

    useEffect(() => {
        if (result && !isAnalyzing) {
            setAnimatedScore(0);
            const controls = animate(0, result.match_percentage, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate: (value) => setAnimatedScore(Math.round(value)),
            });
            return controls.stop;
        }
    }, [result, isAnalyzing]);

    const resetScan = () => {
        setJobDescription('');
        setResult(null);
        setIsAnalyzing(false);
    };

    useEffect(() => {
        const savedScans = localStorage.getItem('skillhire_recent_scans');
        if (savedScans) {
            try {
                setRecentScans(JSON.parse(savedScans));
            } catch (e) {
                console.error("Failed to parse recent scans", e);
            }
        }
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500 dark:text-green-400";
        if (score >= 50) return "text-yellow-500 dark:text-yellow-400";
        return "text-red-500 dark:text-red-400";
    };

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "Just now";
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 172800) return "Yesterday";

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleAnalyze = async () => {
        if (!file || !jobDescription) return;

        setIsAnalyzing(true);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        try {
            const res = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to analyze resume');
            }

            setResult(data);

            const newScan = {
                title: data.job_title || 'Unknown Role',
                company: 'Custom Input',
                score: data.match_percentage,
                date: new Date().toISOString(),
                id: Math.random().toString(36).substring(7),
                fullResult: data
            };

            const updatedScans = [newScan, ...recentScans].slice(0, 50);
            setRecentScans(updatedScans);
            localStorage.setItem('skillhire_recent_scans', JSON.stringify(updatedScans));
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to analyze resume');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const clearHistory = () => {
        if (window.confirm('Are you sure you want to clear your entire scan history? This action cannot be undone.')) {
            setRecentScans([]);
            localStorage.removeItem('skillhire_recent_scans');
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-[#060D18] dark:via-[#0B0F19] dark:to-[#0B1520] text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-primary/30 selection:text-primary-dark overflow-hidden">

            {/* Premium noise texture */}
            <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.15] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", backgroundSize: "180px 180px" }} />

            {/* Top-right teal glow */}
            <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-[#41B3A3]/15 dark:bg-teal-500/8 rounded-full blur-[130px] -translate-y-1/3 translate-x-1/4 pointer-events-none z-0" />

            {/* Left green accent */}
            <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-emerald-400/8 dark:bg-emerald-500/4 rounded-full blur-[100px] -translate-x-1/3 pointer-events-none z-0" />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.02] dark:opacity-[0.035] pointer-events-none" style={{ backgroundImage: "linear-gradient(#1b2532 1px, transparent 1px), linear-gradient(90deg, #1b2532 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

            {/* Top Navigation */}
            <header className="relative z-10 shrink-0 w-full border-b border-gray-200/80 dark:border-slate-800/60 bg-white/80 dark:bg-[#060D18]/80 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-[#060D18]/70">
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
                        <Link className="text-sm font-medium text-slate-700 hover:text-[#41b4a5] transition-colors" href="/jobs">Jobs</Link>
                        <Link className="text-sm font-medium text-[#41b4a5] hover:text-[#41b4a5] transition-colors" href="/resume">AI Resume Matcher</Link>
                    </nav>
                    {/* Auth — hard right */}
                    <div className="flex items-center gap-3 shrink-0">
                        <SignedOut>
                            <button
                                onClick={() => openSignIn({ redirectUrl: window.location.href })}
                                className="hidden md:flex h-9 items-center justify-center rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-700 hover:bg-gray-50 transition-all"
                            >
                                Sign in
                            </button>
                            <button
                                onClick={() => openSignUp({ redirectUrl: window.location.href })}
                                className="hidden md:flex h-9 items-center justify-center rounded-lg bg-[#41b4a5] px-4 text-sm font-bold text-white transition-all hover:bg-[#369689] shadow-sm"
                            >
                                Get Premium
                            </button>
                        </SignedOut>
                        <SignedIn>
                            <div className={`p-0.5 rounded-full transition-all duration-300 ${isPremiumUser ? 'bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 shadow-sm' : ''}`}>
                                <div className={`flex items-center gap-2 rounded-full ${isPremiumUser ? 'bg-white pl-3 pr-1 py-1' : ''}`}>
                                    {isPremiumUser && (
                                        <span className="text-[10px] font-bold tracking-widest text-amber-600 uppercase flex items-center pr-1">
                                            PRO <Star className="w-3 h-3 fill-amber-500 text-amber-500 ml-1" />
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
                        className="md:hidden absolute top-16 left-0 right-0 z-40 bg-white dark:bg-[#0B1120] border-b border-gray-200 dark:border-gray-800 shadow-lg flex flex-col p-5 gap-5"
                    >
                        <Link href="/jobs" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-slate-900 dark:text-gray-100 border-none bg-transparent m-0 p-0 text-left">Jobs</Link>
                        <Link href="/resume" onClick={() => setIsMobileNavOpen(false)} className="text-lg font-semibold text-[#41b4a5] border-none bg-transparent m-0 p-0 text-left">AI Resume Matcher</Link>
                        <div className="h-px bg-gray-200 dark:bg-gray-800 my-1" />
                        <SignedOut>
                            <button onClick={() => { setIsMobileNavOpen(false); openSignIn({ redirectUrl: window.location.href }); }} className="text-left text-lg font-semibold text-slate-900 border-none bg-transparent m-0 p-0 cursor-pointer dark:text-white">Sign in</button>
                            <button onClick={() => { setIsMobileNavOpen(false); openSignUp({ redirectUrl: window.location.href }); }} className="text-left text-lg font-bold text-[#41b4a5] border-none bg-transparent m-0 p-0 cursor-pointer">Get Premium</button>
                        </SignedOut>
                        <SignedIn>
                            <span className="text-sm font-medium text-slate-500">Account management available via avatar</span>
                        </SignedIn>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="relative z-10 flex-grow w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                {/* Header Section */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">AI Resume Matcher</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">Optimize your applications with AI-powered insights. Compare your resume against any job description instantly.</p>
                </div>

                {/* Top Layout Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {/* Left Column: Input */}
                    <motion.div layout className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col h-full">
                        <div className="mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                                <FileUp className="h-5 w-5 text-primary" />
                                Upload Resume
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Supported formats: PDF (Max 5MB)</p>
                        </div>

                        {/* Dropzone */}
                        <div className="border-2 border-dashed border-primary/30 bg-primary/5 dark:bg-primary/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-primary hover:bg-primary/10 transition-all group mb-8 relative">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="size-12 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <UploadCloud className="text-primary h-6 w-6" />
                            </div>
                            <p className="text-slate-900 dark:text-white font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {file ? file.name : "Please select your resume PDF format"}
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-primary" />
                                    Job Description
                                </h3>
                            </div>
                            <div className="relative">
                                <textarea
                                    className="w-full h-40 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary focus:border-transparent resize-none placeholder-slate-400"
                                    placeholder="Paste the job description here..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                ></textarea>
                                {jobDescription && (
                                    <button
                                        onClick={() => setJobDescription('')}
                                        className="absolute bottom-3 right-3 text-xs text-primary font-medium hover:underline bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 shadow-sm"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-4">
                            <button
                                className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                                onClick={handleAnalyze}
                                disabled={!file || !jobDescription || isAnalyzing}
                            >
                                {isAnalyzing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Activity className="h-5 w-5" />}
                                {isAnalyzing ? "Analyzing Match..." : "Analyze Match"}
                            </button>
                        </div>
                    </motion.div>

                    {/* Right Column: Results */}
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 p-6 md:p-8 flex flex-col h-full relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {isAnalyzing ? (
                                <motion.div
                                    key="analyzing"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center justify-center h-full text-center py-20"
                                >
                                    <div className="relative size-20 rounded-full flex items-center justify-center mb-6">
                                        <div className="absolute inset-0 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        <Activity className="h-8 w-8 text-primary animate-pulse" />
                                    </div>
                                    <AnimatePresence mode="wait">
                                        <motion.h3
                                            key={loadingStep}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2"
                                        >
                                            {loadingPhrases[loadingStep]}
                                        </motion.h3>
                                    </AnimatePresence>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">This usually takes about 5 seconds.</p>
                                </motion.div>
                            ) : result ? (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analysis Results</h3>
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={resetScan}
                                                className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700"
                                            >
                                                <RefreshCw className="h-3 w-3" />
                                                Scan Another Job
                                            </button>
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-md uppercase tracking-wider hidden sm:block">Completed</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
                                        {/* Radial Progress */}
                                        <div className="relative size-32 shrink-0">
                                            <svg className="size-full -rotate-90 origin-[50%_50%]" viewBox="0 0 100 100">
                                                <circle className="text-slate-200 dark:text-slate-700 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
                                                <motion.circle
                                                    className={`${getScoreColor(result.match_percentage)} stroke-current`}
                                                    cx="50" cy="50" fill="transparent" r="42"
                                                    strokeDasharray="264"
                                                    initial={{ strokeDashoffset: 264 }}
                                                    animate={{ strokeDashoffset: 264 - (264 * result.match_percentage) / 100 }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                    strokeWidth="8"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-bold text-slate-900 dark:text-white">{animatedScore}%</span>
                                                <span className="text-[10px] uppercase font-bold text-slate-500">Match</span>
                                            </div>
                                        </div>

                                        {/* Summary Text */}
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                                {result.match_percentage >= 80 ? "Excellent Match!" : result.match_percentage >= 60 ? "Good Match!" : "Needs Improvement"}
                                            </h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                                Your resume aligns well with this position. {result.missing_skills.length > 0 ? "You have some of the required skills, but missing a few key keywords could impact your ATS ranking." : "You hit all the key keywords required for the role!"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Skills Breakdown */}
                                    <div className="space-y-4 mb-8">
                                        {/* Matched Skills */}
                                        {result.matched_skills && result.matched_skills.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Matched Skills</p>
                                                <motion.div
                                                    className="flex flex-wrap gap-2"
                                                    initial="hidden" animate="visible"
                                                    variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                                                >
                                                    {result.matched_skills.map((keyword: string) => (
                                                        <motion.span
                                                            key={keyword}
                                                            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400 border border-teal-200 dark:border-teal-800"
                                                        >
                                                            <Check className="h-[14px] w-[14px] mr-1" /> {keyword}
                                                        </motion.span>
                                                    ))}
                                                </motion.div>
                                            </div>
                                        )}

                                        {/* Missing Skills */}
                                        <div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Missing Skills</p>
                                            <motion.div
                                                className="flex flex-wrap gap-2"
                                                initial="hidden" animate="visible"
                                                variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                                            >
                                                {result.missing_skills.length > 0 ? (
                                                    result.missing_skills.map((keyword: string) => (
                                                        <motion.span
                                                            key={keyword}
                                                            variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"
                                                        >
                                                            <X className="h-[14px] w-[14px] mr-1" /> {keyword}
                                                        </motion.span>
                                                    ))
                                                ) : (
                                                    <motion.span
                                                        variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
                                                        className="text-sm text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full border border-green-200 dark:border-green-800/50 flex items-center w-fit"
                                                    >
                                                        <Check className="h-4 w-4 mr-1" /> None! You hit all major keywords.
                                                    </motion.span>
                                                )}
                                            </motion.div>
                                        </div>
                                    </div>

                                    {/* AI Banner */}
                                    <div className="mt-auto bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/10 rounded-lg p-4 border border-yellow-100 dark:border-yellow-800/30 flex gap-3">
                                        <div className="bg-white dark:bg-yellow-900/40 p-2 rounded-full h-fit shrink-0 shadow-sm">
                                            <Lightbulb className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-yellow-100 mb-1">AI Feedback Summary</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">&quot;{result.ai_recommendation}&quot;</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center justify-center h-full text-center py-20 opacity-60"
                                >
                                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                                        <Activity className="h-10 w-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Ready to analyze</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">Upload your resume and paste a job description to get instant AI-powered actionable feedback.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Recent Scans Section */}
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Scans</h2>
                        <div className="flex items-center gap-5">
                            {recentScans.length > 0 && (
                                <button
                                    onClick={clearHistory}
                                    className="text-[13px] text-red-500 font-bold hover:text-red-700 transition-colors"
                                >
                                    Clear History
                                </button>
                            )}
                            {recentScans.length > 5 && displayLimit < recentScans.length && (
                                <button
                                    onClick={() => setDisplayLimit(recentScans.length)}
                                    className="text-[13px] text-primary font-bold hover:text-primary-dark transition-colors"
                                >
                                    View All History
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentScans.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                            No recent scans found. Upload a resume to get started!
                                        </td>
                                    </tr>
                                ) : (
                                    recentScans.slice(0, displayLimit).map((scan) => (
                                        <tr key={scan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-8 rounded flex items-center justify-center font-bold text-xs uppercase
                                                        ${scan.score >= 80 ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                                                            scan.score >= 50 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30' :
                                                                'bg-red-100 text-red-600 dark:bg-red-900/30'}`}
                                                    >
                                                        {scan.title.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-1">{scan.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-1">{scan.company}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                                    ${scan.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                        scan.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                            'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                                                >
                                                    {scan.score}% Match
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                {getRelativeTime(scan.date)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => {
                                                            setResult(scan.fullResult);
                                                            // Auto scroll back to the top to see the results
                                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        }}
                                                        className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors hidden sm:block"
                                                    >
                                                        View Report
                                                    </button>
                                                    <div className="inline-flex items-center justify-center p-1.5 rounded-md text-slate-400 opacity-50 cursor-not-allowed transition-colors">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination / View All */}
                    {recentScans.length > displayLimit && (
                        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex justify-center">
                            <button
                                onClick={() => setDisplayLimit(prev => prev + 5)}
                                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium flex items-center gap-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-colors"
                            >
                                Show more history
                                <ChevronDown className="h-4 w-4 text-current" />
                            </button>
                        </div>
                    )}
                </div>

            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/60 bg-white/60 dark:bg-[#060D18]/60 backdrop-blur py-8 mt-auto">
                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        © 2026 SkillHire Inc. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Privacy Policy</Link>
                        <Link className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Terms of Service</Link>
                        <Link className="text-sm text-slate-500 hover:text-primary transition-colors" href="#">Help Center</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
