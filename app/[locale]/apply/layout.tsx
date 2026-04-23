import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  
  return {
    title: t('apply.title'),
    description: t('apply.description'),
    openGraph: {
      title: t('apply.title'),
      description: t('apply.description'),
      url: `${appUrl}/${locale}/apply`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('apply.title'),
      description: t('apply.description'),
    },
    alternates: {
      canonical: `${appUrl}/${locale}/apply`,
    },
  };
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
