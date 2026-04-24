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
    <section className="relative py-20 md:py-28 lg:py-32 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <span className="text-[#2563EB] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-3 tracking-tight">{t('title')}</h2>
          <p className="text-white/70 mt-4">{t('subtitle')}</p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-1/2 start-[10%] end-[10%] h-px bg-gradient-to-r from-[#2563EB]/20 via-[#2563EB]/40 to-[#2563EB]/20 -translate-y-1/2" />
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true }} 
                transition={{ delay: index * 0.12 }}
                className="relative"
              >
                <div className="text-center relative z-10 p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                  {/* Step Number Badge */}
                  <div className="absolute -top-3 start-1/2 -translate-x-1/2 w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center shadow-lg shadow-[#2563EB]/30">
                    <span className="text-white font-bold text-xs">{index + 1}</span>
                  </div>
                  
                  {/* Icon */}
                  <div className="w-20 h-20 rounded-full bg-[#2563EB]/20 flex items-center justify-center mx-auto mb-6 mt-3">
                    <step.icon className="w-9 h-9 text-[#3b82f6]" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-heading font-bold text-lg text-white mb-2">{t(`${step.key}.title`)}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{t(`${step.key}.description`)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
