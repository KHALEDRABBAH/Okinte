'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { UserPlus, FileUp, CreditCard, Sparkles } from 'lucide-react';

export default function Process() {
  const t = useTranslations('process');

  const steps = [
    { icon: UserPlus, key: 'step1' },
    { icon: FileUp, key: 'step2' },
    { icon: CreditCard, key: 'step3' },
    { icon: Sparkles, key: 'step4' },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="section-title mt-2">{t('title')}</h2>
          <p className="section-subtitle mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 start-0 end-0 h-1 bg-gradient-to-r from-gold/20 via-gold/40 to-gold/20 -translate-y-1/2" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.15 }} className="relative">
                <div className="card text-center relative z-10 bg-white">
                  <div className="absolute -top-4 start-1/2 -translate-x-1/2 w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg">
                    <step.icon className="w-10 h-10 text-gold" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-primary mb-2">{t(`${step.key}.title`)}</h3>
                  <p className="text-gray-600 text-sm">{t(`${step.key}.description`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
