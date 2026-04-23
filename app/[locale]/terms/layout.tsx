import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  
  return {
    title: t('terms.title'),
    description: t('terms.description'),
    openGraph: {
      title: t('terms.title'),
      description: t('terms.description'),
      url: `${appUrl}/${locale}/terms`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('terms.title'),
      description: t('terms.description'),
    },
    alternates: {
      canonical: `${appUrl}/${locale}/terms`,
    },
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
