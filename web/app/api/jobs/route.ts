import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Authenticate the user (server-side — cannot be spoofed by the client)
        const { userId } = await auth();
        let isPremium = false;

        // 2. Check premium status via Clerk publicMetadata
        if (userId) {
            const user = await currentUser();
            isPremium = user?.publicMetadata?.isPremium === true;
        }

        // 3. Parse query params (pagination + filters preserved)
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '15');
        const search = searchParams.get('q') || '';
        const location = searchParams.get('location') || '';
        const source = searchParams.get('source') || '';
        const gradYear = searchParams.get('gradYear') || '';
        const experienceStr = searchParams.get('experience') || '';
        const experience = experienceStr ? experienceStr.split(',') : [];
        const jobTypesStr = searchParams.get('jobTypes') || '';
        const jobTypes = jobTypesStr ? jobTypesStr.split(',') : [];
        const premiumOnly = searchParams.get('premiumOnly') === 'true';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { is_active: true };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (gradYear) {
            query.tags = { $in: [new RegExp(`Batch:?${gradYear}`, 'i'), new RegExp(`${gradYear}`, 'i')] };
        }

        if (experience.length > 0) {
            query.experience = { $in: experience.map(exp => new RegExp(exp.replace('+', '\\+'), 'i')) };
        }

        if (jobTypes.length > 0) {
            query.job_type = { $in: jobTypes.map(t => new RegExp(`^${t}$`, 'i')) };
        }

        if (source) {
            const tagMap: Record<string, string> = {
                Greenhouse: 'Greenhouse',
                Indeed: 'Apify',
                Google: 'SerpApi',
            };
            query.tags = { $in: [tagMap[source] ?? source] };
        }

        if (premiumOnly) {
            query.is_premium = true;
        }

        const skip = (page - 1) * limit;

        // 4. Fetch jobs
        const jobs = await Job.find(query).sort({ created_at: -1 }).skip(skip).limit(limit);
        const totalJobs = await Job.countDocuments(query);
        const totalPages = Math.ceil(totalJobs / limit);

        // Freshness threshold: jobs posted in the last 24h are premium-only
        const freshThreshold = Date.now() - 24 * 60 * 60 * 1000;

        // The Redaction Engine — applied per-job, server-side
        const secureJobs = jobs.map((job) => {
            const { distribution_status, distributed_channels, ...jobObj } = job.toObject();

            // Only lock fresh jobs (< 24h) for non-premium users.
            const isFresh = new Date(jobObj.created_at).getTime() > freshThreshold;

            // Lock explicitly marked premium jobs for non-premium users.
            const isLocked = jobObj.is_premium && !isPremium;

            if (isLocked) {
                // Hard-redact: apply_link never leaves the server for locked jobs
                const teaser = (jobObj.description || '').substring(0, 150);
                return {
                    ...jobObj,
                    apply_link: null,
                    description: teaser
                        ? teaser + '...\n\n🔒 Unlock Premium to view the full description and apply instantly.'
                        : null,
                    is_locked: true,
                };
            }

            return { ...jobObj, is_locked: false };
        });

        return NextResponse.json({
            jobs: secureJobs,
            pagination: { currentPage: page, totalPages, totalJobs },
        });

    } catch (error) {
        console.error('Error fetching jobs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

