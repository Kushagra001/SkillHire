"use client";

import { motion, Variants } from "framer-motion";
import { Terminal, CheckCircle2, Search, Send, ArrowRight } from "lucide-react";

export default function HowItWorksTerminal() {
    const steps = [
        {
            id: 1,
            icon: <Search className="w-5 h-5 text-emerald-400" />,
            command: "Analyzing Resume & Skills",
            output: "[SUCCESS] Parsed 24 keywords. Match score: 87%",
            color: "text-emerald-400"
        },
        {
            id: 2,
            icon: <Terminal className="w-5 h-5 text-blue-400" />,
            command: "Querying Job Market Data",
            output: "[INFO] Found 142 matching roles across top product companies.",
            color: "text-blue-400"
        },
        {
            id: 3,
            icon: <Send className="w-5 h-5 text-purple-400" />,
            command: "Auto-Applying via ATS",
            output: "[PAYLOAD] Applications securely dispatched. Interviews loading...",
            color: "text-purple-400"
        }
    ];

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.6 }
        }
    };

    const lineVariants: Variants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <section className="py-24 bg-white dark:bg-[#0B0F19] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1E293B] dark:text-white capitalize mb-4">
                        Stop Sending Resumes Into the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#41B3A3] to-blue-500">Void</span>
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        SkillHire uses a deterministic pipeline to extract your true capabilities and route you past broken applicant tracking systems.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={containerVariants}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F172A] shadow-xl dark:shadow-2xl overflow-hidden font-mono text-sm md:text-base relative w-full"
                    >
                        {/* Terminal Header */}
                        <div className="bg-slate-200 dark:bg-slate-900 px-4 py-3 border-b border-slate-300 dark:border-slate-800 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                            <div className="ml-4 flex items-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
                                <Terminal className="w-3 h-3 mr-1" />
                                skillhire_engine_v2.sh
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="p-6 md:p-8 space-y-8 text-slate-800 dark:text-slate-300">
                            {steps.map((step, index) => (
                                <motion.div key={step.id} variants={lineVariants} className="relative">
                                    {/* Connecting Line */}
                                    {index !== steps.length - 1 && (
                                        <div className="absolute left-3 top-8 bottom-[-2rem] w-[2px] bg-slate-200 dark:bg-slate-800" />
                                    )}
                                    <div className="flex gap-4">
                                        <div className="relative z-10 w-6 h-6 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                                            {step.icon}
                                        </div>
                                        <div className="flex flex-col gap-2 flex-1">
                                            <div className="flex items-center text-slate-900 dark:text-white font-bold">
                                                <span className="text-slate-400 dark:text-slate-500 mr-2">$</span>
                                                <span className="typing-effect break-all">{step.command}</span>
                                            </div>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                whileInView={{ opacity: 1 }}
                                                transition={{ delay: 0.8 }}
                                                className={`pl-4 border-l-2 border-slate-200 dark:border-slate-800 font-semibold ${step.color} tracking-tight`}
                                            >
                                                {step.output}
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            <motion.div variants={lineVariants} className="pt-4 flex items-center gap-2 text-emerald-500 font-bold">
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Execution complete. Waiting for recruiter pings...</span>
                                <span className="animate-pulse">_</span>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
