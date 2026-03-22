import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';

const UI_AVATARS_HOST = 'ui-avatars.com';

/**
 * Resolves the best logo URL for a job.
 *
 * Priority:
 *   1. Stored logo that isn't a ui-avatars placeholder (real logo from scraper)
 *   2. logo inside raw_data (Apify/SerpApi store it there)
 *   3. Google's high-res favicon service — free, no-key, works for 99% of companies
 *   4. null → frontend onError handler shows ui-avatars as absolute last resort
 */
function resolveLogoUrl(
    storedLogo: string | null | undefined,
    rawDataLogo: string | null | undefined,
    companyName: string
): string | null {
    // 1. Real stored logo (not a ui-avatars placeholder)
    if (storedLogo && !storedLogo.includes(UI_AVATARS_HOST)) {
        return storedLogo;
    }

    // 2. Real logo in raw_data (Apify companyLogo, SerpApi thumbnail, etc.)
    if (rawDataLogo && typeof rawDataLogo === 'string' && !rawDataLogo.includes(UI_AVATARS_HOST)) {
        return rawDataLogo;
    }

    // 3. No real logo available — guess the domain from the company name and use
    //    Google's favicon service. Google returns high-res logos for known companies.
    //    For unknown companies it returns a generic 16×16 globe — the CompanyLogo
    //    component detects this via naturalWidth on load and falls back to an
    //    initials badge automatically.
    if (companyName) {
        const domain = companyName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim()
            .split(/\s+/)[0];
        if (domain && domain.length > 1) {
            return `https://www.google.com/s2/favicons?domain=${domain}.com&sz=128`;
        }
    }

    // 4. No logo available — frontend will render initials badge
    return null;
}

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
        const experienceStr = searchParams.get('experience') || '';
        const experience = experienceStr ? experienceStr.split(',') : [];
        const jobTypesStr = searchParams.get('jobTypes') || '';
        const jobTypes = jobTypesStr ? jobTypesStr.split(',') : [];
        const premiumOnly = searchParams.get('premiumOnly') === 'true';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const query: any = { is_active: true };

        if (search) {
            // Split the query into individual tokens so "Backend Developer" matches jobs
            // that have "backend" in tags AND "developer" in title, even if neither field
            // contains the full phrase. Each token is OR-ed across all text fields.
            const tokens = search.trim().split(/\s+/).filter(Boolean);

            if (tokens.length === 1) {
                // Single-word search: match in any of these fields
                const rx = { $regex: tokens[0], $options: 'i' };
                query.$or = [
                    { title: rx },
                    { company: rx },
                    { tags: rx },
                    { tech_stack: rx },
                    { description: rx },
                ];
            } else {
                // Multi-word search: use $and so that EVERY token must appear somewhere
                // in the document, but each token can match in ANY field.
                // e.g. "Backend Developer" → token "Backend" OR "Developer" must each be
                // found somewhere across the five indexed fields.
                query.$and = tokens.map((token) => {
                    const rx = { $regex: token, $options: 'i' };
                    return {
                        $or: [
                            { title: rx },
                            { company: rx },
                            { tags: rx },
                            { tech_stack: rx },
                            { description: rx },
                        ],
                    };
                });
            }
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (experience.length > 0) {
            // Expand each normalized filter label into equivalent raw-data terms
            // so scraped jobs with non-standard values (e.g. "fresher", "0 years") still match
            const experiencePatterns: RegExp[] = [];
            for (const exp of experience) {
                const lower = exp.toLowerCase();
                if (lower.includes('0') || lower.includes('fresh') || lower.includes('entry') || lower.includes('junior')) {
                    // Freshers / 0-2 years
                    experiencePatterns.push(
                        /fresher/i, /0[\s-]?(to|–|-)?[\s-]?[12][\s-]?years?/i,
                        /entry[\s-]?level/i, /no[\s-]?experience/i,
                        new RegExp(exp.replace(/[+]/g, '\\+'), 'i')
                    );
                } else {
                    experiencePatterns.push(new RegExp(exp.replace(/[+]/g, '\\+'), 'i'));
                }
            }
            query.experience = { $in: experiencePatterns };
        }

        if (jobTypes.length > 0) {
            // Use case-insensitive substring matching (not ^ anchored) so "Full Time" matches "Full-time", "full time", etc.
            query.job_type = { $in: jobTypes.map(t => new RegExp(t.replace(/[\s-_]/g, '[\\s\\-_]?'), 'i')) };
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

        // Resolve the best logo URL for this job.
        // Priority chain:
        //   1. A real stored logo (not a ui-avatars placeholder)
        //   2. logo inside raw_data (some scrapers store it there)
        //   3. logo.dev free API — resolves by guessed domain (e.g. "Google" → google.com)
        //   4. null → frontend onError handler shows ui-avatars as last resort
        const companyName: string = jobObj.company || '';
        const resolvedLogo: string | null = resolveLogoUrl(
            jobObj.logo,
            jobObj.raw_data?.logo,
            companyName
        );


            // Only lock fresh jobs (< 24h) for non-premium users.
            const isFresh = new Date(jobObj.created_at).getTime() > freshThreshold;

            // Lock explicitly marked premium jobs for non-premium users.
            const isLocked = jobObj.is_premium && !isPremium;

            if (isLocked) {
                // Hard-redact: apply_link never leaves the server for locked jobs
                const teaser = (jobObj.description || '').substring(0, 150);
                return {
                    ...jobObj,
                    logo: resolvedLogo,
                    apply_link: null,
                    description: teaser
                        ? teaser + '...\n\n🔒 Unlock Premium to view the full description and apply instantly.'
                        : null,
                    is_locked: true,
                };
            }

            return { ...jobObj, logo: resolvedLogo, is_locked: false };
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

