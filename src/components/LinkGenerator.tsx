'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { CreateLinkResponse } from '@/types/tracking';

interface LinkGeneratorProps {
  onLinkCreated?: (response: CreateLinkResponse) => void;
}

export default function LinkGenerator({ onLinkCreated }: LinkGeneratorProps) {
  const [originalUrl, setOriginalUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CreateLinkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originalUrl) {
      setError('URL is required');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          title: title || undefined,
          description: description || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create link');
      }

      const data: CreateLinkResponse = await response.json();
      setResult(data);
      onLinkCreated?.(data);

      // Reset form
      setOriginalUrl('');
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
            Generate Tracking Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="url">Destination URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="My Tracking Link"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this link..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>

            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </div>
              ) : (
                'Generate Tracking Link'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Link Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-green-700">Tracking URL:</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  value={result.trackingUrl}
                  readOnly
                  className="bg-white border-green-200"
                />
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(result.trackingUrl)}
                  className="shrink-0 border-green-300 text-green-700 hover:bg-green-100"
                >
                  {copySuccess ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Short Code: {result.link.shortCode}
              </Badge>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                Created: {new Date(result.link.createdAt).toLocaleDateString()}
              </Badge>
            </div>

            <div className="p-4 bg-white rounded-lg border border-green-200">
              <p className="text-sm font-medium text-gray-700 mb-2">Link Details:</p>
              <p className="text-sm text-gray-600">
                <strong>Destination:</strong> {result.link.originalUrl}
              </p>
              {result.link.title && (
                <p className="text-sm text-gray-600">
                  <strong>Title:</strong> {result.link.title}
                </p>
              )}
              {result.link.description && (
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {result.link.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}