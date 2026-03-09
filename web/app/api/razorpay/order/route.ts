import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
    try {
        // 1. Require a logged-in user
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json().catch(() => ({}));
        const plan = body.plan || 'monthly';
        const amount = plan === '6month' ? 99900 : 19900;

        // 2. Create a Razorpay order — pass userId in notes for the webhook
        const order = await razorpay.orders.create({
            amount,          // ₹199 or ₹999 in paise
            currency: 'INR',
            receipt: `rcpt_${userId.slice(-8)}_${Date.now()}`,
            notes: { userId, plan },     // ← webhook reads this to identify the user
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
        });

    } catch (error) {
        console.error('Razorpay order error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
