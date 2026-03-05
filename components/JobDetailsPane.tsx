"use client";

import { MapPin, Briefcase, Wallet, CheckCircle2, Lock, ExternalLink, Share2, FileText, UploadCloud, Loader2, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Job {
    _id: string;
    title: string;
    company: string;
    location: string;
    created_at: string;
    apply_link: string;
    tags?: string[];
    skills?: string[];
    is_locked?: boolean;
    job_type?: string;
    salary_status?: string;
    experience?: string;
    batch?: string[];
    formatted_about?: string;
    description?: string;
    raw_data?: {
        description?: string | { text?: string; html?: string };
        snippet?: string;
        raw_snippet?: string;
        logo?: string;
    };
    logo?: string;
}

const getBatch = (job: Job) => {
    if (job.batch && job.batch.length > 0 && !job.batch.includes("Any")) {
        return job.batch.join(', ');
    }
    const batchTag = job.tags?.find(t => t.toLowerCase().includes('batch'));
    return batchTag ? batchTag.replace(/Batch:?/i, '').trim() : 'Any';
}

const getJobDescription = (job: Job): string | undefined => {
    let text: string | undefined = job.description;
    if (!text) {
        const d = job.raw_data?.description;
        if (typeof d === 'object' && d !== null) {
            text = d.text;
        } else {
            text = (d as string | undefined) || job.raw_data?.snippet || job.raw_data?.raw_snippet;
        }
    }

    if (text) {
        return text
            .replace(/(?:\r?\n\s*){2,}/g, '\n\n') // Squash all multi-newlines into exactly one blank line
            .replace(/([a-zA-Z])\s*\n\s*:/g, '$1:') // Fix floating colons like "Position Summary \n:"
            .replace(/:\s*\n\s*\n/g, ':\n') // Single newline after colons looks cleaner
            .trim();
    }
    return undefined;
};

const formatMarkdown = (text: string) => {
    if (!text) return null;
    const html = text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // checkmarks
        .replace(/✅/g, '<span class="text-emerald-500 mr-2">✅</span>')
        .replace(/\n/g, '<br />');

    return <div dangerouslySetInnerHTML={{ __html: html }} className="text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed text-sm" />;
};

export function JobDetailsPane({ job, onUnlock, isUnlocking }: { job: Job | null, onUnlock: () => void, isUnlocking: boolean }) {
    const [isCopied, setIsCopied] = useState(false);
    const [showFullDesc, setShowFullDesc] = useState(false);

    // AI Resume Matcher State
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
                console.error("Failed to fetch resume status", err);
            }
        };
        fetchResumeStatus();
    }, []);

    useEffect(() => {
        setShowFullDesc(false);
        setMatchResult(null);
        setShowFullReport(false);
        setQuotaExceeded(false);
    }, [job?._id]);

    const handleQuickMatch = async () => {
        if (!job) return;
        setIsAnalyzing(true);
        setMatchResult(null);
        setQuotaExceeded(false);

        try {
            const formData = new FormData();
            formData.append('useSavedResume', 'true');
            formData.append('jobId', job._id);

            // Fallback (mostly for un-saved resume parsing or if DB fetch fails)
            const jobDescription = getJobDescription(job) || job.formatted_about || job.title;
            formData.append('jobDescription', jobDescription);

            const res = await fetch('/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            if (res.status === 402) {
                setQuotaExceeded(true);
                return;
            }

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to analyze resume');
            }

            const data = await res.json();
            setMatchResult(data);
            setShowFullReport(false);

            // Save to recent scans history
            try {
                const existingScansStr = localStorage.getItem('skillhire_recent_scans');
                const existingScans = existingScansStr ? JSON.parse(existingScansStr) : [];
                const newScan = {
                    title: job.title || 'Unknown Role',
                    company: job.company || 'Unknown Company',
                    score: data.match_percentage,
                    date: new Date().toISOString(),
                    id: Math.random().toString(36).substring(7),
                    fullResult: data
                };
                const updatedScans = [newScan, ...existingScans].slice(0, 50);
                localStorage.setItem('skillhire_recent_scans', JSON.stringify(updatedScans));
            } catch (e) {
                console.error("Failed to save to history", e);
            }

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

            const res = await fetch('/api/user/resume', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to upload base resume');
            }

            setHasSavedResume(true);
            // Auto trigger match right after successful upload
            handleQuickMatch();
        } catch (error: any) {
            console.error(error);
            alert(error.message || 'Failed to upload resume');
        } finally {
            setIsUploadingBase(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link", err);
        }
    };

    if (!job) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                Select a job to view details
            </div>
        );
    }

    const batchStr = getBatch(job);

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-transparent relative">
            <div className={`relative flex-1 overflow-y-auto custom-scrollbar p-6 ${job.is_locked ? 'overflow-hidden' : ''}`}>
                <div className="sticky top-0 bg-white dark:bg-[#0B0F19]/95 z-10 pb-4 mb-4 border-b border-gray-100 dark:border-slate-800/60 shadow-sm flex flex-col xl:flex-row gap-6 items-start">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm flex items-center justify-center">
                        <img
                            key={job._id}
                            src={job.logo || job.raw_data?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=128`}
                            alt={job.company}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                                const target = e.currentTarget as HTMLImageElement;
                                target.onerror = null;
                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(job.company)}&background=random&color=fff&size=128`;
                            }}
                        />
                    </div>
                    <div className="flex-1 w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{job.title}</h2>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="text-lg font-medium text-slate-700 dark:text-slate-300">{job.company}</span>
                                    <CheckCircle2 className="h-5 w-5 text-[#41b4a5] fill-[#EAFBF9]" />
                                </div>
                            </div>

                            {job.is_locked ? (
                                <Button
                                    onClick={onUnlock}
                                    disabled={isUnlocking}
                                    className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold py-6 px-8 rounded-lg shadow-sm transition-colors text-base shrink-0"
                                >
                                    {isUnlocking ? 'Unlocking...' : 'Unlock to Apply'}
                                </Button>
                            ) : (
                                <Button
                                    className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold py-6 px-8 rounded-lg shadow-sm transition-colors text-base shrink-0"
                                    asChild
                                >
                                    <a href={job.apply_link} target="_blank" rel="noopener noreferrer">Apply Now</a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    {/* Main Content Column */}
                    <div className="flex-1 min-w-0">
                        {/* Dynamic Metadata Container */}
                        <div className="flex flex-wrap gap-4 mb-8">
                            {job.location && job.location !== "Unknown" && (
                                <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Location</span>
                                    <p className="text-sm font-bold text-[#0A3D62] dark:text-[#41b4a5] mt-1">{job.location}</p>
                                </div>
                            )}

                            {job.salary_status && job.salary_status !== "Not Disclosed" && job.salary_status !== "Not Mentioned" && (
                                <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Stipend / Salary</span>
                                    <p className="text-sm font-bold text-[#0A3D62] dark:text-[#41b4a5] mt-1">{job.salary_status}</p>
                                </div>
                            )}

                            {job.experience && job.experience !== "Not Disclosed" && job.experience !== "Unknown" && (
                                <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                                    <p className="text-sm font-bold text-[#0A3D62] dark:text-[#41b4a5] mt-1">{job.experience}</p>
                                </div>
                            )}

                            {batchStr && batchStr !== "Any" && (
                                <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Batch</span>
                                    <p className="text-sm font-bold text-[#0A3D62] dark:text-[#41b4a5] mt-1">{batchStr}</p>
                                </div>
                            )}

                            {job.job_type && job.job_type !== "Unknown" && (
                                <div className="flex-1 min-w-[120px] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Type</span>
                                    <p className="text-sm font-bold text-[#0A3D62] dark:text-[#41b4a5] mt-1">{job.job_type}</p>
                                </div>
                            )}

                        </div>

                        {job.skills && job.skills.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tags & Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.skills.map((skill: string) => (
                                        <span key={skill} className="inline-flex items-center rounded-md bg-[#41b4a5]/10 px-2.5 py-1 text-xs font-semibold text-[#369689] ring-1 ring-inset ring-[#41b4a5]/20">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Horizontal Resume Matcher Widget */}
                        <div className="relative flex flex-col sm:flex-row items-center justify-between p-4 bg-white dark:bg-slate-800/40 border border-gray-200 dark:border-slate-700/50 rounded-xl shadow-sm mb-6 gap-4 min-h-[80px] overflow-hidden transition-all duration-300">
                            {quotaExceeded ? (
                                <div className="flex items-center gap-4 w-full justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 shrink-0">
                                            <XCircle className="h-6 w-6 text-red-500" />
                                        </div>
                                        <div className="flex flex-col flex-1">
                                            <h4 className="text-sm font-bold text-slate-900">Daily Limit Reached</h4>
                                            <p className="text-xs text-slate-500 line-clamp-2">
                                                You've used your 3 free AI matches today. Upgrade to Pro for unlimited scans.
                                            </p>
                                        </div>
                                    </div>
                                    <Button onClick={onUnlock} size="sm" className="bg-[#41b4a5] hover:bg-[#369689] text-white shrink-0 shadow-sm">
                                        Upgrade
                                    </Button>
                                </div>
                            ) : isAnalyzing ? (
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex h-12 w-12 items-center justify-center shrink-0">
                                        <Loader2 className="h-6 w-6 text-[#41b4a5] animate-spin" />
                                    </div>
                                    <div className="flex flex-col">
                                        <h4 className="text-sm font-bold text-slate-900">Analyzing Match...</h4>
                                        <p className="text-xs text-slate-500">
                                            Running ATS algorithms against your saved resume.
                                        </p>
                                    </div>
                                </div>
                            ) : matchResult ? (
                                <div className="flex flex-col gap-3 w-full">
                                    {/* Score row */}
                                    <div className="flex items-center gap-4">
                                        <div className="relative h-14 w-14 shrink-0">
                                            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 56 56">
                                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                                                <circle
                                                    cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                                                    strokeDasharray="150.8"
                                                    strokeDashoffset={150.8 - (150.8 * matchResult.match_percentage) / 100}
                                                    className={
                                                        matchResult.match_percentage >= 80 ? "text-green-500" :
                                                            matchResult.match_percentage >= 50 ? "text-yellow-500" :
                                                                "text-red-500"
                                                    }
                                                    style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                <span className="text-[11px] font-bold text-slate-900">{matchResult.match_percentage}%</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-slate-900">
                                                {matchResult.match_percentage >= 80 ? "Strong Match ✓" : matchResult.match_percentage >= 50 ? "Partial Match" : "Low Match"}
                                            </h4>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                {matchResult.ai_recommendation}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setShowFullReport(!showFullReport)}
                                                className="text-xs border-gray-300 text-slate-700"
                                            >
                                                {showFullReport ? 'Hide' : 'Full Report'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setMatchResult(null); setShowFullReport(false); }}
                                                className="text-xs text-slate-400 hover:text-slate-600 px-2"
                                            >
                                                Reset
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Expandable Report Content */}
                                    <AnimatePresence>
                                        {showFullReport && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100 mt-1">
                                                    <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100/50">
                                                        <h5 className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Matched Skills
                                                        </h5>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {matchResult.matched_skills && matchResult.matched_skills.length > 0 ? (
                                                                matchResult.matched_skills.map((skill: string, i: number) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-white border border-emerald-200 text-emerald-700 rounded text-[10px] font-medium shadow-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-emerald-600/70 italic">No direct matches found.</span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="bg-red-50/50 rounded-lg p-3 border border-red-100/50">
                                                        <h5 className="text-[11px] font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                                            <XCircle className="h-3 w-3" />
                                                            Missing Skills
                                                        </h5>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {matchResult.missing_skills && matchResult.missing_skills.length > 0 ? (
                                                                matchResult.missing_skills.map((skill: string, i: number) => (
                                                                    <span key={i} className="px-2 py-0.5 bg-white border border-red-200 text-red-700 rounded text-[10px] font-medium shadow-sm">
                                                                        {skill}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-red-600/70 italic">Resume hits all major requirements!</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAFBF9] shrink-0 border border-[#41b4a5]/20">
                                            <Sparkles className="h-5 w-5 text-[#41b4a5]" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-bold text-slate-900">One-Click Resume Match</h4>
                                            <p className="text-xs text-slate-500 pr-2">
                                                {hasSavedResume
                                                    ? "Compare your saved base resume against this role instantly."
                                                    : "Upload your base resume once to enable instant matching."}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0 flex justify-end">
                                        {hasSavedResume === null ? (
                                            <div className="h-8 w-24 bg-slate-100 animate-pulse rounded-md"></div>
                                        ) : hasSavedResume ? (
                                            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-[10px] text-slate-400 font-medium hover:text-[#41b4a5] hover:underline underline-offset-2 transition-colors order-2 sm:order-1"
                                                >
                                                    Update Resume
                                                </button>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleBaseUpload}
                                                />
                                                <Button
                                                    onClick={handleQuickMatch}
                                                    size="sm"
                                                    disabled={isUploadingBase}
                                                    className="bg-[#41b4a5] hover:bg-[#369689] text-white w-full sm:w-auto text-xs font-semibold shadow-sm order-1 sm:order-2"
                                                >
                                                    {isUploadingBase ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Sparkles className="h-4 w-4 mr-1" />}
                                                    {isUploadingBase ? 'Uploading...' : 'Quick Match'}
                                                </Button>
                                            </div>
                                        ) : (
                                            <>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    className="hidden"
                                                    ref={fileInputRef}
                                                    onChange={handleBaseUpload}
                                                />
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isUploadingBase}
                                                    className="w-full sm:w-auto text-xs border-gray-300 text-slate-700 hover:text-[#41B3A3] hover:border-[#41B3A3] hover:bg-[#41B3A3]/5"
                                                >
                                                    {isUploadingBase ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UploadCloud className="h-4 w-4 mr-1" />}
                                                    Upload Base Resume
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-6 relative">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b border-gray-100 dark:border-slate-800/60 pb-2">About the Role</h4>
                                <div className={`text-slate-600 dark:text-slate-300 leading-[1.6] text-sm whitespace-pre-wrap break-words ${job.is_locked ? 'h-[500px] overflow-hidden relative' : !showFullDesc ? 'max-h-[300px] overflow-hidden relative' : ''}`}>

                                    {job.formatted_about ? (
                                        <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-li:my-1 text-slate-600 dark:text-slate-300">
                                            {formatMarkdown(job.formatted_about)}
                                        </div>
                                    ) : getJobDescription(job) ? (
                                        getJobDescription(job)
                                    ) : (
                                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-10 text-center flex flex-col items-center justify-center min-h-[250px]">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white mb-4 shadow-sm">
                                                <FileText className="h-6 w-6 text-slate-400" />
                                            </div>
                                            <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                                The detailed description for this role is available directly on the <span className="font-semibold text-slate-700">{job.company}</span> portal.
                                            </p>
                                            {!job.is_locked && (
                                                <Button variant="outline" asChild className="bg-white hover:bg-gray-50 border-gray-200 text-slate-700 shadow-sm">
                                                    <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                                                        View Full Description <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    )}

                                    {job.is_locked ? (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 dark:via-[#0B0F19]/60 to-white/95 dark:to-[#0B0F19]/98 backdrop-blur-[1px]" />
                                    ) : !showFullDesc && (
                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-[#0B0F19] via-white/80 dark:via-[#0B0F19]/80 to-transparent flex items-end justify-center pb-2">
                                            <button
                                                onClick={() => setShowFullDesc(true)}
                                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm rounded-full px-4 py-1.5 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-[#41b4a5] hover:border-[#41b4a5]/40 transition-all"
                                            >
                                                Read Full Description
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Paywall Overlay */}
                            {job.is_locked && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                    <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-100/50 max-w-[380px] w-full text-center relative overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                                        <div className="absolute -top-16 -left-16 w-40 h-40 bg-[#41b4a5]/10 rounded-full blur-3xl"></div>
                                        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl"></div>

                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#EAFBF9] mb-4 relative z-10">
                                            <Lock className="h-6 w-6 text-[#41B3A3]" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-slate-900 mb-2 relative z-10">Beat the crowd.</h3>
                                        <p className="text-slate-500 mb-6 text-sm leading-relaxed relative z-10 px-2">
                                            <span className="font-bold text-slate-900">2026 Grads</span> are applying right now. Unlock instant access to beat the crowd.
                                        </p>

                                        <Button
                                            onClick={onUnlock}
                                            disabled={isUnlocking}
                                            className="w-full bg-[#41b4a5] hover:bg-[#369689] text-white font-bold h-12 text-base rounded-xl shadow-lg shadow-[#41b4a5]/20 mb-3 relative z-10"
                                        >
                                            {isUnlocking ? 'Unlocking...' : 'Unlock for ₹199/month'}
                                        </Button>

                                        <p className="text-[10px] text-slate-400 font-medium relative z-10">
                                            Cancel anytime. 100% money-back guarantee.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detail Footer */}
                    <div className="bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800/60 p-4 flex items-center justify-end shrink-0">
                        <div className="flex gap-2">
                            <button
                                onClick={handleShare}
                                className="p-2 px-3 rounded-lg border border-gray-300 text-slate-600 hover:bg-gray-100 transition-colors flex items-center justify-center min-w-[40px] gap-1.5"
                            >
                                {isCopied ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4 text-[#41B3A3]" />
                                        <span className="text-xs font-semibold text-[#41B3A3]">Copied</span>
                                    </>
                                ) : (
                                    <Share2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
