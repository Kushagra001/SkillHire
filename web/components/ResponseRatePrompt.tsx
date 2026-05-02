'use client';

/**
 * ResponseRatePrompt
 * ------------------
 * Shown inside the Job Details pane after a user clicks "Apply".
 * Asks: "Did [Company] respond to your application?"
 *
 * Flow:
 *  1. User clicks the apply link — the parent passes onApplyClick which calls
 *     this component's reveal logic.
 *  2. After a configurable delay (default 3s) the prompt slides in.
 *  3. User votes 👍 / 👎 → POST /api/response-rate → optimistic UI update.
 *  4. Result is shown: updated rate or a "thanks, first vote" message.
 *
 * Props:
 *   company     — company name (used for API key)
 *   jobId       — MongoDB _id (used as dedup key)
 *   isSignedIn  — if false, prompt is replaced with a sign-in nudge
 *   show        — controlled by parent; set true when user clicks apply
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, MessageCircle, X, LogIn } from 'lucide-react';

interface Props {
    company: string;
    jobId: string;
    isSignedIn: boolean;
    show: boolean;
    onDismiss?: () => void;
}

type VoteState = 'idle' | 'submitting' | 'voted' | 'error';

export function ResponseRatePrompt({ company, jobId, isSignedIn, show, onDismiss }: Props) {
    const [visible, setVisible] = useState(false);
    const [vote, setVote] = useState<boolean | null>(null);
    const [voteState, setVoteState] = useState<VoteState>('idle');
    const [resultRate, setResultRate] = useState<number | null>(null);
    const [resultVotes, setResultVotes] = useState<number | null>(null);

    // Slide in 3 seconds after show=true
    useEffect(() => {
        if (!show) { setVisible(false); return; }
        const t = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(t);
    }, [show]);

    const handleVote = async (responded: boolean) => {
        if (voteState !== 'idle') return;
        setVote(responded);
        setVoteState('submitting');

        try {
            const res = await fetch('/api/response-rate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ job_id: jobId, company, responded }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed');

            setResultRate(data.hasData ? data.responseRate : null);
            setResultVotes(data.totalVotes ?? null);
            setVoteState('voted');
        } catch {
            setVoteState('error');
        }
    };

    const dismiss = () => {
        setVisible(false);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="relative mt-4 rounded-xl border border-[#41b4a5]/30 bg-gradient-to-br from-teal-50/60 to-cyan-50/40 dark:from-teal-950/30 dark:to-cyan-950/20 dark:border-teal-800/40 p-4 shadow-sm"
                >
                    {/* Dismiss */}
                    <button
                        onClick={dismiss}
                        className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#41b4a5]/15">
                            <MessageCircle className="w-4 h-4 text-[#41b4a5]" />
                        </div>
                        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                            Help other job-seekers!
                        </p>
                    </div>

                    {!isSignedIn ? (
                        /* Unauthenticated nudge */
                        <div className="text-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                                Sign in to share whether <span className="font-semibold text-slate-700 dark:text-slate-200">{company}</span> responded to your application.
                            </p>
                            <a
                                href="/login"
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-[#41b4a5] hover:bg-[#369689] px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <LogIn className="w-3 h-3" />
                                Sign in to vote
                            </a>
                        </div>
                    ) : voteState === 'voted' ? (
                        /* Post-vote state */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center"
                        >
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1">
                                {vote ? '👍 Thanks for sharing!' : '👎 Thanks for sharing!'}
                            </p>
                            {resultRate !== null ? (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Based on <span className="font-semibold text-slate-700 dark:text-slate-200">{resultVotes} report{resultVotes !== 1 ? 's' : ''}</span>,{' '}
                                    <span className="font-semibold text-slate-700 dark:text-slate-200">{company}</span> responds{' '}
                                    <span className={`font-bold ${resultRate >= 70 ? 'text-emerald-600 dark:text-emerald-400' : resultRate >= 40 ? 'text-amber-500' : 'text-red-500'}`}>
                                        {resultRate}%
                                    </span>{' '}
                                    of the time.
                                </p>
                            ) : (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Your vote has been recorded. Stats will appear once we have more data.
                                </p>
                            )}
                        </motion.div>
                    ) : voteState === 'error' ? (
                        <p className="text-xs text-red-500 text-center">
                            Something went wrong. Please try again.
                        </p>
                    ) : (
                        /* Idle / submitting state */
                        <>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                Did <span className="font-semibold text-slate-800 dark:text-slate-200">{company}</span> respond to your application?
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleVote(true)}
                                    disabled={voteState === 'submitting'}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-emerald-200 bg-white dark:bg-slate-800 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors disabled:opacity-50"
                                >
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    Yes, they replied
                                </button>
                                <button
                                    onClick={() => handleVote(false)}
                                    disabled={voteState === 'submitting'}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold border border-red-200 bg-white dark:bg-slate-800 dark:border-red-800 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors disabled:opacity-50"
                                >
                                    <ThumbsDown className="w-3.5 h-3.5" />
                                    Ghosted me
                                </button>
                            </div>
                            {voteState === 'submitting' && (
                                <p className="text-[10px] text-slate-400 text-center mt-2 animate-pulse">Saving your response…</p>
                            )}
                        </>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
