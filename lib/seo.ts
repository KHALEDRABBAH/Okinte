import { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';

interface SeoProps {
  title: string;
  description: string;
  url?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export function generateMetadata({ title, description, url, keywords = [], noIndex = false }: SeoProps): Metadata {
  return {
    title,
    description,
    keywords: [
      'service request platform',
      'online application system',
      'digital service management',
      'apply for services online',
      ...keywords
    ],
    openGraph: {
      title,
      description,
      url: url ? `${BASE_URL}${url}` : BASE_URL,
      siteName: 'Okinte',
      images: [{ url: `${BASE_URL}/api/og?title=${encodeURIComponent(title)}`, width: 1200, height: 630, alt: title }],
      type: 'website',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${BASE_URL}/api/og?title=${encodeURIComponent(title)}`],
    },
    alternates: {
      canonical: url ? `${BASE_URL}${url}` : BASE_URL,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: { index: !noIndex, follow: !noIndex },
    },
  };
}

export function buildJsonLd(schema: any) {
  return {
    __html: JSON.stringify(schema)
  };
}
