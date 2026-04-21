'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { MessageCircle, X, Facebook, Mail } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61567424603648&mibextid=rS40aB7S9Ucbxw6v';

export default function FloatingContact() {
  const t = useTranslations('floating');
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { icon: Facebook, label: t('facebook'), href: FACEBOOK_URL, color: 'bg-blue-600' },
    { icon: Mail, label: t('email'), href: 'mailto:Okinte.placement@gmail.com', color: 'bg-red-500' },
    { icon: MessageCircle, label: t('whatsapp'), href: 'https://wa.me/201280109982', color: 'bg-green-500' },
  ];

  return (
    <div className="fixed z-[60] end-4 md:end-6" style={{ bottom: 'max(1.5rem, calc(env(safe-area-inset-bottom, 0px) + 1rem))' }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-4 space-y-3 origin-bottom-right"
          >
            {links.map((link, index) => (
              <motion.a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 justify-end group"
              >
                <span className="bg-white px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {link.label}
                </span>
                <div className={`w-12 h-12 ${link.color} rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}>
                  <link.icon className="w-6 h-6 text-white" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${isOpen ? 'bg-gray-700 rotate-0' : 'bg-[#2563EB] hover:shadow-premium hover:bg-blue-700 hover:scale-105'}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
