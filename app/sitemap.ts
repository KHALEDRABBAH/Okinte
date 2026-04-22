import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.okinte.com';
const locales = ['fr', 'en', 'ar', 'tr', 'ja', 'es', 'it'];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ['', '/apply', '/contact', '/login', '/privacy', '/terms'];
  
  const entries: MetadataRoute.Sitemap = [];

  for (const page of pages) {
    for (const locale of locales) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'weekly' : 'monthly',
        priority: page === '' ? 1.0 : page === '/apply' ? 0.9 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map(loc => [loc, `${BASE_URL}/${loc}${page}`])
          ),
        },
      });
    }
  }

  return entries;
}
