"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from "@clerk/nextjs";
import { CompanyLogo } from '@/components/CompanyLogo';
import { Button } from '@/components/ui/button';
import { Loader2, ExternalLink, Briefcase, Trash2, Calendar, MapPin } from 'lucide-react';
import { TrackerStatus } from '@/models/TrackedJob';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface TrackedJobItem {
    _id: string;
    clerk_id: string;
    job_id: string;
    title: string;
    company: string;
    location: string;
    logo?: string;
    apply_link: string;
    status: TrackerStatus;
    notes?: string;
    created_at: string;
    updated_at: string;
}

const STATUS_COLUMNS: TrackerStatus[] = ['Saved', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected'];

const STATUS_COLORS: Record<TrackerStatus, string> = {
    Saved: 'bg-slate-100 text-slate-700 border-slate-200',
    Applied: 'bg-blue-50 text-blue-700 border-blue-200',
    Responded: 'bg-purple-50 text-purple-700 border-purple-200',
    Interview: 'bg-amber-50 text-amber-700 border-amber-200',
    Offer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
};

export default function TrackerPage() {
    const { isLoaded, isSignedIn } = useAuth();
    const [jobs, setJobs] = useState<TrackedJobItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;
        
        const fetchJobs = async () => {
            try {
                const res = await fetch('/api/tracker');
                if (res.ok) {
                    const data = await res.json();
                    setJobs(data);
                }
            } catch (err) {
                console.error("Failed to fetch tracker jobs", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [isLoaded, isSignedIn]);

    const handleStatusChange = async (id: string, newStatus: TrackerStatus) => {
        // Optimistic update
        setJobs(prev => prev.map(job => job._id === id ? { ...job, status: newStatus } : job));

        try {
            const res = await fetch(`/api/tracker/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!res.ok) {
                throw new Error("Failed to update status");
            }
        } catch (error) {
            console.error(error);
            // Revert on error (simple refresh for now)
            window.location.reload();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to remove this job from your tracker?")) return;
        
        setJobs(prev => prev.filter(job => job._id !== id));
        try {
            await fetch(`/api/tracker/${id}`, { method: 'DELETE' });
        } catch (error) {
            console.error(error);
            window.location.reload();
        }
    };

    if (!isLoaded || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19]">
                <Loader2 className="h-8 w-8 animate-spin text-[#41b4a5]" />
            </div>
        );
    }

    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#0B0F19] p-6">
                <Briefcase className="h-16 w-16 text-slate-300 mb-4" />
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Application Tracker</h1>
                <p className="text-slate-500 mb-6 text-center max-w-md">Sign in to track your job applications, monitor your pipeline, and manage interviews.</p>
                <Button asChild className="bg-[#41b4a5] hover:bg-[#369689] text-white">
                    <Link href="/login">Sign In</Link>
                </Button>
            </div>
        );
    }

    const groupedJobs = STATUS_COLUMNS.reduce((acc, status) => {
        acc[status] = jobs.filter(j => j.status === status);
        return acc;
    }, {} as Record<TrackerStatus, TrackedJobItem[]>);

    const totalApplied = jobs.filter(j => j.status !== 'Saved').length;
    const totalResponses = jobs.filter(j => ['Responded', 'Interview', 'Offer', 'Rejected'].includes(j.status)).length;
    const responseRate = totalApplied > 0 ? Math.round((totalResponses / totalApplied) * 100) : 0;

    return (
        <div className="min-h-screen bg-[#f9fbfb] dark:bg-[#060D18] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#41b4a5]/30 selection:text-[#369689]">
            {/* Header section with gradient and blur */}
            <div className="relative pt-24 pb-16 overflow-hidden border-b border-gray-200 dark:border-slate-800/60 bg-white dark:bg-[#0B0F19]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#41b4a5]/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#41b4a5] transition-colors mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right rotate-180"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        Back to Jobs
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-3">
                                Job Tracker
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                Manage your application pipeline in one place.
                            </p>
                        </div>
                    
                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm min-w-[120px]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Apps</p>
                            <p className="text-2xl font-bold text-[#41b4a5]">{totalApplied}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm min-w-[120px]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Response Rate</p>
                            <p className="text-2xl font-bold text-indigo-500">{responseRate}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbar gap-6 h-[calc(100vh-220px)] min-h-[500px]">
                    {STATUS_COLUMNS.map(status => (
                        <div key={status} className="flex-none w-[320px] snap-center flex flex-col bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-bold text-slate-700 dark:text-slate-300">{status}</h3>
                                <span className="bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                                    {groupedJobs[status].length}
                                </span>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                                {groupedJobs[status].length === 0 ? (
                                    <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center">
                                        <p className="text-sm text-slate-400 font-medium">Empty</p>
                                    </div>
                                ) : (
                                    groupedJobs[status].map(job => (
                                        <div key={job._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700 relative group transition-all hover:shadow-md">
                                            <div className="flex items-start justify-between mb-3">
                                                <CompanyLogo company={job.company} logo={job.logo} size="sm" />
                                                <select 
                                                    value={job.status}
                                                    onChange={(e) => handleStatusChange(job._id, e.target.value as TrackerStatus)}
                                                    className={`text-xs font-semibold rounded-md px-2 py-1 border outline-none cursor-pointer ${STATUS_COLORS[job.status]} appearance-none`}
                                                >
                                                    {STATUS_COLUMNS.map(s => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            
                                            <Link href={`/jobs?jobId=${job.job_id}`} className="block group-hover:text-[#41b4a5] transition-colors">
                                                <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-1">{job.title}</h4>
                                                <p className="text-sm text-slate-500 mb-3">{job.company}</p>
                                            </Link>
                                            
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 dark:border-slate-700/50">
                                                <div className="flex items-center text-xs text-slate-400 gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(job.updated_at), { addSuffix: true })}
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {job.apply_link && (
                                                        <a href={job.apply_link} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-[#41b4a5] hover:bg-teal-50 rounded-md transition-colors">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </a>
                                                    )}
                                                    <button onClick={() => handleDelete(job._id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
