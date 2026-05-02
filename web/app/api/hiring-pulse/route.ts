import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        await dbConnect();

        // Jobs have a TTL of 7 days, so all jobs in the database are from the last 7 days.
        // We just need to aggregate and count them by company.
        const pipeline = [
            {
                $group: {
                    _id: '$company',
                    newJobsCount: { $sum: 1 },
                    logo: { $first: '$logo' } // get one logo for the company
                }
            },
            {
                $project: {
                    _id: 0,
                    company: '$_id',
                    newJobsCount: 1,
                    logo: 1
                }
            },
            {
                $sort: { newJobsCount: -1 } as Record<string, 1 | -1>
            }
        ];

        const companies = await Job.aggregate(pipeline);

        return NextResponse.json({ success: true, companies });
    } catch (err) {
        console.error('[hiring-pulse GET]', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
