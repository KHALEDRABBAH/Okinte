'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ForgotPassword() {
  const t = useTranslations('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send reset link');
      }

      setIsSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col justify-center py-24 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h2 className="text-3xl font-heading font-bold text-[#1a1a2e]">{t('resetPassword')}</h2>
            <p className="mt-2 text-gray-600 text-sm max-w-sm mx-auto">
              {t('resetPasswordDescription')}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
            <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-3xl sm:px-10 border border-gray-100">
              
              {isSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1a1a2e] mb-2">{t('checkEmail')}</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    {t('resetEmailSent', { email })}
                  </p>
                  <Link href="/login" className="btn-secondary w-full justify-center">
                    {t('backToLogin')}
                  </Link>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#1a1a2e] mb-2">
                      {t('email')}
                    </label>
                    <div className="relative">
                      <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(''); }}
                        autoComplete="email"
                        className={`input-field ps-12 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {error && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />{error}
                      </p>
                    )}
                  </div>

                  <div>
                    <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center disabled:opacity-70 disabled:cursor-not-allowed">
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sendResetLink')}
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-6 flex justify-center">
                <Link href="/login" className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#2563EB] transition-colors font-medium">
                  <ArrowLeft className="w-4 h-4" /> {t('backToLogin')}
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
