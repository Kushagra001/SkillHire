"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState, MouseEvent } from "react";
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

    // 3D Tilt Effect State
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <div className="relative w-full bg-background pt-32 pb-20 md:pt-40 md:pb-32 px-4 md:px-10 overflow-hidden font-sans tracking-tight isolate">

            {/* --- Premium Background Aesthetics --- */}
            {/* Base Background */}
            <div className="absolute inset-0 z-0 bg-background" />

            {/* Premium Noise Texture */}
            <div className="absolute inset-0 z-0 opacity-[0.4] dark:opacity-[0.3] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22 opacity=%220.5%22/%3E%3C/svg%3E")' }} />

            {/* Animated Aurora Glows */}
            <motion.div 
                animate={{ 
                    x: [0, 80, -40, 0], 
                    y: [0, -60, 80, 0],
                    scale: [1, 1.1, 0.9, 1]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-sh-primary/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
            />
            <motion.div 
                animate={{ 
                    x: [0, -80, 50, 0], 
                    y: [0, 80, -50, 0],
                    scale: [1, 0.9, 1.2, 1]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-teal-400/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen pointer-events-none" 
            />
            
            {/* Modern Dot Grid Overlay */}
            <div className="absolute inset-0 z-0 opacity-[0.2] dark:opacity-[0.1]" 
                 style={{ 
                     backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", 
                     backgroundSize: "32px 32px",
                     maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
                     WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
                 }} 
            />

            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10 w-full">

                {/* --- Left Column: Copy & CTAs --- */}
                <div className="flex-1 flex flex-col items-center text-center lg:items-start lg:text-left lg:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 rounded-full border border-sh-primary/20 bg-sh-primary/5 backdrop-blur-md px-4 py-2 text-sm font-semibold text-sh-primary mb-8 shadow-[0_0_15px_rgba(4,119,86,0.1)] cursor-default"
                    >
                        <Sparkles aria-hidden="true" className="w-4 h-4" />
                        <span>SkillHire AI Analyzer 2.0</span>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                        className="flex flex-col"
                    >
                        <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-black tracking-tighter text-foreground leading-[1.05] text-balance">
                            Outsmart the ATS. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sh-primary to-teal-400 drop-shadow-sm">
                                Get Hired Faster.
                            </span>
                        </h1>
                        <p className="mt-8 text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-lg mx-auto lg:mx-0 text-balance">
                            Stop sending resumes into the void. Instantly match your skills to top roles, track real-time company response rates, and organize your job hunt - all in one place.
                        </p>

                        {/* Animated stats bar */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                            className="flex items-center justify-center lg:justify-start gap-4 mt-6 flex-wrap"
                        >
                            {[
                                { value: "2,400+", label: "Jobs" },
                                { value: "500+", label: "Companies" },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    {i > 0 && <span className="text-slate-300 dark:text-slate-700 text-sm">✦</span>}
                                    <span className="text-sm font-bold text-sh-primary">{stat.value}</span>
                                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="flex flex-col gap-5 mt-10 w-full sm:w-auto"
                    >
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start">
                            {/* Premium Shimmer/Glow CTA */}
                            <Link
                                href="/jobs"
                                className="group relative flex h-14 items-center justify-center gap-2 rounded-xl bg-sh-primary px-8 font-semibold text-white transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(4,119,86,0.3)] hover:shadow-[0_0_60px_rgba(4,119,86,0.5)] overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out skew-x-12" />
                                Browse 2,400+ Jobs
                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            
                            {/* Sleek Secondary CTA */}
                            <button
                                onClick={handleCtaClick}
                                className="group relative flex h-14 items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm px-8 font-medium text-slate-700 dark:text-slate-300 transition-all hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 shadow-sm"
                            >
                                <span className="absolute -top-2.5 -right-2 text-[10px] font-bold bg-sh-primary text-white rounded-full px-2 py-0.5 tracking-wide shadow-md">FREE</span>
                                Analyze My Resume
                                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        {/* Trust micro-copy */}
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex flex-wrap items-center justify-center lg:justify-start gap-x-3 gap-y-1">
                            <span>✓ AI Resume Matching</span>
                            <span>✓ Real-time Hiring Pulse</span>
                            <span>✓ Free to start</span>
                        </p>
                    </motion.div>
                </div>

                {/* --- Right Column: 3D High-Craft App Mockup --- */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="flex-1 w-full max-w-lg lg:max-w-xl mx-auto lg:mr-0 z-10 perspective-1000"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ perspective: 1200 }}
                >
                    <motion.div 
                        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                        className="relative rounded-[32px] border border-white/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl shadow-2xl overflow-visible pt-10 pb-12 px-4 w-full group"
                    >
                        {/* Inner glass reflection */}
                        <div className="absolute inset-0 rounded-[32px] border-t border-white/60 dark:border-white/20 pointer-events-none" />

                        {/* Simulated OS Window Controls */}
                        <div className="absolute top-5 left-6 flex gap-2 w-full" aria-hidden="true" style={{ transform: "translateZ(20px)" }}>
                            <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700" />
                            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                            <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <h3 className="text-foreground font-bold text-center text-xl md:text-2xl mb-4 mt-2 tracking-tight" style={{ transform: "translateZ(30px)" }}>Resume ATS Profile</h3>

                        {/* Accessible text alternative */}
                        <div id="hero-ats-desc" className="sr-only">
                            Resume ATS match: {matchScore}% - matched React.js and Node.js; missing AWS.
                        </div>

                        {/* SVG Circle Progress & Central UI */}
                        <div className="relative flex items-center justify-center w-64 h-64 mx-auto mt-6" style={{ transform: "translateZ(50px)" }}>
                            <svg aria-hidden="true" className="w-full h-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" className="stroke-slate-200/50 dark:stroke-slate-800/50" strokeWidth="8" />
                                <motion.circle 
                                    cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8" strokeLinecap="round" 
                                    initial={{ pathLength: 0 }} 
                                    animate={{ pathLength: 0.87 }} 
                                    transition={{ duration: 2.5, ease: "easeOut", delay: 0.5 }} 
                                    className="drop-shadow-[0_0_10px_rgba(4,119,86,0.5)]" 
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#047756" />
                                        <stop offset="100%" stopColor="#41B3A3" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div role="group" aria-labelledby="hero-ats-desc" className="absolute inset-0 flex flex-col items-center justify-center bg-white/30 dark:bg-black/20 backdrop-blur-md rounded-full m-4 border border-white/50 dark:border-white/10 shadow-inner">
                                <motion.span className="text-6xl font-black text-foreground tabular-nums tracking-tighter drop-shadow-md" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
                                    {matchScore}%
                                </motion.span>
                                <motion.span className="text-sm font-bold text-sh-primary uppercase tracking-widest mt-1 drop-shadow-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }}>
                                    Match
                                </motion.span>
                            </div>

                            {/* Synchronized Floating Pills */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0, x: -20 }} 
                                animate={{ opacity: 1, scale: 1, x: 0 }} 
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1 }} 
                                className="absolute -top-4 -right-10 px-5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 backdrop-blur-xl text-emerald-700 dark:text-emerald-400 text-sm font-bold border border-emerald-200/50 dark:border-emerald-800/50 shadow-xl z-20 whitespace-nowrap"
                                style={{ transform: "translateZ(80px)" }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Matched: React.js
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0, x: 20 }} 
                                animate={{ opacity: 1, scale: 1, x: 0 }} 
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.2 }} 
                                className="absolute bottom-4 -left-16 lg:-left-20 px-5 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 backdrop-blur-xl text-rose-600 dark:text-rose-400 text-sm font-bold border border-rose-200/50 dark:border-rose-800/50 shadow-xl z-20 whitespace-nowrap"
                                style={{ transform: "translateZ(70px)" }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                                    Missing: AWS
                                </div>
                            </motion.div>

                            <motion.div 
                                initial={{ opacity: 0, scale: 0, y: 20 }} 
                                animate={{ opacity: 1, scale: 1, y: 0 }} 
                                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 1.4 }} 
                                className="absolute -bottom-8 -right-8 lg:-right-12 px-5 py-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/80 backdrop-blur-xl text-blue-700 dark:text-blue-400 text-sm font-bold border border-blue-200/50 dark:border-blue-800/50 shadow-xl z-20 whitespace-nowrap"
                                style={{ transform: "translateZ(90px)" }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                    Matched: Node.js
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
}
