'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Search, Briefcase, Zap, CheckCircle2 } from 'lucide-react';

export default function InteractiveHero() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const timer1 = setTimeout(() => setStep(1), 1500); // Drop resume
        const timer2 = setTimeout(() => setStep(2), 3500); // Analyze
        const timer3 = setTimeout(() => setStep(3), 6000); // Show matches
        const timer4 = setTimeout(() => setStep(0), 12000); // Reset loop

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
            clearTimeout(timer4);
        };
    }, [step]);

    return (
        <section className="w-full py-16 md:py-24 bg-white dark:bg-sh-background-dark relative overflow-hidden border-t border-slate-200 dark:border-slate-800">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#047756 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sh-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 md:px-10 relative z-10 flex flex-col items-center">
                <div className="text-center mb-10 max-w-3xl">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4">See How the Magic Happens</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Our proprietary AI instantly analyzes your resume structure, extracts your core skills, and matches you specifically with top tech companies actively hiring.</p>
                </div>

                {/* The "App Window" Frame */}
                <div className="w-full max-w-4xl bg-slate-50 dark:bg-slate-900 rounded-2xl shadow-2xl shadow-sh-primary/10 border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col min-h-[500px]">
                    {/* Fake Window Header */}
                    <div className="h-12 bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <div className="ml-4 text-xs font-semibold text-slate-500 font-mono tracking-wide">app.skillhire.com/match</div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex items-center justify-center p-8 relative">
                        <div className="relative z-10 w-full max-w-sm">
                            <AnimatePresence mode="wait">
                                {/* Step 0 & 1: The Upload Modal */}
                                {step < 2 && (
                                    <motion.div
                                        key="upload"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center flex flex-col items-center relative overflow-hidden">
                                            <FileUp className="w-12 h-12 text-slate-400 mb-4" />
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Drag & Drop your Resume</p>
                                            <p className="text-xs text-slate-500 mt-1">PDF, DOCX up to 5MB</p>

                                            {/* Simulated file drop */}
                                            {step === 1 && (
                                                <motion.div
                                                    initial={{ y: -100, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    className="absolute inset-0 bg-white/95 dark:bg-slate-800/95 flex flex-col items-center justify-center"
                                                >
                                                    <div className="p-3 bg-sh-primary/10 rounded-full text-sh-primary mb-2">
                                                        <FileUp className="w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">resume_2024.pdf</p>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "100%" }}
                                                        transition={{ duration: 1.5, ease: "linear" }}
                                                        className="h-1 bg-sh-primary w-2/3 mt-3 rounded-full overflow-hidden"
                                                    />
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 2: Analysis */}
                                {step === 2 && (
                                    <motion.div
                                        key="analyze"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl flex flex-col items-center text-center border border-slate-200 dark:border-slate-700 relative overflow-hidden"
                                    >
                                        {/* Scanning Laser Effect */}
                                        <motion.div
                                            animate={{ top: ['0%', '100%', '0%'] }}
                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                            className="absolute left-0 right-0 h-1 bg-sh-primary/50 shadow-[0_0_15px_rgba(4,119,86,0.5)] z-20"
                                        />

                                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-100 dark:border-slate-800 mb-4 shadow-inner">
                                            <motion.svg className="absolute inset-0 h-full w-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                                                <motion.circle
                                                    cx="50"
                                                    cy="50"
                                                    r="46"
                                                    fill="none"
                                                    stroke="#41b4a5"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    initial={{ pathLength: 0 }}
                                                    animate={{ pathLength: 0.92 }}
                                                    transition={{ duration: 2, ease: "easeOut" }}
                                                />
                                            </motion.svg>
                                            <div className="flex flex-col items-center">
                                                <Zap className="h-6 w-6 text-sh-primary mb-1 animate-pulse" />
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Analyzing Skills...</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Extracting keywords & matching active jobs.</p>
                                    </motion.div>
                                )}

                                {/* Step 3: Job Matches */}
                                {step === 3 && (
                                    <motion.div
                                        key="matches"
                                        className="w-full space-y-3"
                                    >
                                        <div className="flex items-center justify-between mb-4 px-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <CheckCircle2 className="w-5 h-5 text-sh-primary" />
                                                Top Matches Found
                                            </h3>
                                            <span className="text-xs font-bold bg-sh-primary/10 text-sh-primary px-2 py-1 rounded-full">92% Match Avg</span>
                                        </div>

                                        {[
                                            { title: "Frontend Developer", company: "TechNova", match: 95 },
                                            { title: "React Engineer", company: "Zeta Systems", match: 89 },
                                            { title: "Full Stack Intern", company: "Apollo", match: 84 }
                                        ].map((job, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.15 + 0.2 }}
                                                className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800">
                                                        <Briefcase className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                                                        <p className="text-xs text-slate-500">{job.company}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-lg font-black text-sh-primary">{job.match}%</span>
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Match</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
