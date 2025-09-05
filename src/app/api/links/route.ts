import { NextRequest, NextResponse } from 'next/server';
import { trackingStore, validateUrl } from '@/lib/tracking';
import type { CreateLinkRequest, CreateLinkResponse } from '@/types/tracking';

export async function POST(request: NextRequest) {
  try {
    const body: CreateLinkRequest = await request.json();
    
    if (!body.originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    if (!validateUrl(body.originalUrl)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    const link = trackingStore.createLink(
      body.originalUrl,
      body.title,
      body.description
    );

    const trackingUrl = `${new URL(request.url).origin}/t/${link.shortCode}`;

    const response: CreateLinkResponse = {
      link,
      trackingUrl,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const links = trackingStore.getAllLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}