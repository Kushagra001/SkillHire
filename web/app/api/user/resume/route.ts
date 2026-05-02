import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';

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
            resumeText: !!user.resume_text,
            skills: user.skills || []
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

        try {
            const parsedData = await pdfParse(buffer);
            resumeText = parsedData.text;
        } catch (error: any) {
            console.error("PDF parsing error:", error);
            throw new Error("Could not extract text from the PDF.");
        }

        if (!resumeText) {
            return NextResponse.json({ error: 'Could not extract text from the PDF.' }, { status: 400 });
        }

        // 3. Extract skills using AI
        const groqApiKey = process.env.GROQ_API_KEY?.trim();
        let extractedSkills: string[] | undefined;

        if (groqApiKey) {
            try {
                const groq = new Groq({ apiKey: groqApiKey });
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: 'system',
                            content: 'Extract a flat list of technical skills, programming languages, frameworks, and tools from the resume text. Return ONLY a JSON object: { "skills": ["skill1", "skill2"] }. Be comprehensive but concise.'
                        },
                        { role: 'user', content: resumeText }
                    ],
                    model: 'llama-3.1-8b-instant',
                    response_format: { type: 'json_object' }
                });
                const content = JSON.parse(completion.choices[0]?.message?.content || '{}');
                extractedSkills = Array.isArray(content.skills) ? content.skills : [];
            } catch (e) {
                console.error('Skill extraction failed:', e);
            }
        } else {
            console.warn('Skipping skill extraction because GROQ_API_KEY is not set.');
        }

        const existingUser = await User.findOne({ clerk_id: userId });

        // 4. Upsert the user and save the text + skills
        await User.findOneAndUpdate(
            { clerk_id: userId },
            {
                $set: {
                    resume_text: resumeText,
                    skills: extractedSkills ?? existingUser?.skills ?? []
                },
                $setOnInsert: { created_at: new Date() }
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true, message: 'Base resume saved successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Error saving base resume:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
