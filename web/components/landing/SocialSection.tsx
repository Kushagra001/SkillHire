'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const SOCIAL_LINKS = [
    {
        name: 'Telegram (Free)',
        handle: '@SkillHireFree1',
        description: 'Get free job alerts, tips & community discussions.',
        cta: 'Join for Free',
        href: 'https://t.me/SkillHireFree1',
        gradient: 'from-[#0088cc]/10 to-[#0077b5]/5',
        border: 'border-[#0088cc]/30',
        iconBg: 'bg-[#0088cc]',
        ctaClass: 'bg-[#0088cc] hover:bg-[#0077b5] text-white',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
        ),
    },
    {
        name: 'LinkedIn',
        handle: 'SkillHire India',
        description: 'Follow for career insights, success stories & product updates.',
        cta: 'Follow Us',
        href: 'https://linkedin.com/company/skillhire-in',
        gradient: 'from-[#0A66C2]/10 to-[#0A66C2]/5',
        border: 'border-[#0A66C2]/30',
        iconBg: 'bg-[#0A66C2]',
        ctaClass: 'bg-[#0A66C2] hover:bg-[#005bb5] text-white',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
        ),
    },
    {
        name: 'Instagram',
        handle: '@skillhire.in',
        description: 'Daily job tips, reels & career content made for freshers.',
        cta: 'Follow on Instagram',
        href: 'https://www.instagram.com/skillhire.in',
        gradient: 'from-[#E1306C]/10 via-[#C13584]/5 to-[#833AB4]/5',
        border: 'border-[#E1306C]/30',
        iconBg: 'bg-gradient-to-br from-[#f09433] via-[#e6683c] via-[#dc2743] via-[#cc2366] to-[#bc1888]',
        ctaClass: 'bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90 text-white',
        icon: (
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
        ),
    },
];

export default function SocialSection() {
    return (
        <section className="py-20 bg-sh-surface-light dark:bg-sh-background-dark border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full bg-sh-primary/10 text-sh-primary text-xs font-bold uppercase tracking-wider mb-4">Community</span>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3">Join the SkillHire Community</h2>
                    <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                        Connect with 1000+ job seekers, get instant alerts, and never miss an opportunity.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {SOCIAL_LINKS.map((s, i) => (
                        <motion.a
                            key={s.name}
                            href={s.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`group flex flex-col p-6 rounded-2xl border bg-gradient-to-br ${s.gradient} ${s.border} dark:border-opacity-20 bg-white dark:bg-slate-800/40 shadow-sm hover:shadow-lg transition-all duration-300`}
                        >
                            <div className={`h-12 w-12 rounded-xl ${s.iconBg} flex items-center justify-center text-white shadow-md mb-4`}>
                                {s.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{s.name}</p>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{s.handle}</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-5 hidden sm:block">{s.description}</p>
                            </div>
                            <span className={`inline-flex items-center justify-center gap-2 w-full h-10 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95 ${s.ctaClass}`}>
                                {s.cta} →
                            </span>
                        </motion.a>
                    ))}
                </div>
            </div>
        </section>
    );
}
