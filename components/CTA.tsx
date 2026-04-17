'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Rocket } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="py-24 bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 start-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 end-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-4xl mx-auto">
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Rocket className="w-10 h-10 text-gold" />
          </div>
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-6">{t('title')}</h2>
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">{t('subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="btn-primary text-lg px-10 py-4">{t('apply')}<ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></Link>
            <a href="#contact" className="btn-outline text-lg px-10 py-4">{t('contact')}</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
