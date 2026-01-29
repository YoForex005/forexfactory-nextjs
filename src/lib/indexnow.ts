import { prisma } from '@/lib/prisma';

interface IndexNowParams {
    host: string;
    key: string;
    keyLocation?: string;
    urlList: string[];
}

export async function getSitemapUrls(): Promise<string[]> {
    const baseUrl = process.env.INDEXNOW_HOST || 'https://forexfactory.cc';

    // Static routes from sitemap.ts
    const staticRoutes = [
        '', '/about', '/blog', '/signals', '/downloads', '/contact',
        '/terms', '/privacy', '/search', '/login', '/signup',
        '/how-it-works', '/pricing', '/faq'
    ].map(route => `${baseUrl}${route}`);

    // Dynamic Blog Posts
    const blogs = await prisma.blog.findMany({
        where: { status: 'published' },
        select: { seoSlug: true },
    });
    const blogRoutes = blogs.map(blog => `${baseUrl}/blog/${blog.seoSlug}`);

    // Dynamic Signals/Downloads
    const signals = await prisma.signal.findMany({
        select: { uuid: true },
    });
    const signalRoutes = signals.map(signal => `${baseUrl}/signals/${signal.uuid}`);
    const downloadRoutes = signals.map(signal => `${baseUrl}/downloads/${signal.uuid}`);

    return [...staticRoutes, ...blogRoutes, ...signalRoutes, ...downloadRoutes];
}

export async function submitSingleUrl(url: string): Promise<{ success: boolean; message: string }> {
    const host = process.env.INDEXNOW_HOST;
    const key = process.env.INDEXNOW_KEY;
    const endpoint = process.env.INDEXNOW_ENDPOINT || 'www.bing.com';

    if (!host || !key) {
        return { success: false, message: 'Missing IndexNow configuration (INDEXNOW_HOST or INDEXNOW_KEY)' };
    }

    try {
        const params = new URLSearchParams({
            url,
            key,
            keyLocation: `${host}/${key}.txt`
        });

        const response = await fetch(`https://${endpoint}/indexnow?${params.toString()}`, {
            method: 'GET', // Recommended for single URL
        });

        if (response.ok) {
            return { success: true, message: 'URL submitted successfully' };
        } else {
            return { success: false, message: `Submission failed: ${response.status} ${response.statusText}` };
        }
    } catch (error: any) {
        return { success: false, message: `Error submitting URL: ${error.message}` };
    }
}

export async function submitBulkUrls(urls: string[]): Promise<{ success: boolean; message: string }> {
    const host = process.env.INDEXNOW_HOST;
    const key = process.env.INDEXNOW_KEY;
    const endpoint = process.env.INDEXNOW_ENDPOINT || 'www.bing.com';

    if (!host || !key) {
        return { success: false, message: 'Missing IndexNow configuration' };
    }

    // IndexNow limits to 10,000 URLs per request
    const BATCH_SIZE = 10000;
    const batches: string[][] = [];
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
        batches.push(urls.slice(i, i + BATCH_SIZE));
    }

    try {
        for (const batch of batches) {
            const body = {
                host: host.replace(/^https?:\/\//, ''), // Hostname only
                key,
                keyLocation: `${host}/${key}.txt`,
                urlList: batch
            };

            const response = await fetch(`https://${endpoint}/indexnow`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                return { success: false, message: `Batch submission failed: ${response.status} ${response.statusText}` };
            }
        }

        return { success: true, message: `Successfully submitted ${urls.length} URLs.` };
    } catch (error: any) {
        return { success: false, message: `Error submitting batch: ${error.message}` };
    }
}

export async function verifyKeyFile(): Promise<boolean> {
    const host = process.env.INDEXNOW_HOST;
    const key = process.env.INDEXNOW_KEY;

    if (!host || !key) return false;

    try {
        const response = await fetch(`${host}/${key}.txt`);
        if (!response.ok) return false;
        const content = await response.text();
        return content.trim() === key;
    } catch (error) {
        return false;
    }
}
