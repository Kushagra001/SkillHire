"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
    {
        name: "Rahul Sharma",
        role: "Frontend Engineer at Zepto",
        batch: "2025 Batch",
        content: "SkillHire bypassed the ATS black hole completely. The match accuracy was insane, got an interview call in 48 hours for a role I definitely would have been auto-rejected from.",
        avatar: "/avatars/rahul.png",
        rating: 5
    },
    {
        name: "Priya Patel",
        role: "SDE I at FamPay",
        batch: "2024 Batch",
        content: "Stop spraying and praying on LinkedIn. This engineered my resume specifically for Swiggy's JD and it worked flawlessly. Game changer for 2024 grads.",
        avatar: "/avatars/priya.png",
        rating: 5
    },
    {
        name: "Aditya Nair",
        role: "Backend Dev at Appsmith",
        batch: "2023 Batch",
        content: "The salary band transparency is what sold me initially, but the direct matching engine really delivers. Highly recommend to any junior dev struggling right now.",
        avatar: "/avatars/aditya.png",
        rating: 5
    },
    {
        name: "Sneha Reddy",
        role: "Fullstack at Peerlist",
        batch: "2026 Batch",
        content: "SkillHire highlighted exactly which Next.js skills I was missing for the mid-level role. I spent a weekend upskilling, re-ran the scan, matched 92%, and got hired.",
        avatar: "/avatars/sneha.png",
        rating: 5
    },
    {
        name: "Vikram Singh",
        role: "SDE II at SuperTokens",
        batch: "2024 Batch",
        content: "As someone who reviews resumes, the formatting SkillHire outputs is precisely what engineering managers want to see. Clean, data-driven, and highly relevant.",
        avatar: "/avatars/vikram.png",
        rating: 5
    },
];

export default function TestimonialMarquee() {
    return (
        <section className="py-24 bg-[#FAFAFA] dark:bg-[#060A11] border-y border-slate-200 dark:border-slate-900/50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#1E293B] dark:text-white capitalize mb-4">
                    Engineers Who Escaped The <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-[#41B3A3]">Grind</span>
                </h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">
                    Thousands of devs are letting our algorithm do the heavy lifting.
                </p>
            </div>

            <div className="relative flex overflow-x-hidden group">
                {/* Fade Gradients */}
                <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#FAFAFA] dark:from-[#060A11] to-transparent z-10 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#FAFAFA] dark:from-[#060A11] to-transparent z-10 pointer-events-none" />

                <motion.div
                    className="flex shrink-0 gap-6 py-4 px-3"
                    animate={{
                        x: [0, -1035], // Approximate width to scroll full set
                    }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30, // Slow marquee speed
                            ease: "linear",
                        },
                    }}
                >
                    {/* Double the array for seamless infinite looping */}
                    {[...testimonials, ...testimonials].map((testimonial, idx) => (
                        <div
                            key={idx}
                            className="w-[350px] md:w-[450px] shrink-0 p-8 rounded-3xl bg-white dark:bg-[#0B101D] border border-slate-100 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-center gap-1 mb-6 text-amber-400">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} className="w-4 h-4 fill-current" />
                                ))}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed mb-8 italic">
                                "{testimonial.content}"
                            </p>
                            <div className="flex items-center gap-4 mt-auto">
                                <Image
                                    src={testimonial.avatar}
                                    alt={testimonial.name}
                                    width={48}
                                    height={48}
                                    className="rounded-full bg-slate-200 dark:bg-slate-800 object-cover"
                                />
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-slate-900 dark:text-white font-bold tracking-tight">
                                        {testimonial.name}
                                    </span>
                                    <span className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                                        {testimonial.role}
                                    </span>
                                    <span className="inline-flex items-center mt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/40 rounded-full px-2 py-0.5 w-fit">
                                        {testimonial.batch}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
