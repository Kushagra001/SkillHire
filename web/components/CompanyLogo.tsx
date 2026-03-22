"use client";

import React, { useState } from 'react';

// A hand-picked palette of branded, professional colors for initials badges.
// Deterministically assigned based on the company name's char code sum.
const BADGE_COLORS = [
    { bg: '#0F172A', text: '#94a3b8' }, // Slate dark
    { bg: '#1E3A5F', text: '#93c5fd' }, // Navy
    { bg: '#14532d', text: '#86efac' }, // Forest green
    { bg: '#3b0764', text: '#d8b4fe' }, // Deep purple
    { bg: '#431407', text: '#fdba74' }, // Burnt orange
    { bg: '#0c4a6e', text: '#7dd3fc' }, // Deep blue
    { bg: '#4a1942', text: '#f0abfc' }, // Mauve
    { bg: '#1c1917', text: '#d6d3d1' }, // Charcoal
    { bg: '#052e16', text: '#4ade80' }, // Dark emerald
    { bg: '#172554', text: '#93c5fd' }, // Midnight blue
    { bg: '#450a0a', text: '#fca5a5' }, // Deep red
    { bg: '#1a2e05', text: '#a3e635' }, // Deep lime
];

function getBadgeColor(name: string) {
    if (!name) return BADGE_COLORS[0];
    const sum = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return BADGE_COLORS[sum % BADGE_COLORS.length];
}

function getInitials(name: string): string {
    if (!name) return '?';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
}

interface CompanyLogoProps {
    logo?: string | null;
    company: string;
    /** Size class for the container, defaults to small (list card) */
    size?: 'sm' | 'lg';
    className?: string;
}

/**
 * Renders a company logo image, falling back to a styled initials badge
 * if no logo is available or the image fails to load.
 * Uses a deterministic color so the same company always gets the same badge.
 */
export function CompanyLogo({ logo, company, size = 'sm', className = '' }: CompanyLogoProps) {
    const [failed, setFailed] = useState(false);
    const showBadge = !logo || failed;
    const { bg, text } = getBadgeColor(company);
    const initials = getInitials(company);

    const containerClass = size === 'lg'
        ? `h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-white p-3 shadow-sm flex items-center justify-center ${className}`
        : `h-10 w-10 shrink-0 bg-white rounded-lg border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm ${className}`;

    const imgClass = size === 'lg' ? 'h-full w-full object-contain' : 'h-8 w-8 object-contain';
    const badgeRadius = size === 'lg' ? 'rounded-lg' : 'rounded-md';
    const badgeFontSize = size === 'lg' ? 'text-xl font-black' : 'text-[11px] font-black';
    const badgeSize = size === 'lg' ? 'h-14 w-14' : 'h-8 w-8';

    const badge = (
        <div className={containerClass}>
            <div
                className={`${badgeSize} ${badgeRadius} flex items-center justify-center ${badgeFontSize} tracking-tight select-none`}
                style={{ backgroundColor: bg, color: text }}
                title={company}
            >
                {initials}
            </div>
        </div>
    );

    if (showBadge) return badge;

    return (
        <div className={containerClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={logo!}
                alt={`${company} logo`}
                className={imgClass}
                onLoad={(e) => {
                    // Google's generic globe favicon is always 16×16px regardless of sz=128.
                    // Treat any image narrower than 33px as a globe and show initials instead.
                    if (e.currentTarget.naturalWidth > 0 && e.currentTarget.naturalWidth <= 32) {
                        setFailed(true);
                    }
                }}
                onError={() => setFailed(true)}
            />
        </div>
    );
}
