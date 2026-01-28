'use client';

import { useEffect } from 'react';
import { incrementViewCount } from '@/lib/actions/board';

interface ViewCounterProps {
    id: number;
    category: string;
}

/**
 * Triggers unique view count increment on client mount.
 * This avoids "Cookies modified during rendering" errors.
 */
export default function ViewCounter({ id, category }: ViewCounterProps) {
    useEffect(() => {
        // Trigger server action as a side-effect
        incrementViewCount(id, category);
    }, [id, category]);

    return null; // This component has no UI
}
