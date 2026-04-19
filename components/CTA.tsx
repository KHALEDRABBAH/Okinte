'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, Rocket } from 'lucide-react';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="relative py-20 md:py-28 lg:py-36 bg-[#0f172a] overflow-hidden">
      {/* Soft ambient glows */}
      <div className="absolute inset-0">
        <div className="absolute top-0 start-1/4 w-[500px] h-[500px] bg-[#2563EB]/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 end-1/4 w-[500px] h-[500px] bg-[#2563EB]/8 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center max-w-3xl mx-auto"
        >
          {/* Icon */}
          <motion.div 
            initial={{ scale: 0}}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, type: "spring" }}
            className="w-18 h-18 bg-[#2563EB]/15 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm"
          >
            <Rocket className="w-9 h-9 text-[#2563EB]" />
          </motion.div>
          
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-5 tracking-tight leading-[1.15]">
            {t('title')}
          </h2>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('subtitle')}
          </p>
          
          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/apply" className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#2563EB]/60 to-[#2563EB]/30 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
              <div className="relative btn-primary text-base px-10 py-4">
                {t('apply')}
                <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
