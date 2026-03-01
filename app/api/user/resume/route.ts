import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const maxDuration = 60; // Prevent Vercel serverless function timeouts

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await User.findOne({ clerk_id: userId });

        if (!user) {
            return NextResponse.json({ hasSavedResume: false }, { status: 200 });
        }

        return NextResponse.json({
            hasSavedResume: !!user.resume_text,
            resumeText: !!user.resume_text
        }, { status: 200 });

    } catch (error) {
        console.error('Error fetching user resume state:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const data = await req.formData();
        const file = data.get('resume') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Missing resume file.' }, { status: 400 });
        }

        let resumeText = '';
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const tmpPath = path.join(os.tmpdir(), `base-resume-${Date.now()}.pdf`);
        fs.writeFileSync(tmpPath, buffer);

        try {
            // Call standalone node script
            const scriptPath = path.join(process.cwd(), 'scripts', 'parse-pdf.js');
            const { stdout, stderr } = await execAsync(`node "${scriptPath}" "${tmpPath}"`);

            if (stderr && stderr.includes('error')) {
                throw new Error("PDF processing script error: " + stderr);
            }

            const result = JSON.parse(stdout);
            if (result.error) {
                throw new Error(result.error);
            }

            resumeText = result.text;
        } finally {
            try { fs.unlinkSync(tmpPath); } catch (e) { console.error('Cleanup error:', e); }
        }

        if (!resumeText) {
            return NextResponse.json({ error: 'Could not extract text from the PDF.' }, { status: 400 });
        }

        // Upsert the user and save the text
        await User.findOneAndUpdate(
            { clerk_id: userId },
            {
                $set: {
                    resume_text: resumeText,
                },
                $setOnInsert: { created_at: new Date() } // In case the user doc didn't exist
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, message: 'Base resume saved successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Error saving base resume:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
