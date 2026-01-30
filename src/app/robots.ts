import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
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
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
