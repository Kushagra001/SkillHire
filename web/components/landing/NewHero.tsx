"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Terminal } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useClerk, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function NewHero() {
    const { openSignIn } = useClerk();
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const [matchScore, setMatchScore] = useState(0);

    const handleCtaClick = () => {
        if (isSignedIn) {
            router.push('/resume');
        } else {
            openSignIn({ fallbackRedirectUrl: '/resume' });
        }
    };

    // Counter animation from 0 to 87
    useEffect(() => {
        let start = 0;
        const end = 87;
        const duration = 2000;
        const incrementTime = Math.abs(Math.floor(duration / end));
        const timer = setInterval(() => {
            start += 1;
            setMatchScore(start);
            if (start === end) clearInterval(timer);
        }, incrementTime);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full bg-gradient-to-br from-slate-50 via-white to-teal-50/40 dark:from-[#060D18] dark:via-[#0B0F19] dark:to-[#0B1520] pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-10 overflow-hidden font-sans tracking-tight">

            {/* Premium noise texture */}
            <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.15]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")", backgroundSize: "180px 180px" }} />

            {/* Main top-right teal glow */}
            <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-[#41B3A3]/20 dark:bg-teal-500/10 rounded-full blur-[140px] -translate-y-1/3 translate-x-1/4 pointer-events-none z-0" />

            {/* Left-side green accent glow */}
            <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-[100px] -translate-x-1/3 pointer-events-none z-0" />

            {/* Bottom center warm burst */}
            <div className="absolute bottom-0 left-1/2 w-[700px] h-[400px] bg-teal-300/10 dark:bg-cyan-500/5 rounded-full blur-[120px] -translate-x-1/2 translate-y-1/2 pointer-events-none z-0" />

            {/* Subtle grid overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.025] dark:opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#1b2532 1px, transparent 1px), linear-gradient(90deg, #1b2532 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10 w-full">

                {/* Left Column: Copy & CTAs */}
                <div className="flex-1 flex flex-col items-start text-left lg:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 rounded-full border border-black/5 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 py-2 text-sm font-medium text-slate-800 dark:text-slate-200 mb-8 shadow-sm transition-shadow cursor-default"
                    >
                        <Sparkles className="w-4 h-4 text-[#41B3A3]" />
                        <span>SkillHire AI Analyzer 2.0</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <h1 className="text-6xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-[#1b2532] dark:text-white leading-[1.05]">
                            Get Hired for <br />
                            <span className="text-[#187255] dark:text-[#41B3A3]">
                                What You Ship.
                            </span>
                        </h1>
                        <p className="mt-8 text-lg xl:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                            Get matched to top companies based on what you can build, not just your degree. Built for freshers ready to prove their skills.
                        </p>

                        {/* Animated stats bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                            className="flex items-center gap-4 mt-6 flex-wrap"
                        >
                            {[
                                { value: "2,400+", label: "Jobs" },
                                { value: "500+", label: "Companies" },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {i > 0 && <span className="text-slate-300 dark:text-slate-700 text-sm">✦</span>}
                                    <span className="text-sm font-bold text-[#187255] dark:text-[#41B3A3]">{stat.value}</span>
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="flex flex-col gap-4 mt-10 w-full sm:w-auto"
                    >
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/jobs"
                                className="group relative flex h-14 items-center justify-center gap-2 rounded-xl bg-[#1b2532] dark:bg-white px-8 font-semibold text-white dark:text-[#1E293B] transition-all hover:scale-105 active:scale-95 shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                            >
                                Browse 2,400+ Jobs
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <button
                                onClick={handleCtaClick}
                                className="group relative flex h-14 items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] px-8 font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-gray-50 dark:hover:bg-slate-800 active:scale-95 shadow-sm"
                            >
                                <span className="absolute -top-2.5 -right-2 text-[10px] font-bold bg-[#187255] dark:bg-[#41B3A3] text-white rounded-full px-2 py-0.5 tracking-wide">FREE</span>
                                Analyze My Resume
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        {/* Trust micro-copy */}
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span>✓ Free to browse jobs</span>
                            <span>✓ No login required to explore</span>
                            <span>✓ AI-powered skill matching</span>
                        </p>
                    </motion.div>
                </div>

                {/* Right Column: Live Mockup Theater */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="flex-1 w-full max-w-lg lg:max-w-xl mx-auto lg:mr-0 z-10 lg:pl-10 relative"
                >
                    <div className="relative rounded-2xl md:rounded-[32px] border border-gray-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl shadow-2xl overflow-hidden pt-10 pb-12 px-4 ring-1 ring-black/5 dark:ring-white/10 w-full">
                        {/* Simulated OS Window Controls */}
                        <div className="absolute top-5 left-5 flex gap-2 w-full">
                            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <h3 className="text-[#1E293B] dark:text-white font-bold text-center text-xl md:text-2xl mb-4 mt-2">Resume ATS Profile</h3>

                        {/* SVG Circle Progress */}
                        <div className="relative flex items-center justify-center w-56 h-56 mx-auto mt-2">
                            <svg className="w-full h-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-200 dark:stroke-slate-800" strokeWidth="8" />
                                <motion.circle cx="50" cy="50" r="45" fill="none" stroke="#41B3A3" strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 0.87 }} transition={{ duration: 2, ease: "easeOut", delay: 0.5 }} className="drop-shadow-sm" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span className="text-6xl font-black text-[#1E293B] dark:text-white tabular-nums tracking-tighter" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                                    {matchScore}%
                                </motion.span>
                                <motion.span className="text-sm font-bold text-[#41B3A3] uppercase tracking-widest mt-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
                                    Match
                                </motion.span>
                            </div>

                            {/* Floating Pills */}
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }} transition={{ opacity: { delay: 1, duration: 0.5 }, scale: { delay: 1, type: "spring", stiffness: 200, damping: 10 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut" } }} className="absolute -top-2 -right-8 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 backdrop-blur-md text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-200 dark:border-emerald-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 whitespace-nowrap">
                                ✓ Matched: React.js
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, 8, 0] }} transition={{ opacity: { delay: 1.4, duration: 0.5 }, scale: { delay: 1.4, type: "spring", stiffness: 200, damping: 10 }, y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 } }} className="absolute bottom-8 -left-12 lg:-left-16 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-950/50 backdrop-blur-md text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-200 dark:border-rose-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 whitespace-nowrap">
                                ✕ Missing: AWS
                            </motion.div>
                            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }} transition={{ opacity: { delay: 1.8, duration: 0.5 }, scale: { delay: 1.8, type: "spring", stiffness: 200, damping: 10 }, y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 } }} className="absolute bottom-10 -right-12 lg:-right-16 md:-right-4 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 backdrop-blur-md text-blue-700 dark:text-blue-400 text-sm font-bold border border-blue-200 dark:border-blue-800/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-10 whitespace-nowrap">
                                ✓ Matched: Node.js
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
