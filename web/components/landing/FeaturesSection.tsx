'use client';

import { motion } from 'framer-motion';
import { Target, Zap, TrendingUp, CheckCircle, Search, FileText } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesSection() {
    const containerVariants = {
        hidden: {},
        show: {
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, type: 'spring' as const } }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-900 py-24 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 md:px-10">

                {/* Feature 1: The Job Board */}
                <div className="flex flex-col lg:flex-row items-center gap-16 mb-32">
                    {/* Text Container */}
                    <motion.div
                        className="flex-1 space-y-6"
                        variants={itemVariants}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sh-primary/10 text-sh-primary font-semibold text-sm">
                            <Target className="w-4 h-4" /> Discover Opportunities
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight">
                            A curated feed of <br /><span className="text-sh-primary">high-growth roles.</span>
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            No more scrolling through stale listings. SkillHire aggregates fresh, entry-level, and junior positions specifically tailored for recent graduates and career transitioners.
                        </p>
                        <ul className="space-y-3 pt-4">
                            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                <CheckCircle className="w-5 h-5 text-sh-primary" /> Direct-to-founder startup roles.
                            </li>
                            <li className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                <CheckCircle className="w-5 h-5 text-sh-primary" /> Transparent salary bands.
                            </li>
                        </ul>
                    </motion.div>

                    {/* Floating UI Container */}
                    <motion.div
                        className="flex-1 w-full relative h-[400px]"
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, type: 'spring' }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-sh-primary/10 to-transparent rounded-3xl transform rotate-3 scale-105" />

                        {/* Mockup Frame */}
                        <motion.div
                            animate={{ y: [0, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            className="absolute inset-0 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl p-4 overflow-hidden flex flex-col gap-3"
                        >
                            {/* Fake Search */}
                            <div className="h-10 w-full bg-white dark:bg-slate-900 rounded-lg flex items-center px-3 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <Search className="w-4 h-4 text-slate-400 mr-2" />
                                <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            </div>

                            {/* Fake Job Cards */}
                            {/* Realistic Job Cards Mockup */}
                            {[
                                { title: "Software Engineer I", company: "Zoho", loc: "Remote", pay: "₹12L - ₹18L" },
                                { title: "Frontend Developer", company: "CRED", loc: "Bangalore", pay: "₹15L - ₹22L" },
                                { title: "FullStack React", company: "Swiggy", loc: "Hybrid", pay: "₹10L - ₹16L" }
                            ].map((job, i) => (
                                <div key={i} className="w-full bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-sh-primary/10 flex items-center justify-center text-sh-primary font-bold text-lg">
                                            {job.company.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{job.title}</div>
                                            <div className="text-xs text-slate-500 mt-0.5">{job.company} &bull; {job.loc}</div>
                                        </div>
                                    </div>
                                    <div className="hidden sm:block text-xs font-semibold text-sh-primary bg-sh-primary/10 px-2 py-1 rounded-md whitespace-nowrap">
                                        {job.pay}
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
