
import React from 'react';

interface HowToStep {
    name: string;
    text: string;
    image?: string;
    url?: string;
}

interface HowToSchemaProps {
    name: string;
    description: string;
    image?: string;
    totalTime?: string; // ISO 8601 duration e.g. PT20M
    estimatedCost?: {
        currency: string;
        value: string;
    };
    tools?: Array<{ name: string }>;
    supplies?: Array<{ name: string }>;
    steps: HowToStep[];
}

export function HowToSchema({
    name,
    description,
    image,
    totalTime,
    estimatedCost,
    tools,
    supplies,
    steps
}: HowToSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": name,
        "description": description,
        ...(image && { "image": { "@type": "ImageObject", "url": image } }),
        ...(totalTime && { "totalTime": totalTime }),
        ...(estimatedCost && {
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": estimatedCost.currency,
                "value": estimatedCost.value
            }
        }),
        ...(tools && {
            "tool": tools.map(t => ({
                "@type": "HowToTool",
                "name": t.name
            }))
        }),
        ...(supplies && {
            "supply": supplies.map(s => ({
                "@type": "HowToSupply",
                "name": s.name
            }))
        }),
        "step": steps.map((step, index) => ({
            "@type": "HowToStep",
            "position": index + 1,
            "name": step.name,
            "text": step.text,
            ...(step.image && { "image": step.image }),
            ...(step.url && { "url": step.url })
        }))
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
