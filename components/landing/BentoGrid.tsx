"use client";

import { motion, Variants } from "framer-motion";
import { Search, Zap, CheckCircle2, IndianRupee } from "lucide-react";

export default function BentoGrid() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.15 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, type: "spring" } }
    };

    return (
        <div className="w-full bg-slate-50/50 dark:bg-[#0a0f12] py-24 px-4 overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-100px" }}
                className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Card 1: Beat the ATS (Col Span 2) */}
                <motion.div variants={itemVariants} className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 relative overflow-hidden group">
                    <div className="relative z-10 w-full md:w-1/2 flex flex-col justify-center h-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#41B3A3]/10 text-[#41B3A3] font-semibold text-xs mb-6 w-max">
                            <Zap className="w-4 h-4" /> AI Resume Parser
                        </div>
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Beat the ATS Filter.
                        </h3>
                        <p className="text-slate-500 mb-8 max-w-sm">
                            Upload your resume and instantly see what hiring managers see. Optimize keywords and formatting before you even apply.
                        </p>
                    </div>

                    {/* Mockup Element */}
                    <div className="absolute right-[-10%] md:right-0 bottom-[-10%] md:bottom-auto md:top-1/2 md:-translate-y-1/2 w-3/4 md:w-1/2 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl transform rotate-2 group-hover:rotate-0 transition-transform duration-500">
                        <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-2 w-5/6 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-2 w-4/6 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">Keyword: React</span>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded">Keyword: Node.js</span>
                        </div>
                    </div>
                </motion.div>

                {/* Card 2: Transparent Salary (Col Span 1) */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#41B3A3]/10 text-[#41B3A3] font-semibold text-xs mb-6 w-max">
                            <IndianRupee className="w-4 h-4" /> No Guessing
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            Transparent Salary Bands.
                        </h3>
                        <p className="text-slate-500 text-sm">
                            We mandate salary ranges, equity details, and benefits upfront.
                        </p>
                    </div>

                    {/* Mockup Element */}
                    <div className="mt-8 p-4 bg-slate-900 rounded-xl border border-slate-800 shadow-inner flex items-center justify-between">
                        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Salary</span>
                        <span className="px-3 py-1 rounded-full bg-[#41B3A3]/20 text-[#41B3A3] border border-[#41B3A3]/30 font-bold text-sm shadow-[0_0_15px_rgba(65,179,163,0.3)]">
                            ₹12L - ₹18L
                        </span>
                    </div>
                </motion.div>

                {/* Card 3: Fresh <24h Jobs (Col Span 1) */}
                <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm hover:shadow-md transition-shadow p-8 relative overflow-hidden flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-semibold text-xs mb-6 w-max">
                            <Zap className="w-4 h-4" /> Fresh Roles
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                            Under 24h Jobs.
                        </h3>
                        <p className="text-slate-500 text-sm text-balance">
                            Get early access to roles before the competition. We highlight the freshest, highest-paying jobs as soon as they drop.
                        </p>
                    </div>

                    {/* Graphical Element */}
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-orange-500/10 rounded-full blur-2xl" />

                    <div className="mt-8 flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                            <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse ring-4 ring-orange-500/20" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">New high paying role!</span>
                            <span className="text-xs text-slate-500 font-medium">Posted 2h ago</span>
                        </div>
                    </div>
                </motion.div>

                {/* Card 4: Curated for Juniors (Col Span 2) */}
                <motion.div variants={itemVariants} className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl shadow-lg p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-[#0a0f12] z-0" />

                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center h-full">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white font-semibold text-xs mb-6 w-max border border-white/20">
                                <Search className="w-4 h-4" /> Zero Noise
                            </div>
                            <h3 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                Curated for Juniors.
                            </h3>
                            <p className="text-slate-400 mb-8 max-w-sm">
                                No "Entry Level: 5 Years Experience required." We specifically source freshers and junior roles from high-growth startups globally.
                            </p>
                        </div>

                        {/* Mockup Element */}
                        <div className="flex-[0.8] w-full flex flex-col gap-3">
                            {[
                                { title: 'Frontend Engineer', comp: 'React, TypeScript', label: 'Junior', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
                                { title: 'Backend Developer', comp: 'Node.js, Postgres', label: 'Fresher', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
                                { title: 'Fullstack Intern', comp: 'Next.js, Tailwind', label: 'Intern', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' }
                            ].map((role, idx) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between group-hover:bg-white/10 transition-colors">
                                    <div>
                                        <h4 className="text-white text-sm font-bold">{role.title}</h4>
                                        <p className="text-slate-500 text-xs">{role.comp}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold border ${role.color}`}>
                                        {role.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}
