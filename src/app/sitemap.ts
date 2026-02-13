import { MetadataRoute } from 'next';

import { prisma } from '@/lib/prisma';
import { SITE_URL } from '@/lib/seo';

export const revalidate = 3600; // Cache for 1 hour to prevent timeouts

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://forexfactory.cc';

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
        '/faq',
        // Note: login/signup usually shouldn't be in sitemap but keeping them if needed or excluding for SEO
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // Dynamic Categories
    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await prisma.category.findMany({
            where: { status: 'active' },
            select: { name: true },
        });

        categoryRoutes = categories.map((cat) => ({
            url: `${baseUrl}/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error);
    }

    // Dynamic Blog Posts (Filtered by noindex)
    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const blogs = await prisma.blog.findMany({
            where: {
                status: 'published',
                seoMeta: {
                    none: {
                        metaRobots: 'noindex_follow' // Exclude if marked as noindex
                    }
                }
            },
            select: {
                seoSlug: true,
                updatedAt: true,
                seoMeta: {
                    select: {
                        metaRobots: true
                    }
                }
            },
        });

        // Filter out any that might have different variations of noindex if necessary
        // But the 'none' query above should handle the most common case in this schema

        blogRoutes = blogs.map((blog) => ({
            url: `${baseUrl}/blog/${blog.seoSlug}`,
            lastModified: blog.updatedAt.toISOString(),
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

    return [...routes, ...categoryRoutes, ...blogRoutes, ...signalRoutes, ...downloadRoutes];
}
