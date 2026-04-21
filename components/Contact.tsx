'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Facebook, Send, CheckCircle, MessageCircle, ExternalLink } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61567424603648&mibextid=rS40aB7S9Ucbxw6v';

export default function Contact() {
  const t = useTranslations('contact');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative section-spacing bg-gray-50/50" id="contact">
      {/* Seamless top transition */}
      <div className="absolute top-0 start-0 end-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          viewport={{ once: true }} 
          className="text-center max-w-2xl mx-auto mb-14 md:mb-16"
        >
          <span className="section-label">{t('label')}</span>
          <h2 className="section-title mt-3">{t('title')}</h2>
          <p className="section-subtitle mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
          >
            <div className="bg-[#0f172a] rounded-3xl p-8 md:p-12 h-full text-white">
              <h3 className="font-heading font-bold text-2xl mb-8">{t('title')}</h3>
              
              <div className="space-y-6 mb-8">
                <a href="https://wa.me/201280109982" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{t('phoneLabel')}</p>
                    <p className="text-white/70 text-sm group-hover:text-white transition-colors">+20 12 80109982</p>
                  </div>
                </a>
                <a href="mailto:Okinte.placement@gmail.com" className="flex items-start gap-4 group">
                  <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-semibold mb-1">{t('emailLabel')}</p>
                    <p className="text-white/70 text-sm group-hover:text-white transition-colors">Okinte.placement@gmail.com</p>
                  </div>
                </a>
              </div>

              {/* Locations */}
              <div className="mb-8">
                <p className="font-semibold mb-4">{t('addressLabel')}</p>
                <div className="space-y-3">
                  <a href="https://share.google/8BYwcYBxCgfUxgcjG" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-9 h-9 bg-[#2563EB]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-[#2563EB]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">Mongo, Chad</p>
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-[#2563EB]/20 text-[#3b82f6] rounded">Main</span>
                      </div>
                      <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">View on map <ExternalLink className="w-3 h-3" /></p>
                    </div>
                  </a>
                  <a href="https://maps.app.goo.gl/MifFEUFhE11qHS4E8?g_st=aw" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Togo</p>
                      <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">View on map <ExternalLink className="w-3 h-3" /></p>
                    </div>
                  </a>
                  <a href="https://www.google.com/maps/place/pyramids+land+hotel/data=!4m2!3m1!1s0x1458417e9f78f3ff:0x8b7966cc1ddc37a8?sa=X&ved=1t:242&ictx=111" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                    <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4.5 h-4.5 text-white/60" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Giza, Egypt</p>
                      <p className="text-white/50 text-xs mt-0.5 flex items-center gap-1">View on map <ExternalLink className="w-3 h-3" /></p>
                    </div>
                  </a>
                </div>
              </div>
              
              {/* Social Links */}
              <div>
                <p className="font-semibold mb-4">{t('social')}</p>
                <div className="flex gap-3">
                  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors duration-200">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="mailto:Okinte.placement@gmail.com" className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center hover:bg-[#2563EB] transition-colors duration-200">
                    <Mail className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-premium border border-gray-100">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                  </motion.div>
                  <h3 className="font-heading font-bold text-2xl text-[#1a1a2e] mb-3">{t('thankYou')}</h3>
                  <p className="text-gray-600 mb-6">{t('messageSent')}</p>
                  <button onClick={() => setIsSubmitted(false)} className="btn-primary">{t('sendAnother')}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('name')}</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('email')}</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('phone')}</label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('message')}</label>
                    <textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-field resize-none" />
                  </div>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}
                  <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center disabled:opacity-50">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Sending...
                      </span>
                    ) : (
                      <><Send className="w-4.5 h-4.5 me-2" />{t('send')}</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
