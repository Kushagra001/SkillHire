import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ADMIN_USER_ID = 'user_39wFqR9oYqfruUqzgt8bqJdJEhJ';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId: callerId } = await auth();

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
