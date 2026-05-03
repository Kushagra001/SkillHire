'use client';

/**
 * ResponseRateBadge
 * -----------------
 * Tiny pill badge shown on job cards displaying the crowdsourced response rate
 * for that company.  Only renders when we have ≥ 3 votes (the API returns
 * hasData=false otherwise).
 *
 * Uses SWR-style manual fetch + local cache to avoid hammering the API when the
 * same company appears multiple times in the list.
 */

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface ResponseRateData {
    hasData: boolean;
    responseRate?: number;
    totalVotes?: number;
}

const cache: Record<string, ResponseRateData | 'loading'> = {};
const listeners: Record<string, ((data: ResponseRateData) => void)[]> = {};
const MAX_CACHE_SIZE = 500;

function clearCacheIfFull() {
    if (Object.keys(cache).length > MAX_CACHE_SIZE) {
        // Clear old entries to prevent memory leaks
        Object.keys(cache).forEach(key => {
            if (cache[key] !== 'loading') delete cache[key];
        });
    }
}

/**
 * Prime the cache for multiple companies at once to prevent N+1 fetching.
 */
export async function primeResponseRateCache(companies: string[]) {
    if (companies.length === 0) return;
    
    // Filter for companies not already in cache or loading
    const missing = companies.map(c => c.trim().toLowerCase()).filter(c => !cache[c]);
    if (missing.length === 0) return;

    clearCacheIfFull();

    // Mark as loading
    missing.forEach(c => { cache[c] = 'loading'; });

    try {
        const res = await fetch(`/api/response-rate?companies=${encodeURIComponent(missing.join(','))}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        missing.forEach(c => {
            const result = data[c] || { hasData: false };
            cache[c] = result;
            listeners[c]?.forEach(fn => fn(result));
            delete listeners[c];
        });
    } catch {
        missing.forEach(c => {
            delete cache[c];
            listeners[c]?.forEach(fn => fn({ hasData: false }));
            delete listeners[c];
        });
    }
}

function fetchResponseRate(company: string): Promise<ResponseRateData> {
    const key = company.toLowerCase().trim();

    if (cache[key] && cache[key] !== 'loading') {
        return Promise.resolve(cache[key] as ResponseRateData);
    }

    clearCacheIfFull();

    if (cache[key] === 'loading') {
        // Already in-flight — return a promise that resolves when the first request settles
        return new Promise((resolve) => {
            if (!listeners[key]) listeners[key] = [];
            listeners[key].push(resolve);
        });
    }

    cache[key] = 'loading';
    return fetch(`/api/response-rate?company=${encodeURIComponent(key)}`)
        .then(async (r) => {
            if (!r.ok) throw new Error('API error');
            return r.json();
        })
        .then((data: ResponseRateData) => {
            cache[key] = data;
            listeners[key]?.forEach((fn) => fn(data));
            delete listeners[key];
            return data;
        })
        .catch(() => {
            // Delete the cache entry so subsequent calls can trigger a fresh fetch
            delete cache[key];
            const err: ResponseRateData = { hasData: false };
            listeners[key]?.forEach((fn) => fn(err));
            delete listeners[key];
            return err;
        });
}

function getRateColor(rate: number): string {
    if (rate >= 70) return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-800/50';
    if (rate >= 40) return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-800/50';
    return 'text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950/40 dark:border-red-800/50';
}

interface Props {
    company: string;
    className?: string;
}

export function ResponseRateBadge({ company, className = '' }: Props) {
    const [data, setData] = useState<ResponseRateData | null>(null);

    useEffect(() => {
        if (!company) return;
        fetchResponseRate(company).then(setData);
    }, [company]);

    if (!data || !data.hasData || data.responseRate === undefined) return null;

    const color = getRateColor(data.responseRate);

    return (
        <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${color} ${className}`}
            title={`${data.totalVotes} user${data.totalVotes === 1 ? '' : 's'} reported on this company`}
        >
            <MessageCircle className="w-2.5 h-2.5 shrink-0" />
            {data.responseRate}% response
        </span>
    );
}
