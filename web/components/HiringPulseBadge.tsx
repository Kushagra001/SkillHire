'use client';

/**
 * HiringPulseBadge
 * -----------------
 * Tiny pill badge shown on job cards displaying the hiring velocity
 * for that company based on the number of jobs posted in the last 7 days.
 * 🔥 Hot (5+), 📈 Active (2-4), ⏸️ Slow (0-1)
 */

import { useEffect, useState } from 'react';
import { Flame, TrendingUp, Pause } from 'lucide-react';

interface HiringPulseData {
    company: string;
    newJobsCount: number;
}

// Global cache to fetch once per session
let globalCache: Record<string, number> | null = null;
let fetchPromise: Promise<Record<string, number>> | null = null;

function fetchHiringPulse(): Promise<Record<string, number>> {
    if (globalCache) return Promise.resolve(globalCache);
    if (fetchPromise) return fetchPromise;

    fetchPromise = fetch('/api/hiring-pulse')
        .then((r) => r.json())
        .then((data) => {
            const map: Record<string, number> = {};
            if (data.success && Array.isArray(data.companies)) {
                data.companies.forEach((c: HiringPulseData) => {
                    if (c.company) {
                        map[c.company.toLowerCase().trim()] = c.newJobsCount;
                    }
                });
            }
            globalCache = map;
            return map;
        })
        .catch(() => {
            const map = {};
            globalCache = map;
            return map;
        });

    return fetchPromise;
}

function getVelocityInfo(count: number) {
    if (count >= 5) {
        return {
            label: 'Hot',
            icon: Flame,
            color: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-800/50'
        };
    }
    if (count >= 2) {
        return {
            label: 'Active',
            icon: TrendingUp,
            color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/50'
        };
    }
    return {
        label: 'Slow',
        icon: Pause,
        color: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/50'
    };
}

interface Props {
    company: string;
    className?: string;
}

export function HiringPulseBadge({ company, className = '' }: Props) {
    const [count, setCount] = useState<number | null>(null);

    useEffect(() => {
        if (!company) return;
        fetchHiringPulse().then((map) => {
            const val = map[company.toLowerCase().trim()];
            // If not found, assume 1 (the job itself that triggered the badge exists)
            setCount(val !== undefined ? val : 1);
        });
    }, [company]);

    if (count === null) return null; // loading

    const { label, icon: Icon, color } = getVelocityInfo(count);

    return (
        <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${color} ${className}`}
            title={`${count} new job${count === 1 ? '' : 's'} posted in the last 7 days`}
        >
            <Icon className="w-2.5 h-2.5 shrink-0" />
            {label}
        </span>
    );
}
