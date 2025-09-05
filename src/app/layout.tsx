import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LinkTracker - Precise Location Tracking',
  description: 'Generate trackable links and see precise locations of your visitors with interactive maps and analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}