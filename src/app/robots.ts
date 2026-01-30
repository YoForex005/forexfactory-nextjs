import { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { SITE_URL } from '@/lib/seo';

export default async function robots(): Promise<MetadataRoute.Robots> {
    const headersList = await headers();
    const host = headersList.get('host') || 'forexfactory.cc';
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

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
                ],
                disallow: '/',
            },
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/admin/', '/private/'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    };
}
