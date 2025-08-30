import type {Metadata} from 'next';
import './globals.css';
import Link from 'next/link';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'BookLook: ISBN Scanner & Book Inventory Management',
  description: 'Effortlessly scan book barcodes, find ISBNs, and manage your inventory with BookLook. Get book details, pricing information, and export your collection for platforms like WooCommerce.',
  keywords: ['isbn scanner', 'book inventory', 'woocommerce export', 'book pricing', 'barcode scanner', 'book management'],
  openGraph: {
    title: 'BookLook: ISBN Scanner & Book Inventory Management',
    description: 'The smart way to catalog and value your book collection.',
    type: 'website',
    url: 'https://bookrun.brainopolis.com', 
    images: [
      {
        url: '/og-image.png', // You would need to create this image
        width: 1200,
        height: 630,
        alt: 'BookLook App Interface',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookLook: ISBN Scanner & Book Inventory Management',
    description: 'The smart way to catalog and value your book collection.',
    images: ['/og-image.png'], // You would need to create this image
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet"></link>
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
            {children}
            <footer>
            </footer>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
