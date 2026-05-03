import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mongodb";
import TrackedJob from "@/models/TrackedJob";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        const body = await request.json();
        const { status, notes } = body;

        const VALID_STATUSES = ['Saved', 'Applied', 'Responded', 'Interview', 'Offer', 'Rejected'];
        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
        }

        await dbConnect();

        // Ensure user owns this tracked job
        const trackedJob = await TrackedJob.findOne({ _id: id, clerk_id: userId });

        if (!trackedJob) {
            return NextResponse.json({ error: "Tracked job not found" }, { status: 404 });
        }

        if (status) trackedJob.status = status;
        if (notes !== undefined) trackedJob.notes = notes;
        trackedJob.updated_at = new Date();

        await trackedJob.save();

        return NextResponse.json(trackedJob, { status: 200 });
    } catch (error) {
        console.error("Error updating tracked job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = resolvedParams.id;

        await dbConnect();

        // Ensure user owns this tracked job
        const result = await TrackedJob.deleteOne({ _id: id, clerk_id: userId });

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: "Tracked job not found or not authorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Tracked job deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting tracked job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
