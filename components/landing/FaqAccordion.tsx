"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const faqs = [
    {
        question: "How does the ATS Matcher actually work?",
        answer: "Our pipeline uses NLP to extract specific skill vectors from your resume and runs a cosine similarity match against live Job Description data. It deterministically weights hard skills over fluffy adjectives to give you the exact score an internal recruiter's ATS system would."
    },
    {
        question: "Is this only for senior engineers?",
        answer: "Absolutely not. While we do have high-end roles, the entire system is optimized to help 2024, 2025, and 2026 batches land entry-level or junior roles by mapping internships and personal projects to required enterprise skills."
    },
    {
        question: "What happens to my resume data?",
        answer: "Your privacy is paramount. We don't train public LLMs on your personal data. Resumes are processed ephemerally to generate match scores and are securely hashed in our database solely for your session history."
    },
    {
        question: "Can I use this alongside normal cold-emailing?",
        answer: "Yes, and you should. SkillHire guarantees your resume will pass the automated filters, which means when you cold-email a hiring manager with your profile, the ATS system will corroborate your qualifications perfectly."
    }
];

export default function FaqAccordion() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-24 bg-white dark:bg-[#0B0F19] relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#1E293B] dark:text-white capitalize mb-4">
                        Frequently Asked <span className="text-[#41B3A3]">Questions</span>
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
                        Everything you need to know about the product and billing.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => {
                        const isOpen = openIndex === index;
                        return (
                            <motion.div
                                key={index}
                                initial={false}
                                className={`border ${isOpen ? 'border-[#41B3A3] dark:border-[#41B3A3] bg-white dark:bg-[#0F172A] shadow-md shadow-[#41B3A3]/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B101D]'} rounded-2xl overflow-hidden transition-colors duration-300`}
                            >
                                <button
                                    className="w-full flex items-center justify-between p-6 md:p-8 text-left focus:outline-none"
                                    onClick={() => setOpenIndex(isOpen ? null : index)}
                                >
                                    <span className="text-lg md:text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight pr-8">
                                        {faq.question}
                                    </span>
                                    <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-[#41B3A3]/10 text-[#41B3A3]' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                    </div>
                                </button>

                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: "easeInOut" }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-6 md:p-8 pt-0 text-slate-600 dark:text-slate-400 font-medium leading-relaxed md:text-lg border-t border-slate-100 dark:border-slate-800/50 mt-2">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
