import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoFlip - 3D Forest Renovation Simulator',
  description: 'First-person 3D house renovation and property simulation game set in a peaceful forest surroundings.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'EchoFlip 3D'
  },
  other: {
    'screen-orientation': 'landscape',
    'orientation': 'landscape',
    'mobile-web-app-capable': 'yes'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
        {children}
      </body>
    </html>
  );
}
