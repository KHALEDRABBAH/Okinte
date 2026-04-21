'use client';

import { useLocale, useTranslations } from 'next-intl';

export default function JsonLd() {
  const locale = useLocale();
  const tMeta = useTranslations('metadata');
  const tServices = useTranslations('services');
  const tFaq = useTranslations('faq');
  const tContact = useTranslations('contact');
  const tAbout = useTranslations('about');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://okinte-platform.vercel.app';

  // ─────────────────────────────────────────────
  // 1. Organization Schema (Google Knowledge Panel)
  // ─────────────────────────────────────────────
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${appUrl}/#organization`,
    name: 'Okinte',
    alternateName: 'Okinte — Placement Services affiliated with IBLT',
    url: appUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${appUrl}/favicon.svg`,
      width: 512,
      height: 512,
    },
    image: `${appUrl}/hero-bg.png`,
    description: tMeta('siteDescription'),
    foundingDate: '2015',
    slogan: tAbout('subtitle'),
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 5,
      maxValue: 20,
    },
    areaServed: {
      '@type': 'GeoShape',
      name: 'Global',
    },
    serviceArea: [
      { '@type': 'Country', name: 'France' },
      { '@type': 'Country', name: 'United Kingdom' },
      { '@type': 'Country', name: 'Germany' },
      { '@type': 'Country', name: 'Canada' },
      { '@type': 'Country', name: 'United States' },
      { '@type': 'Country', name: 'Japan' },
      { '@type': 'Country', name: 'Turkey' },
      { '@type': 'Country', name: 'Spain' },
      { '@type': 'Country', name: 'Italy' },
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'Okinte.placement@gmail.com',
        availableLanguage: [
          { '@type': 'Language', name: 'French', alternateName: 'fr' },
          { '@type': 'Language', name: 'English', alternateName: 'en' },
          { '@type': 'Language', name: 'Arabic', alternateName: 'ar' },
          { '@type': 'Language', name: 'Turkish', alternateName: 'tr' },
          { '@type': 'Language', name: 'Japanese', alternateName: 'ja' },
          { '@type': 'Language', name: 'Spanish', alternateName: 'es' },
          { '@type': 'Language', name: 'Italian', alternateName: 'it' },
        ],
      },
    ],
    sameAs: [
      'https://www.facebook.com/profile.php?id=61567424603648&mibextid=rS40aB7S9Ucbxw6v',
    ],
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Government Authorization',
      name: 'IBLT Authorization',
      description: 'Authorization N° 11-2015N-MESR/DES',
      recognizedBy: {
        '@type': 'Organization',
        name: 'IBLT',
        description: 'Institut des Brevets et Licences Techniques',
      },
    },
    knowsLanguage: ['fr', 'en', 'ar', 'tr', 'ja', 'es', 'it'],
  };

  // ─────────────────────────────────────────────
  // 2. WebSite Schema (Sitelinks Searchbox)
  // ─────────────────────────────────────────────
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${appUrl}/#website`,
    name: 'Okinte',
    url: appUrl,
    inLanguage: locale,
    description: tMeta('siteDescription'),
    publisher: { '@id': `${appUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${appUrl}/${locale}/apply?service={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  // ─────────────────────────────────────────────
  // 3. Service Schemas (5 individual services)
  // ─────────────────────────────────────────────
  const serviceKeys = [
    { key: 'study', priceRange: '$$' },
    { key: 'internship', priceRange: '$$' },
    { key: 'scholarship', priceRange: '$$' },
    { key: 'sabbatical', priceRange: '$$' },
    { key: 'employment', priceRange: '$$' },
  ];

  const serviceSchemas = serviceKeys.map(({ key, priceRange }) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${appUrl}/#service-${key}`,
    name: tServices(`${key}.title`),
    alternateName: tServices(`${key}.subtitle`),
    description: tServices(`${key}.description`),
    url: `${appUrl}/${locale}/apply?service=${key}`,
    provider: { '@id': `${appUrl}/#organization` },
    areaServed: 'Worldwide',
    serviceType: 'Placement Service',
    category: key === 'study' ? 'Educational Placement'
      : key === 'internship' ? 'Internship Placement'
      : key === 'scholarship' ? 'Scholarship Assistance'
      : key === 'sabbatical' ? 'Sabbatical Program'
      : 'Employment Placement',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${appUrl}/${locale}/apply?service=${key}`,
      serviceSmsNumber: undefined,
      servicePhone: undefined,
      availableLanguage: ['French', 'English', 'Arabic', 'Turkish', 'Japanese', 'Spanish', 'Italian'],
    },
    termsOfService: `${appUrl}/${locale}/terms`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      description: 'Pre-registration fee applies',
      url: `${appUrl}/${locale}/apply?service=${key}`,
      availability: 'https://schema.org/InStock',
      priceValidUntil: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().split('T')[0],
    },
  }));

  // ─────────────────────────────────────────────
  // 4. FAQPage Schema (Rich Snippet for FAQ)
  // ─────────────────────────────────────────────
  const faqQuestions = [
    { q: tFaq('q1'), a: tFaq('a1') },
    { q: tFaq('q2'), a: tFaq('a2') },
    { q: tFaq('q3'), a: tFaq('a3') },
    { q: tFaq('q4'), a: tFaq('a4') },
    { q: tFaq('q5'), a: tFaq('a5') },
  ];

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${appUrl}/${locale}/#faq`,
    mainEntity: faqQuestions.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
        inLanguage: locale,
      },
    })),
    inLanguage: locale,
  };

  // ─────────────────────────────────────────────
  // 5. BreadcrumbList Schema (Navigation Path)
  // ─────────────────────────────────────────────
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Okinte',
        item: `${appUrl}/${locale}`,
      },
    ],
  };

  // ─────────────────────────────────────────────
  // 6. WebPage Schema (Current Page Context)
  // ─────────────────────────────────────────────
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${appUrl}/${locale}/#webpage`,
    url: `${appUrl}/${locale}`,
    name: tMeta('siteTitle'),
    description: tMeta('siteDescription'),
    inLanguage: locale,
    isPartOf: { '@id': `${appUrl}/#website` },
    about: { '@id': `${appUrl}/#organization` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: `${appUrl}/hero-bg.png`,
    },
    datePublished: '2026-04-17',
    dateModified: new Date().toISOString().split('T')[0],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {serviceSchemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
    </>
  );
}
