'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      setMessage('No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok && data.verified) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 text-center"
          >
            {status === 'loading' && (
              <>
                <Loader2 className="w-16 h-16 animate-spin text-[#2563EB] mx-auto mb-6" />
                <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Verifying Your Email...</h1>
                <p className="text-gray-500">Please wait while we confirm your email address.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Email Verified! ✅</h1>
                <p className="text-gray-500 mb-8">{message}</p>
                <Link href="/dashboard" className="btn-primary">
                  Go to Dashboard
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <XCircle className="w-10 h-10 text-red-600" />
                </motion.div>
                <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Verification Failed</h1>
                <p className="text-gray-500 mb-6">{message}</p>
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="btn-primary">
                    Go to Login
                  </Link>
                  <p className="text-sm text-gray-400">
                    You can request a new verification email from the login page.
                  </p>
                </div>
              </>
            )}

            {status === 'no-token' && (
              <>
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-10 h-10 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Check Your Email</h1>
                <p className="text-gray-500 mb-6">
                  We've sent you a verification email. Please click the link in your email to verify your account.
                </p>
                <Link href="/login" className="btn-secondary">
                  Go to Login
                </Link>
              </>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
