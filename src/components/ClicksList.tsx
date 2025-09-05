'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Click } from '@/types/tracking';

interface ClicksListProps {
  clicks: Click[];
  onClickDeleted?: (clickId: string) => void;
  onRefresh?: () => void;
}

export default function ClicksList({ clicks, onClickDeleted, onRefresh }: ClicksListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (clickId: string) => {
    setDeletingIds(prev => new Set(prev).add(clickId));
    setError(null);

    try {
      const response = await fetch(`/api/clicks?clickId=${clickId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete click');
      }

      onClickDeleted?.(clickId);
      onRefresh?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete click');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(clickId);
        return newSet;
      });
    }
  };

  const formatLocation = (click: Click) => {
    if (click.latitude && click.longitude) {
      return `${click.latitude.toFixed(6)}, ${click.longitude.toFixed(6)}`;
    }
    return 'Unknown';
  };

  const formatAddress = (click: Click) => {
    const parts = [];
    if (click.city) parts.push(click.city);
    if (click.country) parts.push(click.country);
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  };

  const formatAccuracy = (accuracyRadius?: number) => {
    if (!accuracyRadius) return 'N/A';
    if (accuracyRadius < 1000) {
      return `±${Math.round(accuracyRadius)}m`;
    }
    return `±${(accuracyRadius / 1000).toFixed(1)}km`;
  };

  if (clicks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Click Tracking Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clicks recorded yet</h3>
            <p className="text-gray-500">
              Share your tracking links to start collecting location data
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Click Tracking Data ({clicks.length})</CardTitle>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh} size="sm">
            Refresh
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Accuracy</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clicks
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((click) => (
                  <TableRow key={click.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(click.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatLocation(click)}
                    </TableCell>
                    <TableCell>
                      {formatAddress(click)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={click.accuracyRadius && click.accuracyRadius < 100 ? 'default' : 'secondary'}>
                        {formatAccuracy(click.accuracyRadius)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-500">
                      {click.ipAddress}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(click.id)}
                        disabled={deletingIds.has(click.id)}
                        className="h-8 px-2 text-xs"
                      >
                        {deletingIds.has(click.id) ? (
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Total clicks: {clicks.length}</p>
          <p>
            Unique locations: {new Set(clicks.map(c => `${c.latitude},${c.longitude}`)).size}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}