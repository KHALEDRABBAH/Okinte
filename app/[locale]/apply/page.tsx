'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GraduationCap, Briefcase, Award, Palmtree, Building2, Upload, FileText, CreditCard, Check, ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, MapPin, AlertCircle, Lock } from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';

const ALL_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan",
  "Bahrain","Bangladesh","Belarus","Belgium","Benin","Bolivia","Bosnia and Herzegovina","Brazil","Bulgaria","Burkina Faso",
  "Burundi","Cambodia","Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros",
  "Congo","Costa Rica","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominican Republic","DR Congo",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
  "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guinea-Bissau",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Ivory Coast","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia",
  "Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia",
  "Norway","Oman","Pakistan","Palestine","Panama","Paraguay","Peru","Philippines","Poland","Portugal",
  "Qatar","Romania","Russia","Rwanda","Saudi Arabia","Senegal","Serbia","Sierra Leone","Singapore","Slovakia",
  "Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Syria",
  "Taiwan","Tajikistan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

export default function Apply() {
  const t = useTranslations('apply');
  const tServices = useTranslations('services');
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);
  const searchParams = useSearchParams();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applicationId, setApplicationId] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; finalPrice: number; code: string; type: string; value: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    country: '',
    city: '',
    service: '',
  });

  const [files, setFiles] = useState({
    passport: null as File | null,
    cv: null as File | null,
    diploma: null as File | null,
    paymentReceipt: null as File | null,
  });

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');
    const appIdParam = searchParams.get('app');
    const draftIdParam = searchParams.get('draftId');

    if (successParam === 'true' && appIdParam) {
      setApplicationId(appIdParam);
      setIsProcessingPayment(true);
      pollForConfirmation(appIdParam);
      return;
    }

    if (canceledParam === 'true') {
      setSubmitError('Payment was canceled. Please try again.');
      // if there's an appId, restore it
      if (appIdParam) setApplicationId(appIdParam);
      return;
    }

    if (draftIdParam && !successParam) {
      // Fetch draft application and directly jump to Document step (Step 2)
      fetch(`/api/applications/${draftIdParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.application) {
            setApplicationId(data.application.id);
            setReferenceCode(data.application.referenceCode);
            setFormData(prev => ({ ...prev, service: data.application.service.key }));
            
            // If they reach Step 2, they'll see the service is locked in!
          }
        }).catch(err => console.error('Failed to load draft:', err));
    }

    const preselected = searchParams.get('service');
    if (preselected && ['study', 'internship', 'scholarship', 'sabbatical', 'employment'].includes(preselected)) {
      setFormData(prev => ({ ...prev, service: preselected }));
    }

    fetchServicePrices();
  }, [searchParams]);

  const fetchServicePrices = async () => {
    try {
      const res = await fetch('/api/services');
      if (res.ok) {
        const data = await res.json();
        if (data.services) {
          const prices: Record<string, number> = {};
          data.services.forEach((svc: { key: string; price: number }) => {
            prices[svc.key] = Number(svc.price);
          });
          setServicePrices(prices);
        }
      }
    } catch {
      console.error('Failed to fetch service prices');
    }
  };

  useEffect(() => {
    if (formData.service && servicePrices[formData.service]) {
      setServicePrice(servicePrices[formData.service]);
    } else {
      setServicePrice(null);
    }
  }, [formData.service, servicePrices]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, []);

  const pollForConfirmation = async (appId: string, attempts = 0) => {
    const MAX_ATTEMPTS = 30;
    if (attempts >= MAX_ATTEMPTS) {
      setSubmitError('Payment confirmed but processing is taking longer than expected. Please check your dashboard.');
      setIsProcessingPayment(false);
      return;
    }

    try {
      const res = await fetch(`/api/applications/${appId}`);
      const data = await res.json();

      if (res.ok && data.application) {
        if (data.application.status === 'SUBMITTED') {
          setReferenceCode(data.application.referenceCode);
          setIsProcessingPayment(false);
          setCurrentStep(4);
          return;
        }
        if (data.application.payment?.status === 'FAILED') {
          setSubmitError('Payment failed. Please try again from your dashboard.');
          setIsProcessingPayment(false);
          return;
        }
      }
    } catch {}

    pollingRef.current = setTimeout(() => {
      pollForConfirmation(appId, attempts + 1);
    }, 1500);
  };

  const services = [
    { id: 'study', icon: GraduationCap },
    { id: 'internship', icon: Briefcase },
    { id: 'scholarship', icon: Award },
    { id: 'sabbatical', icon: Palmtree },
    { id: 'employment', icon: Building2 },
  ];

  const steps = [
    { number: 1, title: t('steps.personalInfo'), icon: User },
    { number: 2, title: t('steps.documents'), icon: Upload },
    { number: 3, title: t('steps.payment'), icon: CreditCard },
    { number: 4, title: t('steps.confirmation'), icon: Check },
  ];

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.password || formData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (!formData.country) newErrors.country = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (!formData.service) newErrors.service = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    setSubmitError('');

    if (currentStep === 1) {
      if (!validateStep1()) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!files.passport || !files.cv || !files.diploma || !files.paymentReceipt) {
        setSubmitError('Please upload all required documents.');
        return;
      }
      setCurrentStep(3);
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const meRes = await fetch('/api/auth/me');
      let isLoggedIn = meRes.ok;

      if (!isLoggedIn) {
        const regRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, country: formData.country, city: formData.city, password: formData.password }),
        });
        if (!regRes.ok) {
          const regData = await regRes.json();
          if (regRes.status === 409) throw new Error('An account with this email already exists. Please login first.');
          throw new Error(regData.error || 'Registration failed');
        }
      }

      let newAppId = applicationId;

      if (!newAppId) {
        const appRes = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ serviceKey: formData.service }),
        });
        const appData = await appRes.json();
        if (!appRes.ok) throw new Error(appData.error || 'Failed to create application');
        
        newAppId = appData.application.id;
        setApplicationId(newAppId);
        setReferenceCode(appData.application.referenceCode);
      }

      const fileEntries: [string, File | null][] = [['PASSPORT', files.passport], ['CV', files.cv], ['DIPLOMA', files.diploma], ['PAYMENT_RECEIPT', files.paymentReceipt]];
      for (const [type, file] of fileEntries) {
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('applicationId', newAppId);
          fd.append('type', type);

          const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: fd });
          if (!uploadRes.ok) {
            await fetch(`/api/applications/${newAppId}`, { method: 'DELETE' });
            throw new Error(`Failed to upload ${type}. The application was canceled. Please try again.`);
          }
          setUploadProgress(prev => ({ ...prev, [type]: true }));
        }
      }

      const checkoutRes = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: newAppId, promoCode: promoResult?.code || undefined }),
      });
      
      const checkoutData = await checkoutRes.json();
      if (!checkoutRes.ok) {
        if (checkoutData.code === 'SESSION_EXPIRED') {
          throw new Error(checkoutData.error || 'Payment session expired. Please try again.');
        }
        await fetch(`/api/applications/${newAppId}`, { method: 'DELETE' });
        throw new Error(checkoutData.error || 'Failed to initialize payment');
      }

      if (checkoutData.url) {
        window.location.href = checkoutData.url;
        return;
      }

      await fetch(`/api/applications/${newAppId}`, { method: 'DELETE' }).catch(() => {});
      throw new Error('Payment service unavailable. Please try again later.');
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const [fileError, setFileError] = useState('');

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    setFileError('');
    if (file && file.size > 5 * 1024 * 1024) {
      setFileError(`${file.name}: File size must be less than 5MB`);
      return;
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  const FileUpload = ({ type, label, icon: Icon }: { type: keyof typeof files; label: string; icon: any }) => (
    <div className="relative overflow-hidden border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 transition-all duration-200 group">
      <input type="file" id={type} onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" />
      <div className="space-y-3 relative z-0 pointer-events-none">
        {files[type] ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-emerald-600" />
            </motion.div>
            <p className="text-emerald-600 font-semibold text-sm">{t('documents.uploaded')}</p>
            <p className="text-xs text-gray-400 truncate max-w-[180px] mx-auto bg-gray-100 px-2 py-1 rounded">{files[type]!.name}</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#2563EB] transition-colors" />
            </div>
            <p className="font-semibold text-sm text-[#1a1a2e]">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or <span className="text-[#2563EB]">browse</span></p>
            <p className="text-[10px] text-gray-400 mt-2">{t('documents.formats')}</p>
          </>
        )}
      </div>
    </div>
  );

  const InputField = ({ name, label, type = 'text', icon: Icon, hint }: { name: string; label: string; type?: string; icon: any; hint?: string }) => (
    <div>
      <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <Icon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          required
          value={formData[name as keyof typeof formData]}
          onChange={(e) => { setFormData(prev => ({ ...prev, [name]: e.target.value })); setErrors(prev => ({ ...prev, [name]: '' })); }}
          className={`input-field ps-12 ${errors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {errors[name] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-2">{t('title')}</h1>
            <p className="text-gray-500">{t('subtitle')}</p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 md:mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep >= step.number 
                        ? 'bg-[#0f172a] text-white shadow-lg shadow-[#0f172a]/20' 
                        : 'bg-gray-200 text-gray-400'
                    }`}>
                      {currentStep > step.number ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <step.icon className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-2 text-center max-w-[4rem] sm:max-w-none leading-tight ${
                      currentStep >= step.number ? 'text-[#1a1a2e] font-medium' : 'text-gray-400'
                    }`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-0.5 w-8 sm:w-16 md:w-24 mx-2 sm:mx-4 transition-colors duration-300 ${
                      currentStep > step.number ? 'bg-[#0f172a]' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step Content */}
          <motion.div 
            key={currentStep} 
            initial={{ opacity: 0, x: isRTL ? -20 : 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6 md:p-10 border border-gray-100"
          >
            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-bold text-xl md:text-2xl text-[#1a1a2e] mb-6">{t('steps.personalInfo')}</h2>
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField name="firstName" label={t('form.firstName')} icon={User} />
                    <InputField name="lastName" label={t('form.lastName')} icon={User} />
                  </div>
                  <InputField name="phone" label={t('form.phone')} type="tel" icon={Phone} hint={t('form.phoneHint')} />
                  <InputField name="email" label={t('form.email')} type="email" icon={Mail} />
                  <InputField name="password" label={t('form.password')} type="password" icon={Lock} hint={t('form.passwordHint')} />
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('form.country')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={(e) => { setFormData(prev => ({ ...prev, country: e.target.value })); setErrors(prev => ({ ...prev, country: '' })); }}
                          className={`input-field ps-12 appearance-none ${errors.country ? 'border-red-400' : ''}`}
                        >
                          <option value="">{t('form.selectCountry')}</option>
                          {ALL_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                    <InputField name="city" label={t('form.city')} icon={MapPin} />
                  </div>

                  {/* Service selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-3">{t('form.service')} <span className="text-red-500">*</span></label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => { setFormData(prev => ({ ...prev, service: service.id })); setErrors(prev => ({ ...prev, service: '' })); }}
                          className={`p-4 rounded-xl border-2 text-start transition-all duration-200 ${
                            formData.service === service.id 
                              ? 'border-[#0f172a] bg-slate-50 shadow-sm' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <service.icon className={`w-6 h-6 mb-2 ${formData.service === service.id ? 'text-[#0f172a]' : 'text-gray-400 group-hover:text-gray-600'}`} />
                          <p className="font-semibold text-sm text-[#1a1a2e]">{tServices(`${service.id}.title`)}</p>
                        </button>
                      ))}
                    </div>
                    {errors.service && <p className="text-xs text-red-500 mt-2">{errors.service}</p>}
                  </div>
                </div>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-5">
                    {submitError}
                  </div>
                )}
                <div className="mt-8 flex justify-end">
                  <button onClick={handleNext} disabled={isSubmitting} className="btn-primary disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('form.next')} <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Documents */}
            {currentStep === 2 && (
              <div>
                <h2 className="font-bold text-xl md:text-2xl text-[#1a1a2e] mb-2">{t('documents.title')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('documents.subtitle')}</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <FileUpload type="passport" label={t('documents.passport')} icon={FileText} />
                  <FileUpload type="cv" label={t('documents.cv')} icon={FileText} />
                  <FileUpload type="diploma" label={t('documents.diploma')} icon={FileText} />
                  <FileUpload type="paymentReceipt" label={t('documents.paymentReceipt')} icon={FileText} />
                </div>
                {fileError && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm mt-5 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />{fileError}
                  </div>
                )}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-5">
                    {submitError}
                  </div>
                )}
                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary"><ArrowLeft className="w-5 h-5 me-2 rtl:rotate-180" />{t('form.back')}</button>
                  <button onClick={handleNext} disabled={isSubmitting || !files.passport || !files.cv || !files.diploma || !files.paymentReceipt} className="btn-primary disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('form.next')} <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {currentStep === 3 && (
              <div>
                <h2 className="font-bold text-xl md:text-2xl text-[#1a1a2e] mb-6 text-center">{t('payment.title')}</h2>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-[#1a1a2e] mb-4">{t('payment.orderSummary')}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">{t('payment.service')}</span><span className="font-medium text-[#1a1a2e]">{tServices(`${formData.service}.title`)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">{t('payment.processingFee')}</span><span className="font-medium text-[#1a1a2e]">{servicePrice !== null ? `$${servicePrice.toFixed(2)}` : '...'}</span></div>
                      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                        <span className="text-[#1a1a2e]">{t('payment.total')}</span>
                        <span className="text-[#2563EB]">{servicePrice !== null ? `$${servicePrice.toFixed(2)}` : '...'}</span>
                      </div>
                    </div>
                </div>

                  {/* Promo Code */}
                  <div className="bg-gray-50 rounded-xl p-5">
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-3">Promo Code (optional)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null); }}
                        placeholder="Enter code"
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 font-mono"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!promoCode.trim()) return;
                          setPromoLoading(true);
                          setPromoError('');
                          try {
                            const res = await fetch('/api/promo/validate', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ code: promoCode, originalPrice: servicePrice }),
                            });
                            const data = await res.json();
                            if (res.ok && data.valid) {
                              setPromoResult(data);
                            } else {
                              setPromoError(data.error || 'Invalid promo code');
                              setPromoResult(null);
                            }
                          } catch {
                            setPromoError('Failed to validate');
                          } finally {
                            setPromoLoading(false);
                          }
                        }}
                        disabled={promoLoading || !promoCode.trim()}
                        className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors"
                      >
                        {promoLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                    {promoResult && (
                      <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
                        <span className="text-emerald-700 font-medium">✓ Code {promoResult.code} applied — {promoResult.type === 'PERCENTAGE' ? `${promoResult.value}%` : `$${promoResult.value}`} off (−${promoResult.discount.toFixed(2)})</span>
                      </div>
                    )}
                  </div>

                  {/* Updated Total with discount */}
                  {promoResult && servicePrice !== null && (
                    <div className="bg-emerald-50 rounded-xl p-5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${servicePrice.toFixed(2)}</span></div>
                        <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−${promoResult.discount.toFixed(2)}</span></div>
                        <div className="flex justify-between text-lg font-bold border-t border-emerald-200 pt-2 mt-2">
                          <span className="text-[#1a1a2e]">New Total</span>
                          <span className="text-emerald-600">${promoResult.finalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-3">{t('payment.paymentMethod')}</label>
                    <div className="p-4 rounded-xl border-2 border-[#0f172a] bg-slate-50 shadow-sm flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#0f172a] flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-[#0f172a]" /></div>
                      <CreditCard className="w-5 h-5 text-[#0f172a]" />
                      <span className="font-medium text-[#1a1a2e]">{t('payment.card')}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-between">
                  <button onClick={handleBack} className="btn-secondary"><ArrowLeft className="w-5 h-5 me-2 rtl:rotate-180" />{t('form.back')}</button>
                  <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary min-w-[160px]">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('payment.payNow')} <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Confirmation */}
            {currentStep === 4 && (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-emerald-600" />
                </motion.div>
                <h2 className="font-bold text-3xl text-[#1a1a2e] mb-4">{t('confirmation.title')}</h2>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">{t('confirmation.message')}</p>
                <p className="text-gray-500 text-sm mb-6">{t('confirmation.emailSent')}</p>
                <div className="bg-gray-50 rounded-xl p-6 max-w-md mx-auto mb-8">
                  <p className="text-sm text-gray-500 mb-2">{t('confirmation.reference')}</p>
                  <p className="font-mono font-bold text-xl text-[#1a1a2e]">{referenceCode}</p>
                </div>
                <Link href="/" className="btn-primary">{t('confirmation.backHome')}</Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}