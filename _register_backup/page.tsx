'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, ArrowRight, Check } from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';

export default function Register() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      router.push(`/${locale}/dashboard`);
    }, 1500);
  };

  const countries = [
    'Egypt', 'United States', 'United Kingdom', 'France', 'Germany',
    'Turkey', 'Japan', 'Spain', 'Italy', 'Saudi Arabia', 'UAE', 'Other'
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`hidden lg:block ${isRTL ? 'lg:order-2' : ''}`}
          >
            <div className="text-white space-y-8">
              <div>
                <h1 className="text-5xl font-heading font-bold mb-6">
                  Join <span className="text-gold">Bolila</span> Today
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  Begin your journey to international success. Create your account and unlock a world of opportunities in education, internships, and careers.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  'Access to 150+ partner institutions',
                  'Personalized opportunity matching',
                  'Secure document management',
                  'Dedicated support team',
                ].map((item, index) => (
                  <div key={index} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-gold" />
                    </div>
                    <span className="text-white/90">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`bg-white rounded-3xl shadow-2xl p-8 ${isRTL ? 'lg:order-1' : ''}`}
          >
            <div className="mb-8">
              <h2 className="font-heading font-bold text-2xl text-primary mb-2">
                {t('registerTitle')}
              </h2>
              <p className="text-gray-600">
                {t('noAccount')}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('fullName')}
                </label>
                <div className="relative">
                  <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="input-field ps-12"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
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

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('phone')}
                </label>
                <div className="relative">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field ps-12"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('country')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      name="country"
                      required
                      value={formData.country}
                      onChange={handleChange}
                      className="input-field ps-12 appearance-none"
                    >
                      <option value="">Select</option>
                      {countries.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-primary mb-2">
                    {t('city')}
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Cairo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
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
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  {t('confirmPassword')}
                </label>
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field ps-12"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <>
                    {t('signUp')}
                    <ArrowRight className={`w-5 h-5 ms-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                  </>
                )}
              </button>
            </form>

            <p className={`mt-6 text-center text-gray-600 ${isRTL ? 'text-right' : ''}`}>
              {t('hasAccount')}{' '}
              <Link href="/login" className="text-gold font-semibold hover:underline">
                {t('signIn')}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
