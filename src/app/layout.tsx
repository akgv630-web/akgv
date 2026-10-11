import type { Metadata, Viewport } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'AKGV Infra City Private Limited | Luxury Townships & Verified Plots',
  description: 'Premier Real Estate Infrastructure & Township Development Platform in Uttar Pradesh. Verified plot bookings with 30ft roads, interactive 3D house viewer, and transparent commission plans in Rampur, Lahartara & Mirza Murad.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon.svg',
    apple: '/icons/icon.svg',
  },
  keywords: [
    'AKGV Infra City',
    'AKGV Infra City Private Limited',
    'Plots in Varanasi',
    'Plots in Rampur Varanasi',
    'Township Mirza Murad',
    'Real Estate PWA',
    '3D House Viewer',
    'Varanasi Plots Booking'
  ],
};

export const viewport: Viewport = {
  themeColor: '#0B1734',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} h-full antialiased dark`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="flex min-h-screen flex-col bg-[#0B1734] font-sans text-[#F6F1E7] selection:bg-[#C7A35A] selection:text-[#0B1734]">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
