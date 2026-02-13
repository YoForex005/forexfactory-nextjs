import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forexfactory.cc';

    return {
        rules: [
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'Google-Extended',
                    'ClaudeBot',
                    'anthropic-ai',
                    'CCBot',
                    'PerplexityBot',
                    'Bytespider',
                    'Googlebot',
                    'Bingbot',
                ],
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
