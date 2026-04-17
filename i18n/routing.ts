import { defineRouting } from 'next-intl/routing';

export const locales = ['fr', 'en', 'ar', 'tr', 'ja', 'es', 'it'] as const;
export type Locale = (typeof locales)[number];

export const rtlLocales: Locale[] = ['ar'];

export const routing = defineRouting({
  locales,
  defaultLocale: 'fr',
  localePrefix: 'always',
});
