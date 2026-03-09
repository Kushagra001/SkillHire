import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Admin User ID is now dynamically loaded from the environment
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId: callerId } = await auth();

    if (!ADMIN_USER_ID) {
        console.error('ADMIN_USER_ID environment variable is not set.');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!callerId || callerId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId } = await params;
    const { isPremium } = await req.json() as { isPremium: boolean };

    const client = await clerkClient();
    const updated = await client.users.updateUserMetadata(userId, {
        publicMetadata: {
            isPremium,
            premiumSince: isPremium ? new Date().toISOString() : null,
        },
    });

    return NextResponse.json({
        success: true,
        userId: updated.id,
        isPremium: updated.publicMetadata?.isPremium ?? false,
        premiumSince: updated.publicMetadata?.premiumSince ?? null,
    });
}
