'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
import { locales, rtlLocales } from '@/i18n/routing';

const languageNames: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
  tr: 'Türkçe',
  ja: '日本語',
  es: 'Español',
  it: 'Italiano',
};

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isRTL = rtlLocales.includes(locale as any);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
    setIsLangMenuOpen(false);
  };

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/apply' as const, label: t('services') },
    { href: '/#about' as const, label: t('about') },
    { href: '/#contact' as const, label: t('contact') },
  ];

  return (
    <header className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 40 40" className="w-8 h-8 text-gold">
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
                <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="12" r="3" fill="currentColor" />
              </svg>
            </div>
            <span className={`font-heading font-bold text-2xl ${isScrolled ? 'text-primary' : 'text-white'}`}>Bolila</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`font-medium transition-colors ${isScrolled ? 'text-primary hover:text-gold' : 'text-white/90 hover:text-white'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isScrolled ? 'text-primary hover:bg-gray-100' : 'text-white/90 hover:bg-white/10'}`}>
                <Globe className="w-5 h-5" />
                <span className="font-medium">{languageNames[locale]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute end-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    {locales.map((loc) => (
                      <button key={loc} onClick={() => switchLanguage(loc)} className={`w-full px-4 py-3 text-start transition-colors ${loc === locale ? 'bg-gold/10 text-gold font-medium' : 'text-primary hover:bg-gray-50'}`}>
                        {languageNames[loc]}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/apply" className="btn-primary text-sm">{t('apply')}</Link>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className={`lg:hidden p-2 rounded-lg ${isScrolled ? 'text-primary' : 'text-white'}`}>
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-t">
            <div className="container mx-auto px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-primary font-medium">{link.label}</Link>
              ))}
              <hr className="my-4" />
              <Link href="/apply" className="btn-primary text-center block" onClick={() => setIsMobileMenuOpen(false)}>{t('apply')}</Link>
              <div className="pt-4">
                <p className="text-sm text-gray-500 mb-2">{t('selectLanguage')}:</p>
                <div className="flex flex-wrap gap-2">
                  {locales.map((loc) => (
                    <button key={loc} onClick={() => switchLanguage(loc)} className={`px-3 py-1 rounded-lg text-sm transition-colors ${loc === locale ? 'bg-primary text-white' : 'bg-gray-100 text-primary hover:bg-gray-200'}`}>
                      {languageNames[loc]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
