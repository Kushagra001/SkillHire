'use client';
// /login redirects to the jobs page and opens the Clerk sign-in modal.
// This keeps existing /login links working without a dedicated page.
import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
    const { openSignIn } = useClerk();
    const router = useRouter();

    useEffect(() => {
        // Push to /jobs first so there's a real page under the modal
        router.replace('/jobs');
        // Small delay lets the navigation start before triggering the modal
        const t = setTimeout(() => openSignIn(), 150);
        return () => clearTimeout(t);
    }, [openSignIn, router]);

    return null;
}
