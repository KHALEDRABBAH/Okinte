'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Globe } from 'lucide-react';

export default function About() {
  const t = useTranslations('about');

  return (
    <section id="about" className="relative py-16 md:py-24 lg:py-28 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#2563EB] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-3 mb-4 tracking-tight">{t('title')}</h2>
            <p className="text-base md:text-lg text-white/60 mb-5 leading-relaxed">{t('subtitle')}</p>
            <p className="text-white/60 leading-[1.7]">{t('description')}</p>
          </motion.div>

          {/* Right Content - Core Values */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }} 
            transition={{ duration: 0.6 }}
            className="relative lg:mt-0 mt-8"
          >
            <div className="bg-[#0f172a] rounded-3xl p-6 md:p-10 shadow-2xl">
              <div className="space-y-4">
                {/* Value 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 15 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors duration-300"
                >
                  <div className="w-12 h-12 bg-[#2563EB]/20 rounded-xl flex items-center justify-center mb-4">
                    <Globe className="w-6 h-6 text-[#3b82f6]" />
                  </div>
                  <h4 className="font-heading font-semibold text-lg text-white mb-2">{t('features.secure.title')}</h4>
                  <p className="text-sm text-white/60 leading-relaxed">{t('features.secure.description')}</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}