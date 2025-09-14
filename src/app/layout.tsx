import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SPR AI VisMesh - 3D Model Generator',
  description: 'Instantly generate object-oriented 3D models and animations from your images with SPR AI VisMesh. Turn photos into animated 3D assets with our advanced AI animation and 3D model generator technology.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased font-body" style={{ '--font-body': 'Inter, sans-serif', '--font-headline': 'Orbitron, sans-serif' } as React.CSSProperties}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
