'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCurrentLocation } from '@/lib/tracking';

export default function TrackingPage() {
  const params = useParams();
  const router = useRouter();
  const shortCode = params.shortCode as string;
  
  const [isTracking, setIsTracking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  const trackClick = async (latitude?: number, longitude?: number, accuracyRadius?: number) => {
    try {
      const response = await fetch(`/api/track/${shortCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: latitude || 0,
          longitude: longitude || 0,
          accuracyRadius,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to track click');
      }

      const data = await response.json();
      setRedirectUrl(data.redirectUrl);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = data.redirectUrl;
      }, 2000);
    } catch (err) {
      setError('Failed to track click');
      console.error('Tracking error:', err);
    }
  };

  const handleLocationRequest = async () => {
    setIsTracking(true);
    
    try {
      const location = await getCurrentLocation();
      
      if (location.error) {
        setLocationPermission('denied');
        // Track without precise location
        await trackClick();
      } else {
        setLocationPermission('granted');
        // Track with precise location
        await trackClick(location.latitude, location.longitude, location.accuracy);
      }
    } catch (err) {
      setLocationPermission('denied');
      setError('Location access failed');
      // Track without location
      await trackClick();
    } finally {
      setIsTracking(false);
    }
  };

  const handleSkipLocation = async () => {
    setLocationPermission('denied');
    setIsTracking(true);
    await trackClick();
    setIsTracking(false);
  };

  useEffect(() => {
    // Auto-start tracking on page load
    handleLocationRequest();
  }, [shortCode]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Failed</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => router.push('/')} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (redirectUrl) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Tracking Complete</h2>
            <p className="text-gray-600 mb-4">
              Redirecting you to your destination...
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = redirectUrl} 
                className="flex-1"
              >
                Continue Now
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              You will be redirected automatically in a few seconds
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-500 rounded-sm"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Processing Your Click
            </h2>
            <p className="text-gray-600">
              We're tracking your click for analytics purposes
            </p>
          </div>

          {locationPermission === 'pending' && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-700">
                  We'd like to access your location for precise tracking. This helps provide better analytics.
                </AlertDescription>
              </Alert>

              {isTracking ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Requesting location access...</span>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleLocationRequest} className="flex-1">
                    Allow Location
                  </Button>
                  <Button 
                    onClick={handleSkipLocation} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Skip
                  </Button>
                </div>
              )}
            </div>
          )}

          {locationPermission === 'granted' && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 p-8">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-green-600">Location captured successfully!</span>
              </div>
            </div>
          )}

          {locationPermission === 'denied' && isTracking && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 p-8">
                <div className="w-6 h-6 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Processing without location...</span>
              </div>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              This process helps us provide better analytics and insights.
              Your privacy is important to us.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}