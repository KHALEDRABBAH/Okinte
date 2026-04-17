'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

export default function Partners() {
  const t = useTranslations('partners');

  return (
    <section className="py-20 bg-primary">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mt-2">{t('title')}</h2>
          <p className="text-white/70 mt-4">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-gold" />
          </div>
          <h3 className="text-2xl font-heading font-bold text-white mb-3">{t('comingSoon')}</h3>
          <p className="text-white/60">{t('comingSoonText')}</p>
        </motion.div>
      </div>
    </section>
  );
}
