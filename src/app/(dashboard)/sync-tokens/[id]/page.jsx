'use client';

import { redirect } from 'next/navigation';
import { use } from 'react';

// Redirect /sync-tokens/[id] to stats page as stats is the main view detail for a token
export default function TokenDetailsPage({ params }) {
    const resolvedParams = use(params);
    redirect(`/sync-tokens/${resolvedParams.id}/stats`);
}
