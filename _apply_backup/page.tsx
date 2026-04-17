'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  GraduationCap, Briefcase, Award, Palmtree, Building2,
  Upload, FileText, CreditCard, Check, ArrowRight, ArrowLeft, Loader2
} from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';

export default function Apply() {
  const t = useTranslations();
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    service: '',
    passport: null as File | null,
    cv: null as File | null,
    diploma: null as File | null,
    paymentMethod: 'card',
  });

  const services = [
    { id: 'study', icon: GraduationCap, name: t('services.study.title'), description: t('services.study.description') },
    { id: 'internship', icon: Briefcase, name: t('services.internship.title'), description: t('services.internship.description') },
    { id: 'scholarship', icon: Award, name: t('services.scholarship.title'), description: t('services.scholarship.description') },
    { id: 'sabbatical', icon: Palmtree, name: t('services.sabbatical.title'), description: t('services.sabbatical.description') },
    { id: 'employment', icon: Building2, name: t('services.employment.title'), description: t('services.employment.description') },
  ];

  const steps = [
    { number: 1, title: 'Select Service', icon: FileText },
    { number: 2, title: 'Upload Documents', icon: Upload },
    { number: 3, title: 'Payment', icon: CreditCard },
    { number: 4, title: 'Confirmation', icon: Check },
  ];

  const handleFileChange = (type: string, file: File | null) => {
    setFormData({ ...formData, [type]: file });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setCurrentStep(4);
  };

  const FileUpload = ({ type, label, icon: Icon }: { type: string; label: string; icon: any }) => (
    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gold transition-colors">
      <input
        type="file"
        id={type}
        onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)}
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
      />
      <label htmlFor={type} className="cursor-pointer">
        {formData[type as keyof typeof formData] ? (
          <div className="space-y-2">
            <Check className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-green-600 font-medium">Uploaded</p>
            <p className="text-sm text-gray-500">{formData[type as keyof typeof formData]?.name}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <Icon className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-primary font-medium">{label}</p>
            <p className="text-sm text-gray-400">Click to upload (PDF, JPG, PNG)</p>
          </div>
        )}
      </label>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          {/* Progress Steps */}
          <motion.div
            initial={{opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex flex-col items-center ${isRTL ? 'ltr:flex-row-reverse' : ''}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-gold text-primary'
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {currentStep > step.number ? (
                        <Check className="w-6 h-6" />
                      ) : (
                        <step.icon className="w-6 h-6" />
                      )}
                    </div>
                    <span className={`text-sm mt-2 ${currentStep >= step.number ? 'text-primary font-medium' : 'text-gray-400'}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-1 w-16 sm:w-24 mx-4 ${currentStep > step.number ? 'bg-gold' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl p-8"
          >
            {/* Step 1: Select Service */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 text-center">
                  Select Your Service
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setFormData({ ...formData, service: service.id })}
                      className={`p-6 rounded-2xl border-2 text-start transition-all ${
                        formData.service === service.id
                          ? 'border-gold bg-gold/5'
                          : 'border-gray-200 hover:border-gold/50'
                      }`}
                    >
                      <service.icon className={`w-10 h-10 mb-4 ${
                        formData.service === service.id ? 'text-gold' : 'text-primary'
                      }`} />
                      <h3 className="font-heading font-semibold text-lg text-primary mb-2">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-500">{service.description}</p>
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-end">
                  <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!formData.service}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className={`w-5 h-5 ms-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Upload Documents */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 text-center">
                  Upload Required Documents
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <FileUpload type="passport" label="Passport Copy" icon={FileText} />
                  <FileUpload type="cv" label="CV / Resume" icon={FileText} />
                  <FileUpload type="diploma" label="Educational Certificate" icon={FileText} />
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                    <ArrowLeft className={`w-5 h-5 me-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!formData.passport || !formData.cv || !formData.diploma}
                    className="btn-primary disabled:opacity-50"
                  >
                    Next
                    <ArrowRight className={`w-5 h-5 ms-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 text-center">
                  Complete Payment
                </h2>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-cream rounded-2xl p-6">
                    <h3 className="font-semibold text-primary mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Service</span>
                        <span className="font-medium">{services.find(s => s.id === formData.service)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee</span>
                        <span className="font-medium">$150.00</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3">
                        <span>Total</span>
                        <span className="text-gold">$150.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">Payment Method</label>
                    <div className="space-y-3">
                      {['card', 'paypal', 'bank'].map((method) => (
                        <label
                          key={method}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.paymentMethod === method
                              ? 'border-gold bg-gold/5'
                              : 'border-gray-200 hover:border-gold/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method}
                            checked={formData.paymentMethod === method}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.paymentMethod === method ? 'border-gold' : 'border-gray-300'
                          }`}>
                            {formData.paymentMethod === method && (
                              <div className="w-3 h-3 rounded-full bg-gold" />
                            )}
                          </div>
                          <span className="font-medium capitalize">{method === 'card' ? 'Credit/Debit Card' : method}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setCurrentStep(2)} className="btn-secondary">
                    <ArrowLeft className={`w-5 h-5 me-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-primary min-w-[160px]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Pay $150
                        <ArrowRight className={`w-5 h-5 ms-2 rtl:rotate-180 ${isRTL ? '' : ''}`} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                <h2 className="font-heading font-bold text-3xl text-primary mb-4">
                  Application Submitted!
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Your application has been successfully submitted. We will review it and get back to you within 2-5 business days.
                </p>
                <div className="bg-cream rounded-2xl p-6 max-w-md mx-auto mb-8">
                  <p className="text-sm text-gray-500 mb-2">Application Reference</p>
                  <p className="font-mono font-bold text-xl text-primary">BOL-2026-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                </div>
                <div className="flex gap-4 justify-center">
                  <Link href="/dashboard" className="btn-primary">
                    View Dashboard
                  </Link>
                  <Link href="/" className="btn-secondary">
                    Back to Home
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
