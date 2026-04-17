'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61570781992726';
const INSTAGRAM_URL = 'https://www.instagram.com/bolilanous';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-8 h-8 text-gold">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                  <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <span className="font-heading font-bold text-2xl">Bolila</span>
            </Link>
            <p className="text-white/70 mb-2">{t('tagline')}</p>
            <p className="text-gold text-sm font-medium mb-6">{t('authorization')}</p>
            <div className="flex gap-4">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold transition-colors"><Facebook className="w-5 h-5" /></a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="mailto:contact@bolila.com" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-gold transition-colors"><Mail className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">{t('quickLinks')}</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-white/70 hover:text-gold transition-colors">{tNav('home')}</Link></li>
              <li><Link href="/apply" className="text-white/70 hover:text-gold transition-colors">{tNav('services')}</Link></li>
              <li><a href="#about" className="text-white/70 hover:text-gold transition-colors">{tNav('about')}</a></li>
              <li><a href="#contact" className="text-white/70 hover:text-gold transition-colors">{tNav('contact')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">{t('services')}</h3>
            <ul className="space-y-4">
              <li><Link href="/apply?service=study" className="text-white/70 hover:text-gold transition-colors">{tServices('study.title')}</Link></li>
              <li><Link href="/apply?service=internship" className="text-white/70 hover:text-gold transition-colors">{tServices('internship.title')}</Link></li>
              <li><Link href="/apply?service=scholarship" className="text-white/70 hover:text-gold transition-colors">{tServices('scholarship.title')}</Link></li>
              <li><Link href="/apply?service=sabbatical" className="text-white/70 hover:text-gold transition-colors">{tServices('sabbatical.title')}</Link></li>
              <li><Link href="/apply?service=employment" className="text-white/70 hover:text-gold transition-colors">{tServices('employment.title')}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-6">{t('contactTitle')}</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-white/70"><Phone className="w-5 h-5 text-gold flex-shrink-0" /><span>{tContact('phoneText')}</span></li>
              <li className="flex items-center gap-3 text-white/70"><Mail className="w-5 h-5 text-gold flex-shrink-0" /><span>{tContact('emailText')}</span></li>
              <li className="flex items-center gap-3 text-white/70"><MapPin className="w-5 h-5 text-gold flex-shrink-0" /><span>{tContact('addressText')}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">{t('copyright', { year: String(currentYear) })}</p>
            <div className="flex gap-6">
              <span className="text-white/60 text-sm">{t('privacy')}</span>
              <span className="text-white/60 text-sm">{t('terms')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
