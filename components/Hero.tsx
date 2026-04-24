'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowRight, Globe } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-[#0f172a]">
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/hero-bg.png"
          alt="International opportunities for students"
          fill
          priority
          className="object-cover"
        />
        {/* Dark slate overlay for text contrast without blue tint */}
        <div className="absolute inset-0 bg-[#0A0A0A]/80 backdrop-blur-[2px]" />
        
        {/* Subtle, refined accent glow (pure white/slate, not blue) */}
        <div className="absolute top-0 start-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent_70%)]" />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 lg:px-12 relative z-10 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div 
            initial={prefersReducedMotion ? false : { opacity: 0.5, y: 10 }} 
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10"
          >
            <Globe className="w-4.5 h-4.5 text-[#2563EB]" />
            <span className="text-white/90 text-sm font-medium tracking-wide">{t('badge')}</span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            initial={prefersReducedMotion ? false : { opacity: 0.5, y: 15 }} 
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-5"
          >
            {t('title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }} 
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={prefersReducedMotion ? false : { opacity: 0, y: 15 }} 
            animate={prefersReducedMotion ? false : { opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mt-2"
          >
            <Link href="/apply" className="group">
              <div className="btn-primary text-base px-8 py-4">
                {t('cta')}
                <ArrowRight className="w-5 h-5 ms-2 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </div>
            </Link>
            <a 
              href="#services" 
              className="btn-outline text-base px-8 py-4"
            >
              {t('learnMore')}
            </a>
          </motion.div>
        </div>
      </div>

      {/* Seamless Transition to Next Section */}
      <div className="absolute bottom-0 start-0 end-0 h-24 bg-gradient-to-b from-transparent to-[#1a1a2e] pointer-events-none" />
    </section>
  );
}