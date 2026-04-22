'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Globe, ChevronDown, LayoutDashboard, LogOut } from 'lucide-react';
import { locales, rtlLocales } from '@/i18n/routing';
import { useAuth } from '@/lib/useAuth';

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
  const [isMobileLangOpen, setIsMobileLangOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale as any });
    setIsLangMenuOpen(false);
    setIsMobileLangOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { href: '/' as const, label: t('home') },
    { href: '/#services' as const, label: t('services') },
    { href: '/#about' as const, label: t('about') },
    { href: '/contact' as any, label: t('contact') },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }} 
      animate={{ y: 0 }} 
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`fixed top-0 start-0 end-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'glass-panel shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105">
              <span className="font-heading font-extrabold text-[#0f172a] text-lg tracking-tighter">Ok</span>
            </div>
            <span className="font-heading font-bold text-xl md:text-2xl tracking-tight text-white">Okinte</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} 
                className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors duration-200 text-white/70 hover:bg-white/10"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium">{languageNames[locale]}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLangMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
                  >
                    {locales.map((loc) => (
                      <button 
                        key={loc} 
                        onClick={() => switchLanguage(loc)} 
                        className={`w-full px-4 py-3 flex items-center justify-between text-start transition-colors duration-150 ${
                          loc === locale 
                            ? 'bg-[#0f172a]/5 text-[#0f172a] font-medium' 
                            : 'text-[#0f172a]/80 hover:bg-gray-50'
                        }`}
                      >
                        <span>{languageNames[loc]}</span>
                        {loc === locale && <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Auth Section */}
            {!authLoading && (
              isAuthenticated ? (
                <>
                  <Link 
                    href={isAdmin ? '/admin' as any : '/dashboard' as any} 
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isAdmin ? t('admin') : t('dashboard')}
                  </Link>
                  <button 
                    onClick={async () => { await logout(); window.location.href = `/${locale}/login`; }} 
                    className="flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 text-white/80 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <Link 
                  href="/login" 
                  className="text-sm font-medium transition-colors duration-200 text-white/80 hover:text-white"
                >
                  {t('login')}
                </Link>
              )
            )}
            
            <Link href="/apply" className="btn-primary text-sm">
              {t('apply')}
            </Link>
          </div>

          {/* Mobile Language + Menu */}
          <div className="lg:hidden flex items-center gap-2">
            {/* Mobile Language Selector */}
            <div className="relative">
              <button 
                onClick={() => setIsMobileLangOpen(!isMobileLangOpen)} 
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-white/80 hover:bg-white/10 transition-colors"
              >
                <Globe className="w-4.5 h-4.5" />
                <span className="text-xs font-medium uppercase">{locale}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobileLangOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isMobileLangOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -8, scale: 0.95 }} 
                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute end-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]"
                  >
                    {locales.map((loc) => (
                      <button 
                        key={loc} 
                        onClick={() => switchLanguage(loc)} 
                        className={`w-full px-4 py-2.5 flex items-center justify-between text-start transition-colors duration-150 ${
                          loc === locale 
                            ? 'bg-[#2563EB]/10 text-[#2563EB] font-semibold' 
                            : 'text-[#1a1a2e] hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-sm">{languageNames[loc]}</span>
                        {loc === locale && <div className="w-2 h-2 rounded-full bg-[#2563EB]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="p-2.5 rounded-xl text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden bg-[#0f172a] border-t border-white/10"
          >
            <div className="container mx-auto px-4 py-5 space-y-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block py-2.5 text-white font-medium"
                >
                  {link.label}
                </Link>
              ))}
              
              <hr className="my-3 border-white/10" />
              
              {!authLoading && (
                isAuthenticated ? (
                  <>
                    <Link 
                      href={isAdmin ? '/admin' as any : '/dashboard' as any} 
                      className="block py-2.5 text-white font-medium flex items-center gap-2" 
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-4 h-4" /> 
                      {isAdmin ? t('admin') : t('dashboard')}
                    </Link>
                    <button 
                      onClick={async () => { await logout(); window.location.href = `/${locale}/login`; }} 
                      className="block py-2.5 text-red-400 font-medium flex items-center gap-2 w-full text-start"
                    >
                      <LogOut className="w-4 h-4" /> 
                      {t('logout')}
                    </button>
                  </>
                ) : (
                  <Link 
                    href="/login" 
                    className="block py-2.5 text-white font-medium" 
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                )
              )}
              
              <Link href="/apply" className="btn-primary text-center block mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                {t('apply')}
              </Link>
              
              {/* Language Selection */}
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-white/40 mb-3">{t('selectLanguage')}:</p>
                <div className="flex flex-wrap gap-2">
                  {locales.map((loc) => (
                    <button 
                      key={loc} 
                      onClick={() => switchLanguage(loc)} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        loc === locale 
                          ? 'bg-[#2563EB] text-white' 
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                    >
                      {languageNames[loc]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}