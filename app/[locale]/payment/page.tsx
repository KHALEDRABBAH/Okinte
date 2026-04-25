'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

function PaymentContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';

  const [status, setStatus] = useState<'loading' | 'success' | 'canceled' | 'error'>('loading');

  useEffect(() => {
    // Artificial small delay for smooth transition
    const timer = setTimeout(() => {
      if (isSuccess) {
        setStatus('success');
      } else if (isCanceled) {
        setStatus('canceled');
      } else {
        setStatus('error');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [isSuccess, isCanceled]);

  return (
    <div className="pt-28 pb-16 min-h-[70vh] flex flex-col items-center justify-center">
      <div className="container mx-auto px-6 lg:px-8 max-w-lg w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-8 md:p-10 border border-gray-100 text-center"
        >
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 animate-spin text-[#2563EB] mx-auto mb-6" />
              <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Processing Payment...</h1>
              <p className="text-gray-400">Please wait while we confirm your transaction.</p>
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
              <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Payment Successful! 🎉</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Thank you for your payment. Your transaction has been completed successfully and your application is now submitted. We will review it shortly.
              </p>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-3 rounded-xl font-medium transition-colors w-full">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}

          {status === 'canceled' && (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <XCircle className="w-10 h-10 text-amber-600" />
              </motion.div>
              <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Payment Canceled</h1>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Your payment process was canceled. No charges were made. You can try submitting your application again from your dashboard whenever you're ready.
              </p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-black text-white px-6 py-3 rounded-xl font-medium transition-colors w-full">
                  Return to Dashboard
                </Link>
              </div>
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
              <h1 className="text-2xl font-bold text-[#1a1a2e] mb-2">Invalid Request</h1>
              <p className="text-gray-500 mb-6 leading-relaxed">
                We couldn't verify the payment status from this link. Please check your dashboard for the latest updates on your application.
              </p>
              <Link href="/dashboard" className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-xl font-medium transition-colors w-full">
                Go to Dashboard
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col">
        <Suspense fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#2563EB]" />
          </div>
        }>
          <PaymentContent />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
