import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bolila — Placement Services affiliated with IBLT',
  description: 'Professional placement and connection services — Authorization N° 11-2015N-MESR/DES',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
