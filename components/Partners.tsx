'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

export default function Partners() {
  const t = useTranslations('partners');

  return (
    <section className="py-20 md:py-28 lg:py-32 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <span className="text-[#2563EB] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-2 mb-4 tracking-tight">{t('title')}</h2>
          <p className="text-white/70">{t('subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto bg-white/5 backdrop-blur-md rounded-2xl p-10 md:p-14 text-center border border-white/5 shadow-2xl"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-8 transition-transform duration-300 hover:scale-110">
            <Clock className="w-8 h-8 md:w-10 md:h-10 text-[#2563EB]" />
          </div>
          <h3 className="text-xl md:text-2xl font-heading font-bold text-white mb-3 tracking-tight">{t('comingSoon')}</h3>
          <p className="text-white/60 leading-relaxed text-sm md:text-base">{t('comingSoonText')}</p>
        </motion.div>
      </div>
    </section>
  );
}
