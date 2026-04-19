'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ShieldCheck, Building, Users, Globe2 } from 'lucide-react';

export default function Trust() {
  const t = useTranslations('trust');

  const stats = [
    { icon: Building, value: '500+', label: t('stats.universities') },
    { icon: Globe2, value: '25+', label: t('stats.countries') },
    { icon: Users, value: '10K+', label: t('stats.students') },
    { icon: ShieldCheck, value: '100%', label: t('stats.success') },
  ];

  return (
    <section className="relative py-16 md:py-24 lg:py-28 bg-[#0f172a] overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center max-w-2xl mx-auto mb-12 md:mb-16"
        >
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-tight"
          >
            {t('title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-white/60 mt-4 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-4 md:mb-5 bg-[#2563EB]/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <stat.icon className="w-6 h-6 md:w-7 md:h-7 text-[#3b82f6]" />
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1.5 md:mb-2 font-heading tracking-tight">
                {stat.value}
              </h3>
              <p className="text-[11px] md:text-xs font-medium text-[#3b82f6] uppercase tracking-[0.1em]">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
