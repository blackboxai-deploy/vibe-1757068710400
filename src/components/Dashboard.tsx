'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import MapView from './MapView';
import ClicksList from './ClicksList';
import type { TrackableLink, Click } from '@/types/tracking';

export default function Dashboard() {
  const [links, setLinks] = useState<TrackableLink[]>([]);
  const [allClicks, setAllClicks] = useState<Click[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      
      // Fetch all links
      const linksResponse = await fetch('/api/links');
      if (!linksResponse.ok) {
        throw new Error('Failed to fetch links');
      }
      const linksData = await linksResponse.json();
      setLinks(linksData.links || []);
      
      // Collect all clicks from all links
      const clicks = linksData.links?.flatMap((link: TrackableLink) => link.clicks) || [];
      setAllClicks(clicks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClickDeleted = (clickId: string) => {
    setAllClicks(prev => prev.filter(click => click.id !== clickId));
    setLinks(prev => prev.map(link => ({
      ...link,
      clicks: link.clicks.filter(click => click.id !== clickId)
    })));
  };

  const calculateStats = () => {
    const totalLinks = links.length;
    const totalClicks = allClicks.length;
    const uniqueCountries = new Set(allClicks.filter(c => c.country).map(c => c.country)).size;
    const uniqueCities = new Set(allClicks.filter(c => c.city).map(c => c.city)).size;
    
    const recentClicks = allClicks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const topCountries = Object.entries(
      allClicks.reduce((acc, click) => {
        if (click.country) {
          acc[click.country] = (acc[click.country] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3);

    return {
      totalLinks,
      totalClicks,
      uniqueCountries,
      uniqueCities,
      recentClicks,
      topCountries,
    };
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-700">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchData}
            className="ml-2"
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLinks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Countries</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCountries}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cities</CardTitle>
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Map View */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Click Locations</CardTitle>
          <Button variant="outline" onClick={fetchData} size="sm">
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <MapView clicks={allClicks} height="500px" />
        </CardContent>
      </Card>

      {/* Top Countries */}
      {stats.topCountries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{country}</span>
                  <Badge variant="secondary">{count} clicks</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {stats.recentClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentClicks.map((click) => (
                <div key={click.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {click.city && click.country ? `${click.city}, ${click.country}` : 'Unknown location'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(click.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-600">
                      {click.latitude.toFixed(4)}, {click.longitude.toFixed(4)}
                    </p>
                    {click.accuracyRadius && (
                      <Badge variant="outline" className="text-xs">
                        ±{click.accuracyRadius < 1000 ? `${Math.round(click.accuracyRadius)}m` : `${(click.accuracyRadius / 1000).toFixed(1)}km`}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clicks List */}
      <ClicksList
        clicks={allClicks}
        onClickDeleted={handleClickDeleted}
        onRefresh={fetchData}
      />
    </div>
  );
}