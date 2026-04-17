'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Check, Globe } from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';

export default function Login() {
  const t = useTranslations('auth');
  const tMeta = useTranslations('metadata');
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);
  const router = useRouter();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Redirect based on role
      if (data.user.role === 'ADMIN') {
        router.push(`/${locale}/admin`);
      } else {
        router.push(`/${locale}/dashboard`);
      }
    } catch {
      setError('Network error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, x: isRTL ? 50 : -50 }} animate={{ opacity: 1, x: 0 }} className={`hidden lg:block ${isRTL ? 'lg:order-2' : ''}`}>
            <div className="text-white space-y-8">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className="w-10 h-10 text-gold">
                      <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                      <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
                      <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
                      <circle cx="20" cy="12" r="3" fill="currentColor" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-heading font-bold"><span className="text-gold">Bolila</span></h1>
                </div>
                <p className="text-lg text-white/70 mb-2">{tMeta('siteTitle')}</p>
                <p className="text-sm text-gold">{tMeta('authorization')}</p>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <Globe className="w-6 h-6 text-gold" />
                <div><p className="text-white/60 text-sm">FR • EN • AR • TR • JA • ES • IT</p></div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: isRTL ? -50 : 50 }} animate={{ opacity: 1, x: 0 }} className={`bg-white rounded-3xl shadow-2xl p-8 ${isRTL ? 'lg:order-1' : ''}`}>
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-primary mb-2">{t('loginTitle')}</h2>
              <p className="text-gray-600">{t('noAccount')} <Link href="/apply" className="text-gold font-semibold hover:underline">{t('signUp')}</Link></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">{t('email')}</label>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="input-field ps-12" placeholder="john@example.com" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">{t('password')}</label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? 'text' : 'password'} name="password" required value={formData.password} onChange={handleChange} className="input-field ps-12 pe-12" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="text-end">
                <a href="#" className="text-sm text-gold hover:underline">{t('forgotPassword')}</a>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 disabled:opacity-50">
                {isLoading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>{t('submit')}</span> : <>{t('submit')}<ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
