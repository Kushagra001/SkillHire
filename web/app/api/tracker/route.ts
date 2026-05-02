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

        // Check if already tracked to avoid duplicates
        let trackedJob = await TrackedJob.findOne({ clerk_id: userId, job_id });

        if (trackedJob) {
            // Update existing
            trackedJob.status = status;
            trackedJob.updated_at = new Date();
            await trackedJob.save();
        } else {
            // Create new
            trackedJob = await TrackedJob.create({
                clerk_id: userId,
                job_id,
                title,
                company,
                location,
                apply_link,
                logo,
                status,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        return NextResponse.json(trackedJob, { status: 201 });
    } catch (error) {
        console.error("Error saving tracked job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
