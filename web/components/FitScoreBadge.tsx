'use client';

import { useEffect, useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserProfile {
    hasSavedResume: boolean;
    skills: string[];
}

// Global cache for user profile to avoid refetching on every card
let userProfileCache: UserProfile | null = null;
let profileLoading = false;
const profileListeners: Array<(profile: UserProfile) => void> = [];

async function fetchUserProfile(): Promise<UserProfile> {
    if (userProfileCache) return userProfileCache;

    if (profileLoading) {
        return new Promise((resolve) => {
            profileListeners.push(resolve);
        });
    }

    profileLoading = true;
    const fallback: UserProfile = { hasSavedResume: false, skills: [] };
    try {
        const res = await fetch('/api/user/resume');
        const data = await res.json();
        userProfileCache = {
            hasSavedResume: data.hasSavedResume,
            skills: (data.skills || []).map((s: string) => s.toLowerCase().trim())
        };
        profileListeners.forEach(resolve => resolve(userProfileCache!));
        profileListeners.length = 0;
        return userProfileCache;
    } catch (err) {
        console.error('Failed to fetch user profile for matching:', err);
        profileListeners.forEach(resolve => resolve(fallback));
        profileListeners.length = 0;
        return fallback;
    } finally {
        profileLoading = false;
    }
}

interface FitScoreBadgeProps {
    techStack: string[];
    className?: string;
}

export function FitScoreBadge({ techStack, className }: FitScoreBadgeProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        fetchUserProfile().then(setProfile);
    }, []);

    if (!profile || !profile.hasSavedResume || !techStack || techStack.length === 0) {
        return null;
    }

    const jobSkills = techStack.map(s => s.toLowerCase().trim());
    const matched = jobSkills.filter(jobSkill => 
        profile.skills.some(userSkill => {
            const u = userSkill.toLowerCase();
            const s = jobSkill.toLowerCase();
            if (u === s) return true;
            
            // Use word boundary check to prevent "C" matching "CSS"
            // but allow "AWS" matching "AWS Lambda" or "React" matching "React.js"
            try {
                const regex = new RegExp(`\\b${s}\\b`, 'i');
                return regex.test(u);
            } catch (e) {
                return u.includes(s); // Fallback for special characters
            }
        })
    );
    const missing = jobSkills.filter(skill => !matched.some(m => m === skill));

    const score = Math.round((matched.length / jobSkills.length) * 100);

    const getColors = () => {
        if (score >= 70) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
        if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
        return "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
    };

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-default",
                        getColors(),
                        className
                    )}>
                        <Sparkles className="h-3 w-3" />
                        <span>Fit: {score}%</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent className="p-3 max-w-[240px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">Profile Match</span>
                            <span className={cn("text-xs font-black", score >= 70 ? "text-emerald-600" : score >= 40 ? "text-amber-600" : "text-slate-500")}>
                                {score}%
                            </span>
                        </div>
                        
                        {matched.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Your Matches</p>
                                <div className="flex flex-wrap gap-1">
                                    {matched.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-500/20 capitalize">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {missing.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gap</p>
                                <div className="flex flex-wrap gap-1">
                                    {missing.map(s => (
                                        <span key={s} className="px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[10px] text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700 capitalize">
                                            {s}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <p className="text-[9px] text-slate-400 italic pt-1 flex items-center gap-1 border-t border-slate-100 dark:border-slate-800">
                            <Info className="h-2.5 w-2.5" />
                            Based on your saved resume
                        </p>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
