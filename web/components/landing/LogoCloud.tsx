"use client";

import { motion } from "framer-motion";

const LOGOS = [
    { name: 'Razorpay', url: 'https://cdn.simpleicons.org/razorpay/0F172A/94A3B8' },
    { name: 'Zomato', url: 'https://cdn.simpleicons.org/zomato/0F172A/94A3B8' },
    { name: 'Zoho', url: 'https://cdn.simpleicons.org/zoho/0F172A/94A3B8' },
    { name: 'Swiggy', url: 'https://cdn.simpleicons.org/swiggy/0F172A/94A3B8' },
    { name: 'Infosys', url: 'https://cdn.simpleicons.org/infosys/0F172A/94A3B8' },
    { name: 'Paytm', url: 'https://cdn.simpleicons.org/paytm/0F172A/94A3B8' },
    { name: 'Postman', url: 'https://cdn.simpleicons.org/postman/0F172A/94A3B8' },
    { name: 'Vercel', url: 'https://cdn.simpleicons.org/vercel/0F172A/94A3B8' },
];

export default function LogoCloud() {
    const duplicatedLogos = [...LOGOS, ...LOGOS];

    return (
        <div className="w-full bg-white dark:bg-[#0B0F19] py-16 border-y border-gray-100 dark:border-slate-800/60 overflow-hidden relative z-10">
            <div className="max-w-7xl mx-auto px-4 md:px-10 flex flex-col items-center">
                <p className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-8 z-20 relative px-4 text-center">
                    Trusted by top engineering teams
                </p>
            </div>

            <div className="relative w-full flex">
                {/* Left/Right Fade Masks */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-[#0B0F19] to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-[#0B0F19] to-transparent z-10 pointer-events-none"></div>

                <motion.div
                    className="flex whitespace-nowrap gap-16 md:gap-24 items-center pl-16 md:pl-24"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30,
                    }}
                >
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.name}-${index}`}
                            className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            <img
                                src={logo.url.replace('/0F172A/94A3B8', '')}
                                alt={`${logo.name} logo`}
                                className="h-8 md:h-10 w-auto object-contain dark:invert"
                            />
                            <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {logo.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
