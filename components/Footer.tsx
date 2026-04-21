'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Facebook, Mail } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61567424603648&mibextid=rS40aB7S9Ucbxw6v';

export default function Footer() {
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');
  const tServices = useTranslations('services');
  const tContact = useTranslations('contact');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-12 py-14 md:py-18">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-5 group">
              <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="font-heading font-extrabold text-[#0f172a] text-xl tracking-tighter">Ok</span>
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-white group-hover:text-white/90 transition-colors">Okinte</span>
            </Link>
            <p className="text-white/60 text-sm mb-1 leading-relaxed">{t('tagline')}</p>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors duration-200">
                <Facebook className="w-4.5 h-4.5" />
              </a>
              <a href="mailto:Okinte.placement@gmail.com" className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors duration-200">
                <Mail className="w-4.5 h-4.5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-base mb-5 md:mb-6">{t('quickLinks')}</h3>
            <ul className="space-y-3">
              <li><Link href="/" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tNav('home')}</Link></li>
              <li><Link href="/apply" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tNav('services')}</Link></li>
              <li><a href="#about" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tNav('about')}</a></li>
              <li><Link href="/contact" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tNav('contact')}</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-heading font-semibold text-base mb-5 md:mb-6">{t('services')}</h3>
            <ul className="space-y-3">
              <li><Link href="/apply?service=study" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tServices('study.title')}</Link></li>
              <li><Link href="/apply?service=internship" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tServices('internship.title')}</Link></li>
              <li><Link href="/apply?service=scholarship" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tServices('scholarship.title')}</Link></li>
              <li><Link href="/apply?service=sabbatical" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tServices('sabbatical.title')}</Link></li>
              <li><Link href="/apply?service=employment" className="text-white/60 hover:text-[#2563EB] transition-colors text-sm">{tServices('employment.title')}</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-heading font-semibold text-base mb-5 md:mb-6">{t('contactTitle')}</h3>
            <ul className="space-y-2.5">
              <li>
                <a href="https://wa.me/201280109982" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📱</span>
                  </div>
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">+20 12 80109982</span>
                </a>
              </li>
              <li>
                <a href="mailto:Okinte.placement@gmail.com" className="flex items-center gap-3 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-[#2563EB]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">✉️</span>
                  </div>
                  <span className="text-white/70 text-xs group-hover:text-white transition-colors truncate">Okinte.placement@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="https://share.google/8BYwcYBxCgfUxgcjG" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-200 group">
                  <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">📍</span>
                  </div>
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">Mongo, Chad</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-12 py-5">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">{t('copyright', { year: String(currentYear) })}</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-white/40 text-sm hover:text-[#2563EB] transition-colors">{t('privacy')}</Link>
              <Link href="/terms" className="text-white/40 text-sm hover:text-[#2563EB] transition-colors">{t('terms')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}