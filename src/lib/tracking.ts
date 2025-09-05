import { v4 as uuidv4 } from 'uuid';
import { UAParser } from 'ua-parser-js';
import type { TrackableLink, Click, LinkAnalytics, LocationData } from '@/types/tracking';

// In-memory storage (replace with database in production)
class TrackingStore {
  private links: Map<string, TrackableLink> = new Map();
  private shortCodeToId: Map<string, string> = new Map();

  createLink(originalUrl: string, title?: string, description?: string): TrackableLink {
    const id = uuidv4();
    const shortCode = this.generateShortCode();
    
    const link: TrackableLink = {
      id,
      originalUrl,
      shortCode,
      title,
      description,
      createdAt: new Date(),
      clicks: [],
    };

    this.links.set(id, link);
    this.shortCodeToId.set(shortCode, id);
    
    return link;
  }

  getLinkByShortCode(shortCode: string): TrackableLink | null {
    const id = this.shortCodeToId.get(shortCode);
    if (!id) return null;
    return this.links.get(id) || null;
  }

  getLinkById(id: string): TrackableLink | null {
    return this.links.get(id) || null;
  }

  getAllLinks(): TrackableLink[] {
    return Array.from(this.links.values());
  }

  addClick(linkId: string, click: Omit<Click, 'id' | 'linkId'>): Click | null {
    const link = this.links.get(linkId);
    if (!link) return null;

    const newClick: Click = {
      id: uuidv4(),
      linkId,
      ...click,
    };

    link.clicks.push(newClick);
    return newClick;
  }

  deleteClick(clickId: string): boolean {
    for (const link of this.links.values()) {
      const clickIndex = link.clicks.findIndex(c => c.id === clickId);
      if (clickIndex !== -1) {
        link.clicks.splice(clickIndex, 1);
        return true;
      }
    }
    return false;
  }

  getClickById(clickId: string): Click | null {
    for (const link of this.links.values()) {
      const click = link.clicks.find(c => c.id === clickId);
      if (click) return click;
    }
    return null;
  }

  private generateShortCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Ensure uniqueness
    if (this.shortCodeToId.has(result)) {
      return this.generateShortCode();
    }
    
    return result;
  }
}

export const trackingStore = new TrackingStore();

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
    deviceModel: result.device.model || undefined,
  };
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP.trim();
  }
  
  return '127.0.0.1'; // Fallback for local development
}

export async function getLocationFromIP(ip: string): Promise<{ country?: string; city?: string }> {
  // Simple IP geolocation - in production, use a service like ipapi.co or similar
  try {
    if (ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { country: 'Local', city: 'Development' };
    }
    
    // This is a placeholder - in production, integrate with a real IP geolocation service
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        country: data.country,
        city: data.city,
      };
    }
  } catch (error) {
    console.error('Error getting location from IP:', error);
  }
  
  return {};
}

export function calculateLinkAnalytics(link: TrackableLink): LinkAnalytics {
  const clicks = link.clicks;
  const totalClicks = clicks.length;
  
  const countries = new Map<string, number>();
  const cities = new Map<string, number>();
  let totalAccuracy = 0;
  let accuracyCount = 0;
  
  clicks.forEach(click => {
    if (click.country) {
      countries.set(click.country, (countries.get(click.country) || 0) + 1);
    }
    if (click.city) {
      cities.set(click.city, (cities.get(click.city) || 0) + 1);
    }
    if (click.accuracyRadius) {
      totalAccuracy += click.accuracyRadius;
      accuracyCount++;
    }
  });
  
  const topCountries = Array.from(countries.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
    
  const topCities = Array.from(cities.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  const recentClicks = clicks
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);
  
  return {
    totalClicks,
    uniqueCountries: countries.size,
    uniqueCities: cities.size,
    averageAccuracy: accuracyCount > 0 ? totalAccuracy / accuracyCount : 0,
    recentClicks,
    topCountries,
    topCities,
  };
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatTimestamp(timestamp: Date | string): string {
  const date = new Date(timestamp);
  return date.toLocaleString();
}

export async function getCurrentLocation(): Promise<LocationData> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: 0,
        longitude: 0,
        error: 'Geolocation is not supported by this browser.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let errorMessage = 'Unknown error occurred.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out.';
            break;
        }
        resolve({
          latitude: 0,
          longitude: 0,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}