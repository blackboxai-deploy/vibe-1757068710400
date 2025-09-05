'use client';

import { useEffect, useRef } from 'react';
import '../app/leaflet.css';
import type { Click } from '@/types/tracking';

interface MapViewProps {
  clicks: Click[];
  height?: string;
  className?: string;
}

export default function MapView({ clicks, height = '400px', className = '' }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dynamically import Leaflet to avoid SSR issues
    import('leaflet').then(async (L) => {
      if (mapRef.current && !mapInstanceRef.current) {
        // Initialize map
        const map = L.map(mapRef.current, {
          center: [40.7128, -74.0060], // Default to NYC
          zoom: 2,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Custom marker icon
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
          `,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        });

        // Add markers for clicks
        clicks.forEach((click) => {
          if (click.latitude && click.longitude) {
            const marker = L.marker([click.latitude, click.longitude], {
              icon: customIcon,
            }).addTo(map);

            const popupContent = `
              <div class="p-2">
                <p class="font-semibold text-sm">Click Details</p>
                <p class="text-xs text-gray-600 mt-1">
                  <strong>Time:</strong> ${new Date(click.timestamp).toLocaleString()}
                </p>
                <p class="text-xs text-gray-600">
                  <strong>Location:</strong> ${click.latitude.toFixed(6)}, ${click.longitude.toFixed(6)}
                </p>
                ${click.city ? `<p class="text-xs text-gray-600"><strong>City:</strong> ${click.city}</p>` : ''}
                ${click.country ? `<p class="text-xs text-gray-600"><strong>Country:</strong> ${click.country}</p>` : ''}
                ${click.accuracyRadius ? `<p class="text-xs text-gray-600"><strong>Accuracy:</strong> ±${click.accuracyRadius}m</p>` : ''}
              </div>
            `;

            marker.bindPopup(popupContent);
            markersRef.current.push(marker);
          }
        });

        // Auto-fit map to show all markers
        if (clicks.length > 0) {
          const validClicks = clicks.filter(click => click.latitude && click.longitude);
          if (validClicks.length > 0) {
            const group = L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds(), { padding: [20, 20] });
          }
        }
      }
    }).catch((error) => {
      console.error('Error loading Leaflet:', error);
    });

    return () => {
      // Cleanup map instance
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersRef.current = [];
      }
    };
  }, [clicks]);

  return (
    <div className={className}>
      <div
        ref={mapRef}
        style={{ height, width: '100%' }}
        className="rounded-lg border border-gray-200 relative z-0"
      />
      {clicks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            </div>
            <p className="text-gray-500 font-medium">No clicks to display</p>
            <p className="text-gray-400 text-sm">Share your link to see locations appear here</p>
          </div>
        </div>
      )}
      <style jsx>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}