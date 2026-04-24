'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Star, Quote } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function Testimonials() {
  const t = useTranslations('testimonials');
  const prefersReducedMotion = useReducedMotion();

  const testimonialKeys = ['t1', 't2', 't3'] as const;

  return (
    <section className="py-20 md:py-28 lg:py-32 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#60a5fa] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-3 tracking-tight">{t('title')}</h2>
          <p className="text-white/70 mt-4">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonialKeys.map((key, index) => (
            <motion.div key={key} initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }} whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} viewport={{ once: true }} transition={prefersReducedMotion ? undefined : { delay: index * 0.15 }}>
              <div className="h-full p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden group">
                <Quote className="absolute top-6 start-6 w-10 h-10 text-[#2563EB]/20" />
                <div className="flex gap-1 mb-5 pt-3 relative z-10">
                  {[...Array(5)].map((_, i) => (<Star key={i} className="w-5 h-5 text-[#3b82f6] fill-[#3b82f6]" />))}
                </div>
                <p className="text-white/70 mb-8 leading-relaxed relative z-10">"{t(`items.${key}.quote`)}"</p>
                <div className="flex items-center gap-4 mt-auto relative z-10 border-t border-white/10 pt-5">
                  <div className="w-12 h-12 bg-[#2563EB]/20 rounded-full flex items-center justify-center">
                    <span className="text-lg font-heading font-bold text-[#3b82f6]">{t(`items.${key}.name`).charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-white">{t(`items.${key}.name`)}</p>
                    <p className="text-xs font-medium text-[#60a5fa]">{t(`items.${key}.role`)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
