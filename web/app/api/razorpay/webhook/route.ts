import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { clerkClient } from '@clerk/nextjs/server';

// Razorpay sends a raw body — we need it as text for signature verification

export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const sig = req.headers.get('x-razorpay-signature') ?? '';
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        // 1. Verify HMAC SHA256 signature
        const expected = createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (expected !== sig) {
            console.warn('Razorpay webhook: signature mismatch');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(rawBody);

        // 2. Only handle payment.captured — ignore all other events
        if (event.event !== 'payment.captured') {
            return NextResponse.json({ received: true }, { status: 200 });
        }

        // 3. Extract the userId we stashed in the order notes
        const userId: string | undefined =
            event?.payload?.payment?.entity?.notes?.userId;

        if (!userId) {
            console.error('Razorpay webhook: userId missing from notes');
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // 4. Grant premium access via Clerk publicMetadata
        const client = await clerkClient();
        await client.users.updateUserMetadata(userId, {
            publicMetadata: {
                isPremium: true,
                premiumSince: new Date().toISOString(),
            },
        });

        console.log(`✓ Premium granted to userId: ${userId}`);
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Razorpay webhook error:', error);
        // Always return 200 to prevent Razorpay from retrying endlessly
        return NextResponse.json({ received: true }, { status: 200 });
    }
}
