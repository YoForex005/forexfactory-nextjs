import { NextRequest, NextResponse } from 'next/server';
import { submitSingleUrl } from '@/lib/indexnow';

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get('x-api-key');

    if (apiKey !== process.env.API_SECRET_KEY) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const result = await submitSingleUrl(url);

        if (result.success) {
            return NextResponse.json({ message: result.message });
        } else {
            return NextResponse.json({ error: result.message }, { status: 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
