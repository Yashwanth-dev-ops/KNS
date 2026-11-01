import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KNS Construction and Real Estate, Hyderabad: plots, turnkey homes, apartments',
  description: 'Walk through KNS Construction and Real Estate in 3D: open plots, turnkey G+1 construction from ₹1,600 a sft, a ready-to-move Kondapur duplex and 3BHK apartments.',
};
export const viewport: Viewport = { themeColor: '#14192b', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <script dangerouslySetInnerHTML={{ __html: "var d=document.documentElement;d.classList.add('js');try{if(sessionStorage.getItem('kns-intro')==='1')d.classList.add('intro-seen')}catch(e){}" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
