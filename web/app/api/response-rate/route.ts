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
 *   company  — single company name (required)
 */
export async function GET(req: NextRequest) {
    try {
        const company = req.nextUrl.searchParams.get('company')?.trim().toLowerCase();
        if (!company) {
            return NextResponse.json({ error: 'company param required' }, { status: 400 });
        }

        await dbConnect();

        const [result] = await CompanyFeedback.aggregate([
            { $match: { company: new RegExp(`^${company}$`, 'i') } },
            {
                $group: {
                    _id: { $toLower: '$company' },
                    total: { $sum: 1 },
                    responded: { $sum: { $cond: ['$responded', 1, 0] } },
                },
            },
        ]);

        if (!result || result.total < 3) {
            // Don't show stats until we have at least 3 votes (avoid misleading single-vote rates)
            return NextResponse.json({ hasData: false });
        }

        const rate = Math.round((result.responded / result.total) * 100);
        return NextResponse.json({
            hasData: true,
            company,
            responseRate: rate,
            totalVotes: result.total,
        });
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

        // Upsert: if user already voted on this job, update their vote
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
    } catch (err: unknown) {
        // Duplicate key (user already voted & upsert conflict) — treat as success
        if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === '11000') {
            return NextResponse.json({ success: true, duplicate: true });
        }
        console.error('[response-rate POST]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
