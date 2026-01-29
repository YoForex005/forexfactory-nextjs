import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = SITE_URL;

    // Static routes
    const routes = [
        '',
        '/about',
        '/blog',
        '/signals',
        '/downloads',
        '/contact',
        '/terms',
        '/privacy',
        '/search',
        '/login',
        '/signup',
        '/how-it-works',
        '/pricing',
        '/faq',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Blog Posts
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const blogs = await prisma.blog.findMany({
            where: { status: 'published' },
            select: { seoSlug: true, createdAt: true },
        });
        blogRoutes = blogs.map((blog) => ({
            url: `${baseUrl}/blog/${blog.seoSlug}`,
            lastModified: blog.createdAt.toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch blogs for sitemap:', error);
    }

    // Dynamic Signals/Downloads
    let signalRoutes: MetadataRoute.Sitemap = [];
    let downloadRoutes: MetadataRoute.Sitemap = [];
    try {
        const signals = await prisma.signal.findMany({
            select: { uuid: true, createdAt: true },
        });

        signalRoutes = signals.map((signal) => ({
            url: `${baseUrl}/signals/${signal.uuid}`,
            lastModified: signal.createdAt.toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        downloadRoutes = signals.map((signal) => ({
            url: `${baseUrl}/downloads/${signal.uuid}`,
            lastModified: signal.createdAt.toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch signals for sitemap:', error);
    }

    return [...routes, ...blogRoutes, ...signalRoutes, ...downloadRoutes];
}
