import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Groq from 'groq-sdk';

export const maxDuration = 60; // Prevent Vercel serverless function timeouts

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get('resume') as File | null;
        let jobDescription = data.get('jobDescription') as string | null;
        const jobId = data.get('jobId') as string | null;
        const useSavedResume = data.get('useSavedResume') === 'true';

        if (!useSavedResume && !file) {
            return NextResponse.json(
                { error: 'Missing resume file.' },
                { status: 400 }
            );
        }

        if (!jobDescription && !jobId) {
            return NextResponse.json(
                { error: 'No job description or job ID provided.' },
                { status: 400 }
            );
        }

        await dbConnect();
        const { userId } = await auth();

        // 1. Enforce Usage Pricing Quota
        let userDoc = null;
        let isPremium = false;

        if (userId) {
            // Check Clerk's publicMetadata directly as the source of truth for Premium status
            const clerkUser = await currentUser();
            isPremium = clerkUser?.publicMetadata?.isPremium === true;

            userDoc = await User.findOne({ clerk_id: userId });

            if (userDoc && !isPremium) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                let scanCount = userDoc.ai_scans_count || 0;
                const lastScan = userDoc.last_scan_date ? new Date(userDoc.last_scan_date) : null;
                if (lastScan) {
                    lastScan.setHours(0, 0, 0, 0);
                }

                // Reset counter if it's a new day
                if (!lastScan || lastScan.getTime() !== today.getTime()) {
                    scanCount = 0;
                }

                if (scanCount >= 3) {
                    return NextResponse.json(
                        { error: 'Daily free scan limit reached. Please upgrade to Pro.', code: 'QUOTA_EXCEEDED' },
                        { status: 402 }
                    );
                }
            }
        }

        let resumeText = '';

        // 2. Obtain Resume Text (Saved vs Uploaded)
        if (useSavedResume) {
            if (!userDoc || !userDoc.resume_text) {
                return NextResponse.json(
                    { error: 'No saved base resume found. Please upload one.' },
                    { status: 400 }
                );
            }
            resumeText = userDoc.resume_text;
        } else if (file) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const pdfParse = require('pdf-parse');
            try {
                const parsedData = await pdfParse(buffer);
                resumeText = parsedData.text;
            } catch (error: any) {
                console.error("PDF parsing error:", error);
                throw new Error("Could not extract text from the PDF.");
            }
        } // End of file parse block

        // 3. Fetch Full Job Description if jobId is provided
        if (jobId) {
            const Job = require('@/models/Job').default || require('@/models/Job');
            const jobDoc = await Job.findById(jobId);
            if (jobDoc) {
                // Determine the best description text available on the DB document
                let fullDesc = jobDoc.description;
                if (!fullDesc) {
                    if (jobDoc.raw_data && jobDoc.raw_data.description) {
                        fullDesc = typeof jobDoc.raw_data.description === 'object'
                            ? jobDoc.raw_data.description.text
                            : jobDoc.raw_data.description;
                    } else if (jobDoc.formatted_about) {
                        fullDesc = jobDoc.formatted_about;
                    }
                }

                // Fallback: If description is still missing or suspiciously short (< 150 chars), synthesize one
                if (!fullDesc || fullDesc.length < 150) {
                    console.log(`[QuickMatch Debug] Description too short or missing for job ${jobId}. Synthesizing fallback.`);
                    const syntheticDescParts = [];
                    if (jobDoc.title) syntheticDescParts.push(`Job Title: ${jobDoc.title}`);
                    if (jobDoc.company) syntheticDescParts.push(`Company: ${jobDoc.company}`);
                    if (jobDoc.job_type) syntheticDescParts.push(`Type: ${jobDoc.job_type}`);
                    if (jobDoc.experience) syntheticDescParts.push(`Experience Required: ${jobDoc.experience}`);
                    if (jobDoc.skills && jobDoc.skills.length > 0) syntheticDescParts.push(`Required Skills: ${jobDoc.skills.join(', ')}`);
                    if (jobDoc.tags && jobDoc.tags.length > 0) syntheticDescParts.push(`Tags & Tech Stack: ${jobDoc.tags.join(', ')}`);

                    const syntheticDesc = syntheticDescParts.join('\n');

                    // Combine what we have. If there was a tiny description, keep it, but append the synthetic metadata.
                    fullDesc = fullDesc ? `${fullDesc}\n\n---\nAdditional Context:\n${syntheticDesc}` : syntheticDesc;
                }

                if (fullDesc && fullDesc.trim().length > 0) {
                    jobDescription = fullDesc;
                }
            }
        }

        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            console.error('GROQ_API_KEY is not set');
            return NextResponse.json(
                { error: 'Server configuration error.' },
                { status: 500 }
            );
        }

        const client = new Groq({ apiKey: groqApiKey });

        console.log(`[QuickMatch Debug] useSavedResume: ${useSavedResume}`);
        console.log(`[QuickMatch Debug] resumeText length: ${resumeText?.length}`);
        console.log(`[QuickMatch Debug] jobDescription length: ${jobDescription?.length}`);

        const systemPrompt = `You are an expert Applicant Tracking System (ATS). 
Your task is to analyze a candidate's resume against a provided job description.
You MUST return ONLY a valid JSON object matching this exact structure:
{
  "job_title": "string (Extracted from the job posting, or inferred. Keep it concise, e.g. Senior Engineer.)",
  "match_percentage": "number (0-100. Calculate this strictly based on the ratio of matched skills to total required skills. E.g. if 4 out of 5 required skills are found, return 80. Do not default to 85. Be precise.)",
  "matched_skills": "string[]",
  "missing_skills": "string[] (CRITICAL: Do not hallucinative missing skills. ONLY list skills explicitly required by the Job Description that are definitively NOT present in the Resume Text. If the resume has it, DO NOT include it here)",
  "ai_recommendation": "string (A concise, actionable 1-2 sentence tip on how to improve the resume for this specific role)"
}
Do not include any other text or markdown block backticks outside of the JSON object.`;

        const userPrompt = `Job Description:
${jobDescription}

Resume Text:
${resumeText}`;

        const completion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.2,
            response_format: { type: 'json_object' }
        });

        const rawContent = completion.choices[0]?.message?.content;
        if (!rawContent) {
            throw new Error('No content returned from Groq');
        }

        const parsedResult = JSON.parse(rawContent);

        // Increment quota tracking upon successful scan
        if (userId && userDoc) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let scanCount = userDoc.ai_scans_count || 0;
            const lastScan = userDoc.last_scan_date ? new Date(userDoc.last_scan_date) : null;
            if (lastScan) {
                lastScan.setHours(0, 0, 0, 0);
            }

            if (!lastScan || lastScan.getTime() !== today.getTime()) {
                scanCount = 1;
            } else {
                scanCount += 1;
            }

            await User.updateOne(
                { _id: userDoc._id },
                {
                    $set: {
                        ai_scans_count: scanCount,
                        last_scan_date: new Date()
                    }
                }
            );
        }

        return NextResponse.json(parsedResult, { status: 200 });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'An internal error occurred during analysis.' },
            { status: 500 }
        );
    }
}
