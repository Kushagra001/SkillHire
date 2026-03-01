import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// Only this Clerk user can call admin routes
const ADMIN_USER_ID = 'user_39wFqR9oYqfruUqzgt8bqJdJEhJ';

export async function GET() {
    const { userId } = await auth();

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
