import { NextRequest, NextResponse } from 'next/server';
import { trackingStore } from '@/lib/tracking';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('linkId');

    if (linkId) {
      const link = trackingStore.getLinkById(linkId);
      if (!link) {
        return NextResponse.json(
          { error: 'Link not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ clicks: link.clicks });
    }

    // Return all clicks from all links
    const allLinks = trackingStore.getAllLinks();
    const allClicks = allLinks.flatMap(link => link.clicks);
    
    return NextResponse.json({ clicks: allClicks });
  } catch (error) {
    console.error('Error fetching clicks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clickId = searchParams.get('clickId');

    if (!clickId) {
      return NextResponse.json(
        { error: 'Click ID is required' },
        { status: 400 }
      );
    }

    const success = trackingStore.deleteClick(clickId);

    if (!success) {
      return NextResponse.json(
        { error: 'Click not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting click:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}