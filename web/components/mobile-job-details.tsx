'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, MapPin, Clock, Lock, Briefcase, Bookmark, Share2, CheckCircle2, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

    useEffect(() => {
        setShowFullDesc(false);
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
        if (job) {
            setIsRendered(true);
            setTimeout(() => setIsVisible(true), 10);
            // Only lock body scroll on mobile — desktop uses its own scroll container
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

    const formatSource = (tag?: string) => {
        if (!tag) return 'Direct';
        if (tag.includes('Apify')) return 'Aggregator';
        if (tag.includes('SerpApi')) return 'Google Jobs';
        return tag;
    }

    const getBatch = (tags?: string[]) => {
        const batchTag = tags?.find(t => t.toLowerCase().includes('batch'));
        return batchTag ? batchTag.replace(/Batch:?/i, '').trim() : 'Any';
    }

    return (
        <div className={`fixed inset-0 z-50 flex justify-end transition-opacity duration-300 ${isVisible ? 'bg-black/20 backdrop-blur-sm' : 'bg-transparent pointer-events-none'}`}>
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />

            <div className={`
                w-full sm:max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out
                ${isVisible ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Job Details</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                    {job && (
                        <>
                            <div className="flex items-start gap-4 mb-6">
                                <div className="h-16 w-16 shrink-0 bg-white rounded-xl border border-gray-100 shadow-sm flex items-center justify-center p-2">
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
                                    <h1 className="text-xl font-bold text-slate-900 leading-tight mb-2">{job.title}</h1>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-base font-medium text-slate-700">{job.company}</span>
                                        <CheckCircle2 className="h-4 w-4 text-[#41b4a5] fill-[#EAFBF9]" />
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
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
                            <div className="mb-6">
                                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Tags & Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {job.tags?.map((tag: string) => (
                                        <span key={tag} className="inline-flex items-center rounded-md bg-[#41b4a5]/10 px-2.5 py-1 text-xs font-semibold text-[#369689] ring-1 ring-inset ring-[#41b4a5]/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Matches */}
                            <div className="mb-6 bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600 font-bold text-xs ring-4 ring-white">
                                    68%
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">Good Match</h4>
                                    <p className="text-xs text-slate-600">Missing 2 potential keywords.</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-4 relative pb-20">
                                <h4 className="text-sm font-bold text-slate-900">About the Role</h4>
                                <div className={`text-slate-600 leading-[1.6] text-sm whitespace-pre-wrap break-words ${job.is_locked ? 'h-[500px] overflow-hidden relative' : !showFullDesc ? 'max-h-[300px] overflow-hidden relative' : ''}`}>
                                    {(() => {
                                        let text: string | undefined = job.description;

                                        if (!text) {
                                            const d = job.raw_data?.description;
                                            text = typeof d === 'object' && d !== null ? (d as { text?: string }).text : d as string | undefined;
                                            text = text || job.raw_data?.snippet || job.raw_data?.raw_snippet;
                                        }

                                        if (text) {
                                            return text
                                                .replace(/(?:\r?\n\s*){2,}/g, '\n\n')
                                                .replace(/([a-zA-Z])\s*\n\s*:/g, '$1:')
                                                .replace(/:\s*\n\s*\n/g, ':\n')
                                                .trim();
                                        }

                                        return (
                                            <div className="bg-gray-50 border border-gray-100 rounded-lg p-6 text-center mt-2">
                                                <p className="text-gray-500 mb-4">Detailed description available directly on the {job.company} portal.</p>
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

                                    {/* Floor Fade Gradient */}
                                    {job.is_locked ? (
                                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white/95 backdrop-blur-[1px]" />
                                    ) : !showFullDesc && (
                                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowFullDesc(true)} className="bg-white/90 backdrop-blur-sm shadow-sm hover:bg-gray-50 text-slate-700 border-gray-200 font-medium">
                                                Read Full Description
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Paywall Overlay */}
                                {job.is_locked && (
                                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center">
                                        <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-100/50 w-full text-center relative overflow-hidden mx-4">
                                            <div className="absolute -top-10 -left-10 w-24 h-24 bg-[#41b4a5]/10 rounded-full blur-2xl"></div>
                                            <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>

                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#EAFBF9] mb-3 relative z-10">
                                                <Lock className="h-5 w-5 text-[#41B3A3]" />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-1 relative z-10">Beat the crowd.</h3>
                                            <p className="text-slate-500 mb-4 text-xs relative z-10 px-1">
                                                <span className="font-bold text-slate-900">2025 Grads</span> are applying right now. Unlock instant access to beat the crowd.
                                            </p>
                                            <Button
                                                onClick={onUnlock}
                                                disabled={isUnlocking}
                                                className="w-full bg-[#41b4a5] hover:bg-[#369689] text-white font-bold h-10 text-sm shadow-sm relative z-10"
                                            >
                                                {isUnlocking ? 'Unlocking...' : 'Unlock for ₹199/month'}
                                            </Button>
                                            <p className="text-[10px] text-slate-400 font-medium relative z-10 mt-2">
                                                Cancel anytime.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-4 flex items-center justify-between shrink-0 safe-area-bottom">
                    <Button variant="outline" size="icon" className="text-slate-400 hover:text-[#41b4a5]">
                        <Bookmark className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="icon" className="text-slate-400 hover:text-[#41b4a5]">
                        <Share2 className="h-5 w-5" />
                    </Button>
                    {job?.is_locked ? (
                        <Button
                            onClick={onUnlock}
                            disabled={isUnlocking}
                            className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold px-6 h-10 rounded-lg shadow-sm flex-1 ml-4"
                        >
                            {isUnlocking ? 'Unlocking...' : 'Unlock to Apply'}
                        </Button>
                    ) : (
                        <Button className="bg-[#41b4a5] hover:bg-[#369689] text-white font-bold px-6 h-10 rounded-lg shadow-sm flex-1 ml-4" asChild>
                            <a href={job?.apply_link} target="_blank" rel="noopener noreferrer">Apply</a>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
