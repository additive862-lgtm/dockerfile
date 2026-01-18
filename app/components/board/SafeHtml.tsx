'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useState } from 'react';

export function SafeHtml({ html }: { html: string }) {
    const [sanitizedHtml, setSanitizedHtml] = useState('');

    useEffect(() => {
        setSanitizedHtml(DOMPurify.sanitize(html, {
            ADD_TAGS: ['iframe'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src'],
        }));
    }, [html]);

    // Initial render with sanitized content if possible, or empty to avoid hydration mismatch
    // Actually isomorphic-dompurify works on server too, but for hydration safety:
    return (
        <div
            className="prose prose-slate max-w-none prose-lg prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{
                __html: sanitizedHtml || DOMPurify.sanitize(html, {
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src'],
                })
            }}
        />
    );
}
