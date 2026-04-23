import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  
  return {
    title: t('login.title'),
    description: t('login.description'),
    openGraph: {
      title: t('login.title'),
      description: t('login.description'),
      url: `${appUrl}/${locale}/login`,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('login.title'),
      description: t('login.description'),
    },
    alternates: {
      canonical: `${appUrl}/${locale}/login`,
    },
  };
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
