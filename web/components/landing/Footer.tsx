import Link from 'next/link';
import { Linkedin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-sh-surface-light dark:bg-sh-surface-dark border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="layout-container max-w-7xl mx-auto px-4 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/" className="inline-block mb-6">
                            <div className="h-8 flex items-center justify-start">
                                <img src="/assets/logo.svg" alt="SkillHire Logo" className="h-full w-auto object-contain" />
                            </div>
                        </Link>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-xs leading-relaxed">
                            AI-powered job matching for modern software engineers. Skip the noise, land the interview, and launch your tech career faster.
                        </p>
                        <div className="flex gap-4">
                            {/* Telegram */}
                            <a href="https://t.me/SkillHireFree1" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#0088cc] hover:bg-[#0088cc]/10 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                <span className="sr-only">Telegram</span>
                            </a>
                            {/* LinkedIn */}
                            <a href="https://linkedin.com/company/skillhire-in" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                            {/* Instagram */}
                            <a href="https://www.instagram.com/skillhire.in" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-[#E1306C] hover:bg-[#E1306C]/10 transition-colors">
                                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                                <span className="sr-only">Instagram</span>
                            </a>
                        </div>
                    </div>


                    {/* Links Columns */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                        <ul className="space-y-3">
                            <li><Link href="#features" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Features</Link></li>
                            <li><Link href="#pricing" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Pricing</Link></li>
                            <li><Link href="/jobs" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Job Board</Link></li>
                            <li><Link href="/resume" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Resume AI Matcher</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Career Blog</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Interview Prep</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Resume Templates</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Salary Guides</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">About Us</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Contact Support</a></li>
                            <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400">
                        &copy; {new Date().getFullYear()} SkillHire Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <span className="text-sm text-slate-400 flex items-center gap-1">
                            Made with <span className="text-red-500">&hearts;</span> for developers
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
