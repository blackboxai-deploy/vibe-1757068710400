export interface TrackableLink {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  title?: string;
  description?: string;
  clicks: Click[];
}

export interface Click {
  id: string;
  linkId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  userAgent: string;
  ipAddress: string;
  country?: string;
  city?: string;
  accuracyRadius?: number;
}

export interface CreateLinkRequest {
  originalUrl: string;
  title?: string;
  description?: string;
}

export interface CreateLinkResponse {
  link: TrackableLink;
  trackingUrl: string;
}

export interface TrackClickRequest {
  latitude: number;
  longitude: number;
  userAgent: string;
  accuracyRadius?: number;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  error?: string;
}

export interface LinkAnalytics {
  totalClicks: number;
  uniqueCountries: number;
  uniqueCities: number;
  averageAccuracy: number;
  recentClicks: Click[];
  topCountries: Array<{ country: string; count: number }>;
  topCities: Array<{ city: string; count: number }>;
}