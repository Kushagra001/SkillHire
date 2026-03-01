import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export async function POST(request: Request) {
    try {
        // 1. Verify auth server-side — cannot be spoofed by client
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Verify premium status via Clerk publicMetadata
        const user = await currentUser();
        const isPremium = user?.publicMetadata?.isPremium === true;
        if (!isPremium) {
            return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
        }

        // 3. Parse body
        const body = await request.json();
        const { jobId } = body;
        if (!jobId) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        await dbConnect();

        // 4. Fetch full job
        const job = await Job.findById(jobId);
        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const jobData = job.toObject();

        return NextResponse.json({
            success: true,
            job: {
                ...jobData,
                is_locked: false,
            }
        });

    } catch (error) {
        console.error('Error unlocking job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
