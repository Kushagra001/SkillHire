'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function PricingSection() {
    const router = useRouter();
    const { isSignedIn } = useUser();
    const { openSignIn } = useClerk();
    const [isUnlocking, setIsUnlocking] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleUnlockPro = async (plan: string) => {
        if (!isSignedIn) {
            openSignIn({ fallbackRedirectUrl: '/jobs' });
            return;
        }

        setIsUnlocking(plan);
        try {
            await new Promise<void>((resolve, reject) => {
                // @ts-expect-error Razorpay is injected globally
                if (window.Razorpay) return resolve();
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => resolve();
                script.onerror = () => reject(new Error('Razorpay script failed to load'));
                document.body.appendChild(script);
            });

            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan })
            });
            if (!orderRes.ok) throw new Error('Failed to create order');
            const { orderId, amount } = await orderRes.json();

            await new Promise<void>((resolve, reject) => {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount,
                    currency: 'INR',
                    name: 'SkillHire',
                    description: `Premium Access — ${plan === '6month' ? '6 Months' : '1 Month'}`,
                    order_id: orderId,
                    theme: { color: plan === '6month' ? '#047756' : '#41b4a5' },
                    handler: () => {
                        setShowSuccessModal(true);
                        resolve();
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                };
                // @ts-expect-error Razorpay is injected globally
                const rzp = new window.Razorpay(options);
                rzp.open();
            });

        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Payment failed';
            if (msg !== 'Payment cancelled') {
                console.error('Unlock error:', error);
                alert(msg);
            }
        } finally {
            setIsUnlocking(null);
        }
    };

    const containerVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.15 } }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 40 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, type: 'spring' as const } }
    };

    return (
        <div id="pricing" className="bg-slate-50 dark:bg-black/20 py-24 border-t border-slate-200 dark:border-slate-800 overflow-hidden">

            {/* ── Success Modal (shown after payment) ── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-8 text-center relative overflow-hidden"
                    >
                        <div className="absolute -top-12 -left-12 w-32 h-32 bg-[#41b4a5]/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex items-center justify-center mb-4">
                                <div className="h-16 w-16 rounded-full bg-[#EAFBF9] flex items-center justify-center shadow-md">
                                    <CheckCircle className="h-8 w-8 text-[#41b4a5]" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">You&apos;re now a Pro! 🎉</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                                Welcome to SkillHire Pro. Join the exclusive Telegram channel to get{' '}
                                <strong className="text-slate-700 dark:text-white">instant job alerts</strong> before anyone else.
                            </p>
                            <a
                                href="https://t.me/+ud_U0D07RkY3YTk1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold text-base shadow-lg transition-all mb-3 active:scale-95"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                                </svg>
                                Join Private Telegram Channel
                            </a>
                            <button
                                onClick={() => { setShowSuccessModal(false); router.push('/jobs'); }}
                                className="flex items-center justify-center gap-2 w-full h-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm transition-all hover:border-[#41b4a5] hover:text-[#41b4a5]"
                            >
                                Go to Jobs Dashboard →
                            </button>
                            <p className="text-[11px] text-slate-400 mt-4">You can also join Telegram anytime from the Jobs page banner.</p>
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="layout-container max-w-7xl mx-auto px-4 md:px-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Invest in Your Career</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Simple, transparent pricing to help you land your first big tech role.</p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-start"
                >
                    {/* Free Plan */}
                    <motion.div variants={cardVariants} className="rounded-2xl bg-white dark:bg-slate-800 p-8 border border-slate-200 dark:border-slate-700 flex flex-col hover:border-slate-300 dark:hover:border-slate-600 transition-colors h-full">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Standard Access</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                            <span className="text-slate-500 text-sm">/ forever</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-slate-400 dark:text-slate-500 h-5 w-5 shrink-0" />
                                <span>Browse Curated Job Feed</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-slate-400 dark:text-slate-500 h-5 w-5 shrink-0" />
                                <span><span className="font-bold text-slate-900 dark:text-white">3</span> AI Resume Match Scans daily</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-slate-400 dark:text-slate-500 h-5 w-5 shrink-0" />
                                <span>View basic Match Score</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-400/60 dark:text-slate-500/60">
                                <XCircle className="h-5 w-5 shrink-0" />
                                <span className="line-through decoration-slate-300 dark:decoration-slate-600">&lt;24hr Fresh Jobs access</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-400/60 dark:text-slate-500/60">
                                <XCircle className="h-5 w-5 shrink-0" />
                                <span className="line-through decoration-slate-300 dark:decoration-slate-600">High-Paying startup roles</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-400/60 dark:text-slate-500/60">
                                <XCircle className="h-5 w-5 shrink-0" />
                                <span className="line-through decoration-slate-300 dark:decoration-slate-600">Deep Analysis &amp; Salary Bands</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => isSignedIn ? router.push('/jobs') : openSignIn({ fallbackRedirectUrl: '/jobs' })}
                            className="flex items-center justify-center w-full h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-500 transition-colors mt-auto"
                        >
                            {isSignedIn ? 'Go to Jobs' : 'Get Started'}
                        </button>
                    </motion.div>

                    {/* Pro Plan - Monthly */}
                    <motion.div variants={cardVariants} className="relative rounded-2xl bg-white dark:bg-slate-800 p-8 border-2 border-sh-primary flex flex-col shadow-xl shadow-sh-primary/10 transform lg:-translate-y-4 h-full">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sh-primary text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md whitespace-nowrap">
                            Limited Time Only
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">SkillHire Pro <span className="text-sm font-normal text-slate-500">(1 Month)</span></h3>
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-slate-400/80 dark:text-slate-500 line-through decoration-slate-400/50">₹299</span>
                            <span className="text-5xl font-black text-slate-900 dark:text-white">₹199</span>
                            <span className="text-slate-500 text-sm font-medium">/ mo</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span><span className="font-bold text-slate-900 dark:text-white">Unlimited</span> Job Feed Access</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span>Access to <span className="font-bold text-slate-900 dark:text-white">&lt;24hr Fresh Jobs</span></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span>Curated <span className="font-bold text-slate-900 dark:text-white">High-Paying</span> startup roles</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span><span className="font-bold text-slate-900 dark:text-white">Unlimited</span> AI Resume Matching</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span>Deep Resume Analysis &amp; Fixes</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                                <CheckCircle className="text-sh-primary h-5 w-5 shrink-0" />
                                <span>View Transparent Salary Bands</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleUnlockPro('monthly')}
                            disabled={isUnlocking !== null}
                            className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-sh-primary hover:bg-sh-primary-dark text-white font-bold shadow-lg transition-all disabled:opacity-70 group mt-auto"
                        >
                            {isUnlocking === 'monthly' ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                <>Unlock Monthly <span className="group-hover:translate-x-1 transition-transform inline-block">→</span></>
                            )}
                        </button>
                    </motion.div>

                    {/* Pro Plan - 6 Months */}
                    <motion.div variants={cardVariants} className="relative rounded-2xl bg-[#047756] p-8 border-2 border-[#047756] flex flex-col shadow-xl shadow-sh-primary/30 h-full">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#047756] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-md whitespace-nowrap">
                            Best Value 🔥
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">SkillHire Pro <span className="text-sm font-normal text-white/70">(6 Months)</span></h3>
                        <div className="flex flex-col gap-1 mb-6">
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-white/60 line-through decoration-white/40">₹1,794</span>
                                <span className="text-5xl font-black text-white">₹999</span>
                            </div>
                            <span className="text-emerald-300 text-sm font-semibold tracking-wide">Billed once (₹166/month)</span>
                        </div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm text-white/90">
                                <CheckCircle className="text-emerald-300 h-5 w-5 shrink-0" />
                                <span><span className="font-bold text-white">All Pro Benefits</span> included</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/90">
                                <CheckCircle className="text-emerald-300 h-5 w-5 shrink-0" />
                                <span>Priority access to <span className="font-bold text-white">&lt;24hr Fresh Jobs</span></span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/90">
                                <CheckCircle className="text-emerald-300 h-5 w-5 shrink-0" />
                                <span>Save <span className="font-bold text-white">45%</span> vs monthly plan</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm text-white/90">
                                <CheckCircle className="text-emerald-300 h-5 w-5 shrink-0" />
                                <span>Long-term career support</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleUnlockPro('6month')}
                            disabled={isUnlocking !== null}
                            className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-white hover:bg-slate-100 text-[#047756] font-black shadow-lg transition-all disabled:opacity-70 group mt-auto"
                        >
                            {isUnlocking === '6month' ? (
                                <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                            ) : (
                                <>Get 6 Months <span className="group-hover:translate-x-1 transition-transform inline-block">→</span></>
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}
