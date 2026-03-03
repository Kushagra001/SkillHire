import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Admin User ID is now dynamically loaded from the environment
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function GET() {
    const { userId } = await auth();

    if (!ADMIN_USER_ID) {
        console.error('ADMIN_USER_ID environment variable is not set.');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!userId || userId !== ADMIN_USER_ID) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const client = await clerkClient();
    const response = await client.users.getUserList({ limit: 100, orderBy: '-created_at' });

    const users = response.data.map((u) => ({
        id: u.id,
        email: u.emailAddresses[0]?.emailAddress ?? '—',
        firstName: u.firstName ?? '',
        lastName: u.lastName ?? '',
        isPremium: u.publicMetadata?.isPremium === true,
        premiumSince: u.publicMetadata?.premiumSince ?? null,
        createdAt: new Date(u.createdAt).toISOString(),
        imageUrl: u.imageUrl,
    }));

    return NextResponse.json({ users });
}
