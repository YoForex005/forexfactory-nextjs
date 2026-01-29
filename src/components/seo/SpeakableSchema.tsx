
import React from 'react';

interface SpeakableSchemaProps {
    url: string;
    headline: string;
    cssSelectors: string[];
}

export function SpeakableSchema({ url, headline, cssSelectors }: SpeakableSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SpeakableSpecification",
        "name": headline,
        "url": url,
        "cssSelector": cssSelectors
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
