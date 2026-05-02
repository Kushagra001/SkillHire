import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import CompanyFeedback from '@/models/CompanyFeedback';

/**
 * GET /api/response-rate?company=google
 * Returns aggregated response rate for one or more companies.
 * Public endpoint — no auth required for reads.
 *
 * Query params:
 *   company   — single company name
 *   companies — comma-separated company names for batch fetching
 */
export async function GET(req: NextRequest) {
    try {
        const companiesParam = req.nextUrl.searchParams.get('companies');
        const singleCompany = req.nextUrl.searchParams.get('company')?.trim().toLowerCase();
        
        let companies: string[] = [];
        if (companiesParam) {
            companies = companiesParam.split(',').map(c => c.trim().toLowerCase());
        } else if (singleCompany) {
            companies = [singleCompany];
        }

        if (companies.length === 0) {
            return NextResponse.json({ error: 'company or companies param required' }, { status: 400 });
        }

        await dbConnect();

        const results = await CompanyFeedback.aggregate([
            { $match: { company: { $in: companies } } },
            {
                $group: {
                    _id: '$company',
                    total: { $sum: 1 },
                    responded: { $sum: { $cond: ['$responded', 1, 0] } },
                },
            },
        ]);

        const formattedResults = results.reduce((acc: any, curr) => {
            if (curr.total >= 3) {
                acc[curr._id] = {
                    hasData: true,
                    responseRate: Math.round((curr.responded / curr.total) * 100),
                    totalVotes: curr.total
                };
            }
            return acc;
        }, {});

        // If single company was requested, return the old format for backward compatibility
        if (singleCompany && !companiesParam) {
            const result = formattedResults[singleCompany];
            if (!result) return NextResponse.json({ hasData: false });
            return NextResponse.json({
                hasData: true,
                company: singleCompany,
                ...result
            });
        }

        return NextResponse.json(formattedResults);
    } catch (err) {
        console.error('[response-rate GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * POST /api/response-rate
 * Submit feedback: did this company respond to your application?
 * Requires authentication. One vote per user per job.
 *
 * Body: { job_id: string, company: string, responded: boolean }
 */
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { job_id, company, responded } = body;

        if (!job_id || !company || typeof responded !== 'boolean') {
            return NextResponse.json({ error: 'job_id, company, and responded (boolean) are required' }, { status: 400 });
        }

        await dbConnect();

        // 1. Security: Verify that the job_id actually belongs to the claimed company
        const Job = (await import('@/models/Job')).default;
        const jobDoc = await Job.findById(job_id);
        
        if (!jobDoc) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Normalize for comparison
        const actualCompany = jobDoc.company.trim().toLowerCase();
        const providedCompany = company.trim().toLowerCase();

        if (actualCompany !== providedCompany) {
            return NextResponse.json({ 
                error: 'Company mismatch. Vote must match the company of the job listing.' 
            }, { status: 400 });
        }

        // 2. Upsert: if user already voted on this job, update their vote
        await CompanyFeedback.findOneAndUpdate(
            { job_id, user_id: userId },
            {
                $set: {
                    company: company.trim().toLowerCase(),
                    responded,
                    created_at: new Date(),
                },
            },
            { upsert: true, new: true }
        );

        // Return refreshed aggregate immediately so the UI updates without a refetch
        const [result] = await CompanyFeedback.aggregate([
            { $match: { company: company.trim().toLowerCase() } },
            {
                $group: {
                    _id: '$company',
                    total: { $sum: 1 },
                    responded: { $sum: { $cond: ['$responded', 1, 0] } },
                },
            },
        ]);

        const rate = result ? Math.round((result.responded / result.total) * 100) : null;

        return NextResponse.json({
            success: true,
            hasData: result && result.total >= 3,
            responseRate: rate,
            totalVotes: result?.total ?? 1,
        });
    } catch (err: any) {
        // Duplicate key (user already voted & upsert conflict)
        if (err?.code === 11000) {
            return NextResponse.json({ success: true, duplicate: true });
        }
        console.error('[response-rate POST]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
