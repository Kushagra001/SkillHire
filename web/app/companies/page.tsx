import { Metadata } from 'next';
import Link from 'next/link';
import { Flame, TrendingUp, Pause, Building2, Search, ArrowRight } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { CompanyLogo } from '@/components/CompanyLogo';

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
                _id: '$company',
                newJobsCount: { $sum: 1 },
                logos: { $push: '$logo' },
                rawLogos: { $push: '$raw_data.logo' }
            }
        },
        {
            $sort: { newJobsCount: -1 } as Record<string, 1 | -1>
        }
    ];

    const aggregated = await Job.aggregate(pipeline);

    const companies: { company: string; newJobsCount: number; logo: string | null }[] = aggregated.map((c: any) => {
        const logo = c.logos.find((l: any) => typeof l === 'string' && l.trim().length > 0) || 
                     c.rawLogos.find((l: any) => typeof l === 'string' && l.trim().length > 0) || 
                     null;
        return {
            company: c._id,
            newJobsCount: c.newJobsCount,
            logo
        };
    });

    const totalCompanies = companies.length;
    const hotCompanies = companies.filter(c => c.newJobsCount >= 5).length;
    const totalJobs = companies.reduce((acc, curr) => acc + curr.newJobsCount, 0);

    return (
        <div className="min-h-screen bg-[#f9fbfb] dark:bg-[#060D18] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#41b4a5]/30 selection:text-[#369689]">
            {/* Header section with gradient and blur */}
            <div className="relative pt-24 pb-16 overflow-hidden border-b border-gray-200 dark:border-slate-800/60 bg-white dark:bg-[#0B0F19]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#41b4a5]/10 rounded-full blur-3xl -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />
                
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-[#41b4a5] transition-colors mb-6">
                        <ArrowRight className="h-4 w-4 rotate-180" /> Back to Jobs
                    </Link>
                    
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4 flex items-center gap-3">
                                Hiring Pulse <Flame className="h-8 w-8 text-orange-500 fill-orange-500/20" />
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                                Real-time signals on which companies are on a hiring sprint. 
                                We track every job posted in the last 7 days to surface momentum.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-gray-100 dark:border-slate-700/50 shrink-0">
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white">{hotCompanies}</span>
                                <span className="text-slate-500 dark:text-slate-400">Hot Companies</span>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white">{totalCompanies}</span>
                                <span className="text-slate-500 dark:text-slate-400">Active Companies</span>
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
                            <div className="flex flex-col">
                                <span className="font-bold text-slate-900 dark:text-white">{totalJobs}</span>
                                <span className="text-slate-500 dark:text-slate-400">New Jobs (7d)</span>
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
                                className={`
                                    group flex flex-col bg-white dark:bg-[#0B0F19] rounded-2xl p-5 
                                    border border-gray-200 dark:border-slate-800/80
                                    hover:border-[#41b4a5]/40 hover:shadow-lg dark:hover:shadow-[#41b4a5]/10 
                                    transition-all duration-300 relative overflow-hidden ${glow}
                                `}
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#41b4a5]/5 to-transparent rounded-bl-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                                
                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <CompanyLogo 
                                        logo={companyData.logo} 
                                        company={companyData.company} 
                                        size="lg" 
                                    />
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${color}`}>
                                        <Icon className="w-3.5 h-3.5 shrink-0" />
                                        {label}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 truncate relative z-10">
                                    {companyData.company}
                                </h3>
                                
                                <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100 dark:border-slate-800/50 relative z-10">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Posted</span>
                                        <span className="text-sm font-semibold text-[#0A3D62] dark:text-[#41b4a5]">
                                            {companyData.newJobsCount} {companyData.newJobsCount === 1 ? 'Job' : 'Jobs'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-[#41b4a5] group-hover:text-white transition-colors">
                                        <Search className="h-4 w-4" />
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
                
                {companies.length === 0 && (
                    <div className="text-center py-24 bg-white dark:bg-[#0B0F19] rounded-2xl border border-gray-200 dark:border-slate-800/80">
                        <Building2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No companies found</h3>
                        <p className="text-slate-500">We don't have any hiring data for the last 7 days.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
