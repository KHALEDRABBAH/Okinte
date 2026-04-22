'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Globe, Home } from 'lucide-react';
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
    <main className="min-h-screen bg-[#FAFAFA] flex items-center justify-center py-12 md:py-16">
      <div className="container mx-auto px-6 lg:px-8">
        {/* Back to Home */}
        <div className="max-w-6xl mx-auto mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#2563EB] transition-colors group"
          >
            <ArrowLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${isRTL ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
            <Home className="w-4 h-4" />
            {t('backToHome')}
          </Link>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-16 items-center max-w-6xl mx-auto">
          
          {/* Left - Branding Panel */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? 40 : -40 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className={`hidden lg:flex flex-col justify-center bg-[#0A0A0A] p-12 rounded-2xl shadow-xl h-full ${isRTL ? 'lg:order-2' : ''}`}
          >
            <div className="text-white space-y-10">
              {/* Logo & Brand */}
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 40 40" className="w-8 h-8 text-[#0A0A0A]">
                      <path d="M8 12 C8 12, 16 10, 26 16 C36 22, 30 32, 20 32 C10 32, 8 24, 12 18" 
                            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      <circle cx="20" cy="20" r="3.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-heading font-bold text-white">
                      Okinte
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-white/70 mb-2 leading-relaxed">{tMeta('siteTitle')}</p>
              </div>

              {/* Languages */}
              <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                <Globe className="w-5 h-5 text-white/40" />
                <div>
                  <p className="text-white/50 text-sm">FR • EN • AR • TR • JA • ES • IT</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right - Login Form */}
          <motion.div 
            initial={{ opacity: 0, x: isRTL ? -40 : 40 }} 
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 md:p-10 ${isRTL ? 'lg:order-1' : ''}`}
          >
            {/* Header */}
            <div className="mb-8">
              <h2 className="font-bold text-2xl md:text-3xl text-[#1a1a2e] mb-2">
                {t('loginTitle')}
              </h2>
              <p className="text-gray-500 text-sm">
                {t('noAccount')} <Link href="/apply" className="text-[#2563EB] font-semibold hover:underline">{t('signUp')}</Link>
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  {t('email')}
                </label>
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email" 
                    name="email" 
                    required 
                    value={formData.email} 
                    onChange={handleChange}
                    className="input-field ps-12" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a2e] mb-2">
                  {t('password')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                    className="input-field ps-12 pe-12" 
                    placeholder="••••••••" 
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link 
                  href="/forgot-password" 
                  className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading} 
                className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {t('submit')}
                  </span>
                ) : (
                  <>
                    {t('submit')}
                    <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" />
                  </>
                )}
              </button>
            </form>

            {/* Mobile Brand Link */}
            <div className="lg:hidden mt-8 pt-6 border-t border-gray-100 text-center">
              <Link href="/" className="inline-flex items-center gap-3 text-[#1a1a2e] hover:text-black transition-colors">
                <div className="w-8 h-8 bg-[#1a1a2e] rounded-lg text-white flex items-center justify-center font-bold">Ok</div>
                <span className="font-semibold text-lg">Okinte</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}