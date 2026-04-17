'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Facebook, Instagram, Send, CheckCircle, MessageCircle } from 'lucide-react';

const FACEBOOK_URL = 'https://www.facebook.com/profile.php?id=61570781992726';
const INSTAGRAM_URL = 'https://www.instagram.com/bolilanous';

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
    <section className="py-24 bg-cream" id="contact">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-semibold text-sm uppercase tracking-wider">{t('label')}</span>
          <h2 className="section-title mt-2">{t('title')}</h2>
          <p className="section-subtitle mx-auto">{t('subtitle')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-12 h-full text-white">
              <h3 className="font-heading font-bold text-2xl mb-8">{t('title')}</h3>
              <div className="space-y-6 mb-12">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-gold" /></div>
                  <div><p className="font-semibold mb-1">{t('addressLabel')}</p><p className="text-white/70">{t('addressText')}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><MessageCircle className="w-6 h-6 text-gold" /></div>
                  <div><p className="font-semibold mb-1">{t('phoneLabel')}</p><p className="text-white/70">{t('phoneText')}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-gold" /></div>
                  <div><p className="font-semibold mb-1">{t('emailLabel')}</p><p className="text-white/70">{t('emailText')}</p></div>
                </div>
              </div>
              <div>
                <p className="font-semibold mb-4">{t('social')}</p>
                <div className="flex gap-4">
                  <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Facebook className="w-6 h-6" /></a>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Instagram className="w-6 h-6" /></a>
                  <a href="mailto:contact@bolila.com" className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-gold transition-colors"><Mail className="w-6 h-6" /></a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
                  <h3 className="font-heading font-bold text-2xl text-primary mb-4">{t('thankYou')}</h3>
                  <p className="text-gray-600">{t('messageSent')}</p>
                  <button onClick={() => setIsSubmitted(false)} className="mt-6 btn-primary">{t('sendAnother')}</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div><label className="block text-sm font-medium text-primary mb-2">{t('name')}</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium text-primary mb-2">{t('email')}</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium text-primary mb-2">{t('phone')}</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input-field" /></div>
                  <div><label className="block text-sm font-medium text-primary mb-2">{t('message')}</label><textarea required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="input-field resize-none" /></div>
                  <button type="submit" className="btn-primary w-full"><Send className="w-5 h-5 me-2" />{t('send')}</button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
