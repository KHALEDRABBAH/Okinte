import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  
  return {
    title: t('privacy.title'),
    description: t('privacy.description'),
    openGraph: {
      title: t('privacy.title'),
      description: t('privacy.description'),
      url: `${appUrl}/${locale}/privacy`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('privacy.title'),
      description: t('privacy.description'),
    },
    alternates: {
      canonical: `${appUrl}/${locale}/privacy`,
    },
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
