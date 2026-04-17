'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Target, Eye, Globe, Shield, Users } from 'lucide-react';

export default function About() {
  const t = useTranslations('about');

  const features = [
    { icon: Globe, key: 'global' },
    { icon: Shield, key: 'secure' },
    { icon: Users, key: 'expert' },
  ];

  return (
    <section id="about" className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
            <h2 className="section-title mt-2 mb-6">{t('title')}</h2>
            <p className="text-lg text-gray-600 mb-4">{t('subtitle')}</p>
            <p className="text-gray-600 leading-relaxed mb-8">{t('description')}</p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0"><Target className="w-6 h-6 text-gold" /></div>
                <div><h3 className="font-heading font-semibold text-lg text-primary mb-2">{t('mission')}</h3><p className="text-gray-600">{t('missionText')}</p></div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center flex-shrink-0"><Eye className="w-6 h-6 text-gold" /></div>
                <div><h3 className="font-heading font-semibold text-lg text-primary mb-2">{t('vision')}</h3><p className="text-gray-600">{t('visionText')}</p></div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-white">
                <div className="grid grid-cols-2 gap-6">
                  {features.map((feature, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-sm">
                      <feature.icon className="w-10 h-10 text-gold mx-auto mb-4" />
                      <h4 className="font-heading font-semibold mb-2">{t(`features.${feature.key}.title`)}</h4>
                      <p className="text-sm text-white/70">{t(`features.${feature.key}.description`)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-6 -start-6 w-32 h-32 bg-gold/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-6 -end-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
