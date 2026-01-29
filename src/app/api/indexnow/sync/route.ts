import { NextRequest, NextResponse } from 'next/server';
import { getSitemapUrls, submitBulkUrls } from '@/lib/indexnow';

export const maxDuration = 60; // Allow 60 seconds for bulk operations

export async function POST(req: NextRequest) {
    const cronSecret = req.headers.get('x-cron-secret');

    // Verify with CRON_SECRET (standard for Vercel/Cron jobs)
    if (cronSecret !== process.env.CRON_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const urls = await getSitemapUrls();

        if (urls.length === 0) {
            return NextResponse.json({ message: 'No URLs to submit' });
        }

        const result = await submitBulkUrls(urls);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: result.message,
                count: urls.length
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.message
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('IndexNow Sync Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
