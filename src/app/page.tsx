'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LinkGenerator from '@/components/LinkGenerator';
import type { CreateLinkResponse } from '@/types/tracking';

export default function HomePage() {
  const [recentLinks, setRecentLinks] = useState<CreateLinkResponse[]>([]);

  const handleLinkCreated = (response: CreateLinkResponse) => {
    setRecentLinks(prev => [response, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LinkTracker</h1>
              <p className="mt-2 text-gray-600">
                Generate trackable links and see precise locations of your visitors
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="outline">View Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Link Generator */}
          <div className="lg:col-span-2">
            <LinkGenerator onLinkCreated={handleLinkCreated} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How it works */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Create Link</h4>
                    <p className="text-sm text-gray-600">Enter your destination URL to generate a trackable link</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Share Link</h4>
                    <p className="text-sm text-gray-600">Share the tracking link with your audience</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Track Locations</h4>
                    <p className="text-sm text-gray-600">View precise locations of clicks on your dashboard</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Manage Data</h4>
                    <p className="text-sm text-gray-600">Delete specific tracking entries to manage privacy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Links */}
            {recentLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentLinks.map((response, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium truncate mb-1">
                        {response.link.title || 'Untitled Link'}
                      </div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {response.trackingUrl}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(response.link.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Precise GPS tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Interactive map view</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Real-time analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Data management tools</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Privacy controls</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              Built with Next.js, TypeScript, and Leaflet.js
            </p>
            <p className="text-xs mt-2">
              Privacy-focused location tracking with user consent
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}