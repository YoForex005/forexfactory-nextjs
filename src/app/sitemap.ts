import { MetadataRoute } from 'next';
import { unstable_cache } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { SITE_URL, slugifySegment } from '@/lib/seo';

export const revalidate = 3600;

function uniqueByUrl(routes: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
    const seen = new Set<string>();

    return routes.filter((route) => {
        if (seen.has(route.url)) {
            return false;
        }

        seen.add(route.url);
        return true;
    });
}

const getCategoriesForSitemap = unstable_cache(
    async () =>
        prisma.category.findMany({
            where: { status: 'active' },
            select: { name: true },
        }),
    ['sitemap-categories'],
    { revalidate: 3600 }
);

const getBlogsForSitemap = unstable_cache(
    async () =>
        prisma.blog.findMany({
            where: {
                status: 'published',
                seoMeta: {
                    none: {
                        metaRobots: 'noindex_follow',
                    },
                },
            },
            select: {
                seoSlug: true,
                updatedAt: true,
            },
        }),
    ['sitemap-blogs'],
    { revalidate: 1800 }
);

const getSignalsForSitemap = unstable_cache(
    async () =>
        prisma.signal.findMany({
            select: { uuid: true, createdAt: true },
        }),
    ['sitemap-signals'],
    { revalidate: 1800 }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const routes = [
        '',
        '/about',
        '/blog',
        '/downloads',
        '/faq',
        '/signals',
        '/contact',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${SITE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' as const : 'weekly' as const,
        priority: route === '' ? 1.0 : route === '/blog' || route === '/downloads' || route === '/signals' ? 0.9 : 0.7,
    }));

    let categoryRoutes: MetadataRoute.Sitemap = [];
    try {
        const categories = await getCategoriesForSitemap();

        categoryRoutes = uniqueByUrl(categories.map((cat) => ({
            url: `${SITE_URL}/category/${slugifySegment(cat.name)}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.75,
        })));
    } catch (error) {
        console.error('Failed to fetch categories for sitemap:', error);
    }

    let blogRoutes: MetadataRoute.Sitemap = [];
    try {
        const blogs = await getBlogsForSitemap();

        blogRoutes = blogs.map((blog) => ({
            url: `${SITE_URL}/blog/${blog.seoSlug}`,
            lastModified: blog.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch blogs for sitemap:', error);
    }

    let signalRoutes: MetadataRoute.Sitemap = [];
    let downloadRoutes: MetadataRoute.Sitemap = [];
    try {
        const signals = await getSignalsForSitemap();

        signalRoutes = signals.map((signal) => ({
            url: `${SITE_URL}/signals/${signal.uuid}`,
            lastModified: signal.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        downloadRoutes = signals.map((signal) => ({
            url: `${SITE_URL}/downloads/${signal.uuid}`,
            lastModified: signal.createdAt,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));
    } catch (error) {
        console.error('Failed to fetch signals for sitemap:', error);
    }

    return uniqueByUrl([...routes, ...categoryRoutes, ...blogRoutes, ...signalRoutes, ...downloadRoutes]);
}
