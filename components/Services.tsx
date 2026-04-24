'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GraduationCap, Briefcase, Award, Palmtree, Building2, ArrowRight } from 'lucide-react';
import ExpandableText from '@/components/ExpandableText';
import { useReducedMotion } from '@/lib/useReducedMotion';

export default function Services() {
  const t = useTranslations('services');
  const prefersReducedMotion = useReducedMotion();

  const services = [
    { id: 'study', icon: GraduationCap },
    { id: 'internship', icon: Briefcase },
    { id: 'scholarship', icon: Award },
    { id: 'sabbatical', icon: Palmtree },
    { id: 'employment', icon: Building2 },
  ];

  return (
    <section id="services" className="relative py-20 md:py-28 lg:py-32 bg-[#0f172a]">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }} 
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center max-w-2xl mx-auto mb-14 md:mb-20"
        >
          <span className="text-[#60a5fa] font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mt-3 tracking-tight">{t('title')}</h2>
          <p className="text-white/70 mt-4">{t('subtitle')}</p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
          {services.map((service, index) => (
            <motion.div 
              key={service.id} 
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }} 
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              transition={prefersReducedMotion ? undefined : { delay: index * 0.08 }}
            >
              <Link 
                href={`/apply?service=${service.id}`}
                className="block h-full group"
              >
                <div className="h-full p-6 md:p-8 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 relative overflow-hidden">
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Icon */}
                    <div className="w-13 h-13 md:w-14 md:h-14 rounded-2xl bg-[#2563EB]/20 flex items-center justify-center mb-5 md:mb-6 transition-transform duration-300 group-hover:scale-110">
                      <service.icon className="w-6.5 h-6.5 md:w-7 md:h-7 text-[#3b82f6]" />
                    </div>
                    
                    {/* Content */}
                    <h3 className="font-heading font-bold text-xl text-white mb-2 line-clamp-2">
                      {t(`${service.id}.title`)}
                    </h3>
                    <p className="text-sm text-[#60a5fa] font-medium mb-4">{t(`${service.id}.subtitle`)}</p>
                    
                    <div className="text-sm text-white/70 mb-6 md:mb-8 flex-1 leading-relaxed">
                      <ExpandableText text={t(`${service.id}.description`)} maxLength={100} />
                    </div>
                    
                    {/* CTA Link */}
                    <div className="mt-auto pt-4 border-t border-white/10">
                      <span className="inline-flex items-center gap-2 text-white/80 font-semibold group-hover:text-[#3b82f6] transition-colors">
                        <span>{t('applyBtn')}</span>
                        <ArrowRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
