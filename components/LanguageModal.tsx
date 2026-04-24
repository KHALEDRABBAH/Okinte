'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

/**
 * LanguageModal — Shown on first visit to ask the user's preferred language.
 * Saves choice to localStorage to skip on future visits.
 */
export default function LanguageModal() {
  const [show, setShow] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only show if user hasn't chosen before
    const saved = localStorage.getItem('okinte-lang-chosen');
    if (!saved) {
      // Brief delay so the page loads first
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSelect = (code: string) => {
    setSelected(code);
    localStorage.setItem('okinte-lang-chosen', 'true');
    localStorage.setItem('okinte-lang', code);

    // Replace locale segment in current path
    const segments = pathname.split('/');
    segments[1] = code;
    const newPath = segments.join('/') || `/${code}`;

    setTimeout(() => {
      setShow(false);
      router.push(newPath);
    }, 300);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 max-w-md w-full mx-4"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-gold" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-primary">
                Choose Your Language
              </h2>
              <p className="text-gray-500 text-sm mt-2">
                Choisissez votre langue · اختر لغتك
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-xl text-left transition-all ${
                    selected === lang.code
                      ? 'bg-gold text-primary shadow-lg scale-[1.02]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium flex-1">{lang.label}</span>
                  {selected === lang.code && (
                    <Check className="w-5 h-5" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                localStorage.setItem('okinte-lang-chosen', 'true');
                setShow(false);
              }}
              className="w-full text-center text-gray-500 hover:text-gray-600 text-sm mt-6 transition-colors"
            >
              Continue with current language
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
