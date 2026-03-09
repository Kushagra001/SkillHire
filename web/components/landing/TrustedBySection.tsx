'use client';

import { motion } from 'framer-motion';

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

export default function TrustedBySection() {
    // Duplicate the logos array so we can animate smoothly from 0% to -50%
    const duplicatedLogos = [...LOGOS, ...LOGOS];

    return (
        <div className="w-full border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <p className="text-center text-sm font-semibold text-slate-500 mb-8 uppercase tracking-wider">
                    Trusted by top engineering teams
                </p>
            </div>

            <div className="relative w-full flex">
                {/* Left/Right Fade Masks for smoother entry/exit */}
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10"></div>

                <motion.div
                    className="flex whitespace-nowrap gap-16 md:gap-24 items-center pl-16 md:pl-24"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30, // Adjust speed here, higher translates to slower
                    }}
                >
                    {duplicatedLogos.map((logo, index) => (
                        <div
                            key={`${logo.name}-${index}`}
                            className="flex items-center gap-3 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            {/* Using a regular img tag because next/image would require configuring external domains in next.config.mjs */}
                            {/* By using simpleicons with `/0F172A/94A3B8` we simulate color overrides based on dark/light mode but simpleicons defaults to fixed colors unless manipulated via filter, so we'll use grayscale filter */}
                            <img
                                src={logo.url.replace('/0F172A/94A3B8', '')}
                                alt={`${logo.name} logo`}
                                className="h-7 md:h-9 w-auto object-contain brightness-0 dark:invert"
                            />
                            <span className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
                                {logo.name}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
}
