import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: 'SPR AI VisMesh - 3D Model Generator',
  description: 'Instantly generate object-oriented 3D models and animations from your images with SPR AI VisMesh. Turn photos into animated 3D assets with our advanced AI animation and 3D model generator technology.',
};

const faviconSvg = `
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M8 25.3333V6.66666H14.6667C16.4348 6.66666 18.1305 7.36904 19.3807 8.61928C20.631 9.86952 21.3333 11.5652 21.3333 13.3333C21.3333 15.1014 20.631 16.7971 19.3807 18.0474C18.1305 19.2976 16.4348 20 14.6667 20H8" stroke="#93BFCF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M8 13.3333H13.3333" stroke="#93BFCF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 20L24 25.3333" stroke="#93BFCF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
const faviconDataUri = `data:image/svg+xml;base64,${btoa(faviconSvg)}`;


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href={faviconDataUri} type="image/svg+xml" />
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
