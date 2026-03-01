import Link from 'next/link';
import { Twitter, Linkedin, Github } from 'lucide-react';

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
                            <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-sh-primary hover:bg-sh-primary/10 transition-colors">
                                <Twitter className="h-5 w-5" />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-sh-primary hover:bg-sh-primary/10 transition-colors">
                                <Linkedin className="h-5 w-5" />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                            <a href="#" className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-sh-primary hover:bg-sh-primary/10 transition-colors">
                                <Github className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
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
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-slate-500 hover:text-sh-primary transition-colors">Terms of Service</a></li>
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
