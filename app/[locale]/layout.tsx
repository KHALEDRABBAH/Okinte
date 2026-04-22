import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { rtlLocales } from '@/i18n/routing';
import FloatingContact from '@/components/FloatingContact';
import LanguageModal from '@/components/LanguageModal';
import '../globals.css';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
    icons: { icon: '/favicon.svg' },
    metadataBase: new URL(appUrl),
    openGraph: {
      title: t('siteTitle'),
      description: t('siteDescription'),
      url: appUrl,
      siteName: 'Okinte',
      locale: locale,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('siteTitle'),
      description: t('siteDescription'),
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `${appUrl}/${locale}`,
      languages: {
        'fr': `${appUrl}/fr`,
        'en': `${appUrl}/en`,
        'ar': `${appUrl}/ar`,
        'tr': `${appUrl}/tr`,
        'ja': `${appUrl}/ja`,
        'es': `${appUrl}/es`,
        'it': `${appUrl}/it`,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale } }: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();
  const isRTL = rtlLocales.includes(locale as any);

  return (
    <html lang={locale} dir={isRTL ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
          <FloatingContact />
          <LanguageModal />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}