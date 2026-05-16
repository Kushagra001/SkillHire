import { Metadata } from 'next';
import Link from 'next/link';
import { Flame, TrendingUp, Pause, Building2, Search, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { CompanyLogo } from '@/components/CompanyLogo';
import { PremiumBackground } from '@/components/PremiumBackground';

export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
    title: 'Hiring Pulse | SkillHire',
    description: 'Real-time signals of active hiring this week. See which companies are accelerating their hiring.',
};

function getVelocityInfo(count: number) {
    if (count >= 5) {
        return {
            label: 'Hot',
            icon: Flame,
            color: 'text-orange-600 bg-orange-50 border-orange-200 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-800/50',
            glow: 'shadow-[0_0_15px_rgba(234,88,12,0.15)] dark:shadow-[0_0_15px_rgba(234,88,12,0.05)]'
        };
    }
    if (count >= 2) {
        return {
            label: 'Active',
            icon: TrendingUp,
            color: 'text-blue-600 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-800/50',
            glow: 'shadow-[0_0_15px_rgba(37,99,235,0.1)] dark:shadow-[0_0_15px_rgba(37,99,235,0.05)]'
        };
    }
    return {
        label: 'Slow',
        icon: Pause,
        color: 'text-slate-500 bg-slate-50 border-slate-200 dark:text-slate-400 dark:bg-slate-800/40 dark:border-slate-700/50',
        glow: ''
    };
}

export default async function CompaniesPage() {
    await dbConnect();

    const pipeline = [
        {
            $group: {
                _id: { $toLower: { $trim: { input: '$company' } } },
                company: { $first: '$company' }, // preserve original casing for display
                newJobsCount: { $sum: 1 },
                logos: { $push: '$logo' },
                rawLogos: { $push: '$raw_data.logo' },
                employerLogos: { $push: '$raw_data.employer.logoUrl' }
            }
        },
        {
            $sort: { newJobsCount: -1 } as Record<string, 1 | -1>
        }
    ];

    const aggregated = await Job.aggregate(pipeline);

    const companies: { company: string; newJobsCount: number; logo: string | null }[] = aggregated.map((c: any) => {
        const logo = c.logos?.find((l: any) => typeof l === 'string' && l.trim().length > 0) || 
                     c.employerLogos?.find((l: any) => typeof l === 'string' && l.trim().length > 0) ||
                     c.rawLogos?.find((l: any) => typeof l === 'string' && l.trim().length > 0) || 
                     null;
                     
        let companyName = c.company;
        if (!companyName && c._id) companyName = c._id;
        if (typeof companyName !== 'string') companyName = '';
        companyName = companyName.trim();

        return {
            company: companyName,
            newJobsCount: c.newJobsCount,
            logo
        };
    }).filter(c => c.company.length > 0 && c.company !== '?');

    const totalCompanies = companies.length;
    const hotCompanies = companies.filter(c => c.newJobsCount >= 5).length;
    const totalJobs = companies.reduce((acc, curr) => acc + curr.newJobsCount, 0);

    return (
        <div className="min-h-screen bg-[#f9fbfb] dark:bg-background text-slate-900 dark:text-slate-100 font-sans selection:bg-sh-primary/30 selection:text-sh-primary-dark">
            {/* Header section with gradient and blur */}
            <div className="relative pt-32 pb-24 overflow-hidden border-b border-gray-200 dark:border-slate-800/60 bg-white dark:bg-background">
                <PremiumBackground className="z-0" />
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/jobs" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-sh-primary transition-all mb-8 shadow-sm w-fit">
                        <ArrowRight className="h-4 w-4 rotate-180" /> Back to Jobs
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight mb-6 flex items-center gap-4">
                                Hiring Pulse <Flame className="h-10 w-10 text-orange-500 fill-orange-500/20 drop-shadow-sm" />
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                                Real-time signals on which companies are on a hiring sprint. 
                                We track every job posted in the last 7 days to surface momentum.
                            </p>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6 text-sm bg-white/60 dark:bg-slate-900/60 backdrop-blur-md p-5 rounded-2xl border border-gray-200/50 dark:border-slate-800/50 shadow-xl shadow-slate-200/20 dark:shadow-none shrink-0 w-full md:w-auto mt-6 md:mt-0">
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{hotCompanies}</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Hot Companies</span>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-slate-700/50" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCompanies}</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Active</span>
                            </div>
                            <div className="w-px h-12 bg-gray-200 dark:bg-slate-700/50" />
                            <div className="flex flex-col">
                                <span className="text-2xl font-black text-sh-primary">{totalJobs}</span>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">New Jobs (7d)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {companies.map((companyData) => {
                        const { label, icon: Icon, color, glow } = getVelocityInfo(companyData.newJobsCount);
                        
                        return (
                            <Link 
                                href={`/jobs?q=${encodeURIComponent(companyData.company)}`}
                                key={companyData.company}
                                aria-label={`View jobs at ${companyData.company}`}
                                className={`group flex flex-col bg-white dark:bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-slate-800/50 hover:border-sh-primary/40 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 relative overflow-hidden ${glow}`}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-sh-primary/10 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                
                                <div className="flex items-start justify-between mb-5 relative z-10">
                                    <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800">
                                        <CompanyLogo 
                                            logo={companyData.logo} 
                                            company={companyData.company} 
                                            size="lg" 
                                        />
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        {label}
                                    </span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 truncate relative z-10">
                                    {companyData.company}
                                </h3>
                                
                                <div className="mt-auto pt-5 flex items-center justify-between border-t border-gray-100 dark:border-slate-800/50 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Posted (7d)</span>
                                        <span className="text-sm font-bold text-sh-primary-dark dark:text-sh-primary">
                                            {companyData.newJobsCount} {companyData.newJobsCount === 1 ? 'Job' : 'Jobs'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-sh-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                                        <Search aria-hidden="true" className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                
                {companies.length === 0 && (
                    <div className="text-center py-32 bg-white/50 dark:bg-slate-900/30 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-slate-800/50 shadow-sm">
                        <Building2 aria-hidden="true" className="h-16 w-16 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">No companies found</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-lg">We don't have any hiring data for the last 7 days.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
