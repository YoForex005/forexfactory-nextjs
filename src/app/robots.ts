import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = SITE_URL;

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
