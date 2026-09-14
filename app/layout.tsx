import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EchoFlip - 3D Forest Renovation Simulator',
  description: 'First-person 3D house renovation and property simulation game set in a peaceful forest surroundings.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-slate-100 overflow-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
