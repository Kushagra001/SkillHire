'use client';
// /login redirects to the jobs page and opens the Clerk sign-in modal.
// This keeps existing /login links working without a dedicated page.
import { useEffect } from 'react';
import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export default function LoginRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Push to /jobs with a query parameter to reliably trigger the modal
        // after the navigation completes.
        router.replace('/jobs?sign-in=true');
    }, [router]);

    return null;
}
