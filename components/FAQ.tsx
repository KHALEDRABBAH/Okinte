'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function FAQ() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  const faqs = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
  ];

  return (
    <section className="relative py-20 md:py-28 lg:py-32 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }} 
          className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
        >
          <span className="text-[#2563EB] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-3 tracking-tight">{t('title')}</h2>
          <p className="text-white/70 mt-4">{t('subtitle')}</p>
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3 md:space-y-4">
          {faqs.map((faq, index) => {
            const panelId = `faq-panel-${index}`;
            const isOpen = openIndex === index;
            return (
            <motion.div 
              key={index} 
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }} 
              transition={prefersReducedMotion ? undefined : { delay: index * 0.08 }}
              className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300"
            >
              <button 
                id={`faq-button-${index}`}
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center justify-between p-5 md:p-6 text-start bg-transparent transition-colors duration-200"
              >
                <span className="font-heading font-semibold text-base md:text-lg text-white pe-4 leading-relaxed">{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-[#3b82f6] flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div 
                    id={panelId}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                    initial={prefersReducedMotion ? false : { height: 0, opacity: 0 }}
                    animate={prefersReducedMotion ? { height: 'auto', opacity: 1 } : { height: 'auto', opacity: 1 }}
                    exit={prefersReducedMotion ? { height: 0, opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 md:p-6 pt-0 text-white/70 leading-relaxed bg-transparent">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
