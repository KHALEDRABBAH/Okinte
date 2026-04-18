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
    <section className="py-20 bg-white border-b border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gold/5 blur-3xl rounded-full" />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            className="text-2xl md:text-3xl font-heading font-bold text-primary mb-4"
          >
            {t('title')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: 0.1 }}
            className="text-gray-600 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 items-center justify-center">
          {stats.map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center group"
            >
              <div className="w-16 h-16 mx-auto bg-primary/5 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                <stat.icon className="w-8 h-8 text-gold" />
              </div>
              <h3 className="text-3xl font-bold text-primary mb-2 font-heading">{stat.value}</h3>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
