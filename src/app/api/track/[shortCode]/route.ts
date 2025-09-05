import { NextRequest, NextResponse } from 'next/server';
import { trackingStore, getClientIP, getLocationFromIP } from '@/lib/tracking';
import type { TrackClickRequest } from '@/types/tracking';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = params;
    const link = trackingStore.getLinkByShortCode(shortCode);

    if (!link) {
      return new NextResponse('Link not found', { status: 404 });
    }

    // Redirect to a tracking page that will capture location and then redirect
    const trackingPageUrl = new URL(`/t/${shortCode}`, request.url);
    return NextResponse.redirect(trackingPageUrl);
  } catch (error) {
    console.error('Error handling link click:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = params;
    const link = trackingStore.getLinkByShortCode(shortCode);

    if (!link) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    const body: TrackClickRequest = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = getClientIP(request);
    
    // Get location data from IP as fallback
    const ipLocation = await getLocationFromIP(ipAddress);
    
    // Use provided coordinates or fallback to IP-based location
    const latitude = body.latitude || 0;
    const longitude = body.longitude || 0;

    const clickData = {
      latitude,
      longitude,
      timestamp: new Date(),
      userAgent,
      ipAddress,
      country: ipLocation.country,
      city: ipLocation.city,
      accuracyRadius: body.accuracyRadius,
    };

    const click = trackingStore.addClick(link.id, clickData);

    if (!click) {
      return NextResponse.json(
        { error: 'Failed to record click' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: link.originalUrl,
      click: {
        id: click.id,
        timestamp: click.timestamp,
        location: {
          latitude: click.latitude,
          longitude: click.longitude,
        }
      }
    });
  } catch (error) {
    console.error('Error recording click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}