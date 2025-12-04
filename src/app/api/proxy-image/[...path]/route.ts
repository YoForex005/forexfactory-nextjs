import { NextRequest, NextResponse } from "next/server";

// Proxy images from the old Express server to avoid 404s
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const imagePath = path.join('/');
  
  // Construct the old server URL
  const oldServerUrl = process.env.OLD_SERVER_URL || 'http://localhost:3001';
  const imageUrl = `${oldServerUrl}/${imagePath}`;

  try {
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      return new NextResponse('Image not found', { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Failed to proxy image:', error);
    return new NextResponse('Failed to load image', { status: 500 });
  }
}
