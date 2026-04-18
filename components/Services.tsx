'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GraduationCap, Briefcase, Award, Palmtree, Building2, ArrowRight } from 'lucide-react';
import ExpandableText from '@/components/ExpandableText';

export default function Services() {
  const t = useTranslations('services');

  const services = [
    { id: 'study', icon: GraduationCap },
    { id: 'internship', icon: Briefcase },
    { id: 'scholarship', icon: Award },
    { id: 'sabbatical', icon: Palmtree },
    { id: 'employment', icon: Building2 },
  ];

  return (
    <section id="services" className="py-24 bg-cream">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="section-title mt-2">{t('title')}</h2>
          <p className="section-subtitle mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <div className="card h-full glow-border bg-white rounded-2xl flex flex-col p-6 sm:p-8 transition-all hover:-translate-y-2 group/card">
                <div className={`w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 transition-transform duration-500 group-hover/card:scale-110`}>
                  <service.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-2 line-clamp-2">{t(`${service.id}.title`)}</h3>
                <p className="text-sm text-gold font-medium mb-4">{t(`${service.id}.subtitle`)}</p>
                <div className="text-gray-600 mb-8 flex-1 text-sm sm:text-base leading-relaxed">
                  <ExpandableText text={t(`${service.id}.description`)} maxLength={120} />
                </div>
                <Link href={`/apply?service=${service.id}`} className="inline-flex items-center gap-2 text-primary font-bold hover:text-gold transition-colors group mt-auto pt-4 border-t border-gray-100">
                  <span>{t('applyBtn')}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
