import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { rtlLocales } from '@/i18n/routing';
import FloatingContact from '@/components/FloatingContact';
import '../globals.css';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  return {
    title: t('siteTitle'),
    description: t('siteDescription'),
    icons: { icon: '/favicon.svg' },
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
