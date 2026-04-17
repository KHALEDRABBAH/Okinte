'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { GraduationCap, Briefcase, Award, Palmtree, Building2, ArrowRight } from 'lucide-react';

export default function Services() {
  const t = useTranslations('services');

  const services = [
    { id: 'study', icon: GraduationCap, color: 'from-blue-500 to-blue-600' },
    { id: 'internship', icon: Briefcase, color: 'from-emerald-500 to-emerald-600' },
    { id: 'scholarship', icon: Award, color: 'from-amber-500 to-amber-600' },
    { id: 'sabbatical', icon: Palmtree, color: 'from-teal-500 to-teal-600' },
    { id: 'employment', icon: Building2, color: 'from-purple-500 to-purple-600' },
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
              <div className="card h-full hover:border-gold border-2 border-transparent flex flex-col">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-heading font-bold text-xl text-primary mb-1">{t(`${service.id}.title`)}</h3>
                <p className="text-sm text-gold/80 font-medium mb-3">{t(`${service.id}.subtitle`)}</p>
                <p className="text-gray-600 mb-6 flex-1">{t(`${service.id}.description`)}</p>
                <Link href={`/apply?service=${service.id}`} className="inline-flex items-center gap-2 text-gold font-medium hover:text-gold-dark transition-colors group">
                  <span>{t('applyBtn')}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
