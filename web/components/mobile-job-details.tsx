'use client';

import { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, MapPin, Briefcase, Share2, CheckCircle2, Wallet, Sparkles, Loader2, XCircle, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    created_at: string;
    apply_link: string;
    tags?: string[];
    is_locked?: boolean;
    job_type?: string;
    salary_status?: string;
    description?: string;
    match_percentage?: number;
    skills?: string[];
    formatted_about?: string;
    raw_data?: {
        description?: string | { text?: string; html?: string };
        snippet?: string;
        raw_snippet?: string;
        logo?: string;
    };
    logo?: string;
}

interface MobileJobDetailsProps {
    job: Job | null;
    onClose: () => void;
    onUnlock: () => void;
    isUnlocking: boolean;
}

export function MobileJobDetails({ job, onClose, onUnlock, isUnlocking }: MobileJobDetailsProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Quick Match state
    const [hasSavedResume, setHasSavedResume] = useState<boolean | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [matchResult, setMatchResult] = useState<any>(null);
    const [showFullReport, setShowFullReport] = useState(false);
    const [isUploadingBase, setIsUploadingBase] = useState(false);
    const [quotaExceeded, setQuotaExceeded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchResumeStatus = async () => {
            try {
                const res = await fetch('/api/user/resume');
                if (res.ok) {
                    const data = await res.json();
                    setHasSavedResume(data.hasSavedResume);
                }
            } catch (err) {
                console.error('Failed to fetch resume status', err);
            }
        };
        fetchResumeStatus();
    }, []);

    useEffect(() => {
        setShowFullDesc(false);
        setMatchResult(null);
        setShowFullReport(false);
        setQuotaExceeded(false);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (job) {
            setIsRendered(true);
            setTimeout(() => setIsVisible(true), 10);
            if (isMobile) document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            const timer = setTimeout(() => setIsRendered(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(timer);
        }
        return () => { document.body.style.overflow = ''; };
    }, [job]);

    if (!isRendered && !job) return null;

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

    const getJobDescription = (j: Job): string | undefined => {
        let text: string | undefined = j.description;
        if (!text) {
            const d = j.raw_data?.description;
            text = typeof d === 'object' && d !== null ? (d as { text?: string }).text : d as string | undefined;
            text = text || j.raw_data?.snippet || j.raw_data?.raw_snippet;
        }
        if (text) {
            return text
                .replace(/(?:\r?\n\s*){2,}/g, '\n\n')
                .replace(/([a-zA-Z])\s*\n\s*:/g, '$1:')
                .replace(/:\s*\n\s*\n/g, ':\n')
                .trim();
        }
        return undefined;
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    const handleQuickMatch = async () => {
        if (!job) return;
        setIsAnalyzing(true);
        setMatchResult(null);
        setQuotaExceeded(false);
        try {
            const formData = new FormData();
            formData.append('useSavedResume', 'true');
            formData.append('jobId', job._id);
            const jobDescription = getJobDescription(job) || job.formatted_about || job.title;
            formData.append('jobDescription', jobDescription);
            const res = await fetch('/api/analyze-resume', { method: 'POST', body: formData });
            if (res.status === 402) { setQuotaExceeded(true); return; }
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to analyze resume');
            }
            const data = await res.json();
            setMatchResult(data);
            setShowFullReport(false);
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to perform Quick Match');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleBaseUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingBase(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);
            const res = await fetch('/api/user/resume', { method: 'POST', body: formData });
            if (!res.ok) throw new Error('Failed to upload base resume');
            setHasSavedResume(true);
            handleQuickMatch();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to upload resume');
        } finally {
            setIsUploadingBase(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isVisible ? 'bg-black/40 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className={`
                w-full sm:max-w-md bg-white dark:bg-[#0B0F19] h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out
                ${isVisible ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]">
                    <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Job Details</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                    {job && (
                        <>
                            {/* Company + Title */}
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-16 w-16 shrink-0 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center justify-center p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={job.logo || `https://ui-avatars.com/api/?name=${job.company}&background=random&color=fff&size=64`}
                                        alt={`${job.company} logo`}
                                        className="h-full w-full object-contain"
                                        onError={(e) => {
                                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${job.company}&background=f3f4f6&color=6b7280&size=64`;
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">{job.title}</h1>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
                                        <CheckCircle2 className="h-4 w-4 text-[#41b4a5] fill-[#EAFBF9]" />
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5 text-slate-400" /> {job.location}
                                        </span>
                                        {job.job_type && (
                                            <span className="flex items-center gap-1.5">
                                                <Briefcase className="h-3.5 w-3.5 text-slate-400" /> {job.job_type}
                                            </span>
                                        )}
                                        {job.salary_status && job.salary_status !== "Not Disclosed" && (
                                            <span className="flex items-center gap-1.5">
                                                <Wallet className="h-3.5 w-3.5 text-[#41b4a5]" />
                                                <span className="text-[#41b4a5] font-medium">{job.salary_status}</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <Button className="w-full bg-[#41b4a5] hover:bg-[#369689] text-white font-bold h-12 rounded-xl mb-6 shadow-sm" asChild>
                                <a href={job.apply_link} target="_blank" rel="noopener noreferrer">Apply Now</a>
                            </Button>

                            {/* Tags */}
                            {job.tags && job.tags.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-3">Tags &amp; Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {job.tags.map((tag: string) => (
                                            <span key={tag} className="inline-flex items-center rounded-md bg-[#41b4a5]/10 px-2.5 py-1 text-xs font-semibold text-[#369689] ring-1 ring-inset ring-[#41b4a5]/20">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ── Quick Match Widget ── */}
                            <div className="mb-6 bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
                                <div className="relative flex flex-col sm:flex-row items-center justify-between p-4 gap-4 min-h-[72px]">
                                    {quotaExceeded ? (
                                        <div className="flex items-center gap-4 w-full justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20 shrink-0">
                                                    <XCircle className="h-5 w-5 text-red-500" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Daily Limit Reached</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Upgrade to Pro for unlimited scans.</p>
                                                </div>
                                            </div>
                                            <Button onClick={onUnlock} size="sm" className="bg-[#41b4a5] hover:bg-[#369689] text-white shrink-0 shadow-sm">Upgrade</Button>
                                        </div>
                                    ) : isAnalyzing ? (
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="flex h-10 w-10 items-center justify-center shrink-0">
                                                <Loader2 className="h-5 w-5 text-[#41b4a5] animate-spin" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Analyzing Match...</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Running ATS algorithms...</p>
                                            </div>
                                        </div>
                                    ) : matchResult ? (
                                        <div className="flex flex-col gap-3 w-full">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 shrink-0">
                                                    <svg className="h-full w-full transform -rotate-90" viewBox="0 0 56 56">
                                                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                                                        <circle
                                                            cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                            strokeDasharray="150.8"
                                                            strokeDashoffset={150.8 - (150.8 * matchResult.match_percentage) / 100}
                                                            className={matchResult.match_percentage >= 80 ? "text-green-500" : matchResult.match_percentage >= 50 ? "text-yellow-500" : "text-red-500"}
                                                            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[10px] font-bold text-slate-900 dark:text-white">{matchResult.match_percentage}%</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                        {matchResult.match_percentage >= 80 ? "Strong Match ✓" : matchResult.match_percentage >= 50 ? "Partial Match" : "Low Match"}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{matchResult.ai_recommendation}</p>
                                                </div>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <Button variant="outline" size="sm" onClick={() => setShowFullReport(!showFullReport)} className="text-xs border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">{showFullReport ? 'Hide' : 'View'}</Button>
                                                    <Button variant="ghost" size="sm" onClick={() => { setMatchResult(null); setShowFullReport(false); }} className="text-xs text-slate-400 hover:text-slate-600 px-1.5">✕</Button>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                                {showFullReport && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                                                            <div className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-lg p-3 border border-emerald-100/50 dark:border-emerald-900/30">
                                                                <h5 className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 uppercase mb-2 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" />Matched</h5>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {matchResult.matched_skills?.length > 0 ? matchResult.matched_skills.map((s: string, i: number) => (
                                                                        <span key={i} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded text-[10px] font-medium">{s}</span>
                                                                    )) : <span className="text-[10px] text-emerald-600/70 italic">No direct matches.</span>}
                                                                </div>
                                                            </div>
                                                            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-lg p-3 border border-red-100/50 dark:border-red-900/30">
                                                                <h5 className="text-[11px] font-bold text-red-800 dark:text-red-400 uppercase mb-2 flex items-center gap-1"><XCircle className="h-3 w-3" />Missing</h5>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {matchResult.missing_skills?.length > 0 ? matchResult.missing_skills.map((s: string, i: number) => (
                                                                        <span key={i} className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded text-[10px] font-medium">{s}</span>
                                                                    )) : <span className="text-[10px] text-red-600/70 italic">All requirements met!</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAFBF9] shrink-0 border border-[#41b4a5]/20">
                                                    <Sparkles className="h-4 w-4 text-[#41b4a5]" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Quick Match</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {hasSavedResume ? "Compare your resume instantly." : "Upload once to enable matching."}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 w-full sm:w-auto flex items-center justify-end mt-2 sm:mt-0">
                                                <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={handleBaseUpload} />
                                                {hasSavedResume === null ? (
                                                    <div className="h-8 w-24 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-md" />
                                                ) : hasSavedResume ? (
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            onClick={() => fileInputRef.current?.click()} 
                                                            className="text-[10px] text-slate-400 font-medium hover:text-[#41b4a5] hover:underline underline-offset-2 transition-colors"
                                                        >
                                                            Update
                                                        </button>
                                                        <Button onClick={handleQuickMatch} size="sm" disabled={isUploadingBase} className="bg-[#41b4a5] hover:bg-[#369689] text-white text-xs font-semibold shadow-sm h-8">
                                                            {isUploadingBase ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                                                            {isUploadingBase ? 'Uploading...' : 'Quick Match'}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={isUploadingBase} className="text-xs border-gray-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:text-[#41B3A3] hover:border-[#41B3A3] h-8">
                                                        {isUploadingBase ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UploadCloud className="h-4 w-4 mr-1" />}
                                                        Upload Resume
                                                    </Button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4 relative pb-20">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">About the Role</h4>
                                <div className={`text-slate-600 dark:text-slate-300 leading-[1.6] text-sm whitespace-pre-wrap break-words ${job.is_locked ? 'h-[500px] overflow-hidden relative' : !showFullDesc ? 'max-h-[300px] overflow-hidden relative' : ''}`}>
                                    {(() => {
                                        const text = getJobDescription(job);
                                        if (text) return text;
                                        return (
                                            <div className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg p-6 text-center mt-2">
                                                <p className="text-gray-500 dark:text-slate-400 mb-4">Detailed description available directly on the {job.company} portal.</p>
                                                {!job.is_locked && (
                                                    <Button variant="outline" asChild>
                                                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                                                            View Full Description <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        );
                                    })()}

                                    {/* Fade overlays */}
                                    {job.is_locked ? (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 dark:via-[#0B0F19]/60 to-white/95 dark:to-[#0B0F19]/98 backdrop-blur-[1px]" />
                                    ) : !showFullDesc && (
                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0B0F19] via-white/80 dark:via-[#0B0F19]/80 to-transparent flex items-end justify-center pb-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowFullDesc(true)} className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 font-medium">
                                                Read Full Description
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Paywall Overlay */}
                                {job.is_locked && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-100/50 dark:border-slate-700/50 w-full text-center relative overflow-hidden mx-4">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAFBF9] mb-3 relative z-10">
                                                <svg className="h-5 w-5 text-[#41B3A3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1 relative z-10">Beat the crowd.</h3>
                                            <p className="text-slate-500 dark:text-slate-400 mb-4 text-xs relative z-10 px-1">
                                                <span className="font-bold text-slate-900 dark:text-white">2025 Grads</span> are applying right now. Unlock instant access to beat the crowd.
                                            </p>
                                            <Button onClick={onUnlock} disabled={isUnlocking} className="w-full bg-[#41b4a5] hover:bg-[#369689] text-white font-bold h-10 text-sm shadow-sm relative z-10">
                                                {isUnlocking ? 'Unlocking...' : 'Unlock for ₹199/month'}
                                            </Button>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium relative z-10 mt-2">Cancel anytime.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer — share + apply */}
                <div className="bg-gray-50 dark:bg-slate-900/80 border-t border-gray-100 dark:border-slate-800 p-4 flex items-center gap-3 shrink-0 safe-area-bottom">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleShare}
                        className="text-slate-400 hover:text-[#41b4a5] dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 shrink-0"
                    >
                        {isCopied ? <CheckCircle2 className="h-5 w-5 text-[#41b4a5]" /> : <Share2 className="h-5 w-5" />}
                    </Button>
                    {job?.is_locked ? (
                        <Button onClick={onUnlock} disabled={isUnlocking} className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold px-6 h-10 rounded-lg shadow-sm flex-1">
                            {isUnlocking ? 'Unlocking...' : 'Unlock to Apply'}
                        </Button>
                    ) : (
                        <Button className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold px-6 h-10 rounded-lg shadow-sm flex-1" asChild>
                            <a href={job?.apply_link} target="_blank" rel="noopener noreferrer">Apply</a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
