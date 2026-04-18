'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Globe, GraduationCap, Briefcase, Award, Plane } from 'lucide-react';

export default function Hero() {
  const t = useTranslations('hero');
  const locale = useLocale();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0f1e] via-primary-dark to-[#0a0f1e] animate-gradient">
      {/* Hero Background Image */}
      <div className="absolute inset-0 opacity-40">
        <img src="/hero-bg.png" alt="" className="w-full h-full object-cover mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
      </div>
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(212,175,55,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(212,175,55,0.08),transparent_40%)]" />
        {[
          { icon: GraduationCap, position: 'top-20 start-20', delay: 0 },
          { icon: Briefcase, position: 'top-32 end-32', delay: 0.5 },
          { icon: Award, position: 'bottom-32 start-32', delay: 1 },
          { icon: Plane, position: 'bottom-20 end-20', delay: 1.5 },
        ].map((item, index) => (
          <motion.div key={index} className={`absolute ${item.position} hidden lg:block`} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 0.15, scale: 1 }} transition={{ delay: item.delay, duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}>
            <item.icon className="w-24 h-24 text-gold" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-20">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-8">
            <Globe className="w-5 h-5 text-gold" />
            <span className="text-white/90 text-sm font-medium">{t('badge')}</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-white leading-tight mb-6">
            {t('title')}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto mb-10">
            {t('subtitle')}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-6 justify-center mt-10">
            <Link href="/apply" className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-gold to-gold/50 rounded-lg blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative btn-primary text-lg px-8 py-4 w-full sm:w-auto">
                {t('cta')}<ArrowRight className="w-5 h-5 ms-2 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
              </div>
            </Link>
            <a href="#services" className="btn-outline text-lg px-8 py-4 glass-panel bg-white/5 border-white/20 hover:bg-white/10">{t('learnMore')}</a>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-20 p-6 glass-panel-dark rounded-2xl max-w-md mx-auto inline-flex flex-col md:flex-row items-center gap-4 text-start">
            <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-gold" />
            </div>
            <div>
              <p className="text-gold font-heading font-semibold text-sm mb-1 tracking-wider uppercase">Official IBLT Partner</p>
              <p className="text-white/80 text-sm font-medium">Authorization N° 11-2015N-MESR/DES</p>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 start-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1.5 h-1.5 bg-gold rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
