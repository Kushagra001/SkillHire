import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import TrackedJob from "@/models/TrackedJob";

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const jobId = searchParams.get('jobId');

        await dbConnect();

        const query: any = { clerk_id: userId };
        if (jobId) {
            query.job_id = jobId;
        }

        const trackedJobs = await TrackedJob.find(query).sort({ updated_at: -1 });

        return NextResponse.json(trackedJobs, { status: 200 });
    } catch (error) {
        console.error("Error fetching tracked jobs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { job_id, title, company, location, apply_link, logo, status = 'Saved' } = body;

        if (!job_id || !title || !company) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // Atomic upsert: only set status/fields on first insert, never overwrite existing status
        const trackedJob = await TrackedJob.findOneAndUpdate(
            { clerk_id: userId, job_id },
            {
                $setOnInsert: {
                    title,
                    company,
                    location: location ?? 'Unknown',
                    apply_link,
                    logo,
                    status,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        return NextResponse.json(trackedJob, { status: 201 });
    } catch (error) {
        console.error("Error saving tracked job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
