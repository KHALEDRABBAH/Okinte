'use client';

import { useState, useEffect } from 'react';
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
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<Record<string, boolean>>({});

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

  useEffect(() => {
    const preselected = searchParams.get('service');
    if (preselected && ['study', 'internship', 'scholarship', 'sabbatical', 'employment'].includes(preselected)) {
      setFormData(prev => ({ ...prev, service: preselected }));
    }
  }, [searchParams]);

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
      // 1. Validate Login/Register
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

      // 2. Create Application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceKey: formData.service }),
      });
      const appData = await appRes.json();
      if (!appRes.ok) throw new Error(appData.error || 'Failed to create application');
      
      const newAppId = appData.application.id;
      setApplicationId(newAppId);
      setReferenceCode(appData.application.referenceCode);

      // 3. Upload Files
      // We process sequentially to ensure we track failures properly
      const fileEntries: [string, File | null][] = [['PASSPORT', files.passport], ['CV', files.cv], ['DIPLOMA', files.diploma], ['PAYMENT_RECEIPT', files.paymentReceipt]];
      let uploadSuccess = true;
      for (const [type, file] of fileEntries) {
        if (file) {
          const fd = new FormData();
          fd.append('file', file);
          fd.append('applicationId', newAppId);
          fd.append('type', type);

          const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: fd });
          if (!uploadRes.ok) {
            uploadSuccess = false;
            // Rollback files handled by failure: application without complete files shouldn't be valid,
            // or simply delete the application here. For now we throw an error so the catch block handles it.
            throw new Error(`Failed to upload ${type}. The application was canceled. Please try again.`);
          }
          setUploadProgress(prev => ({ ...prev, [type]: true }));
        }
      }

      // Payment integration placeholder here

      setCurrentStep(4);
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleFileChange = (type: keyof typeof files, file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  };



  const FileUpload = ({ type, label, icon: Icon }: { type: keyof typeof files; label: string; icon: any }) => (
    <div className="relative overflow-hidden border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gold hover:bg-gold/5 transition-all group">
      <input type="file" id={type} onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" />
      <div className="space-y-3 relative z-0 pointer-events-none">
        {files[type] ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-8 h-8 text-green-500" />
            </motion.div>
            <p className="text-green-600 font-semibold">{t('documents.uploaded')}</p>
            <p className="text-sm text-gray-500 truncate max-w-[200px] mx-auto bg-white/80 px-2 py-1 rounded-md">{files[type]!.name}</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
              <Icon className="w-8 h-8 text-gray-400 group-hover:text-gold transition-colors" />
            </div>
            <p className="text-primary font-semibold">{label}</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">Drag & drop or <span className="text-gold">browse</span></p>
            <p className="text-xs text-gray-400 mt-2">{t('documents.formats')}</p>
          </>
        )}
      </div>
    </div>
  );

  const InputField = ({ name, label, type = 'text', icon: Icon, hint }: { name: string; label: string; type?: string; icon: any; hint?: string }) => (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">{label} <span className="text-red-400">*</span></label>
      <div className="relative">
        <Icon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          required
          value={formData[name as keyof typeof formData]}
          onChange={(e) => { setFormData({ ...formData, [name]: e.target.value }); setErrors({ ...errors, [name]: '' }); }}
          className={`input-field ps-12 ${errors[name] ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {errors[name] && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-primary">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
          </motion.div>

          {/* Step indicator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${currentStep >= step.number ? 'bg-gold text-primary' : 'bg-gray-200 text-gray-400'}`}>
                      {currentStep > step.number ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-xs sm:text-sm mt-2 text-center ${currentStep >= step.number ? 'text-primary font-medium' : 'text-gray-400'}`}>{step.title}</span>
                  </div>
                  {index < steps.length - 1 && <div className={`h-1 w-8 sm:w-16 md:w-24 mx-2 sm:mx-4 ${currentStep > step.number ? 'bg-gold' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Step content */}
          <motion.div key={currentStep} initial={{ opacity: 0, x: isRTL ? -20 : 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl shadow-xl p-6 md:p-8">

            {/* STEP 1: Personal Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-heading font-bold text-2xl text-primary mb-6">{t('steps.personalInfo')}</h2>
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
                      <label className="block text-sm font-medium text-primary mb-2">{t('form.country')} <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={(e) => { setFormData({ ...formData, country: e.target.value }); setErrors({ ...errors, country: '' }); }}
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
                    <label className="block text-sm font-medium text-primary mb-3">{t('form.service')} <span className="text-red-400">*</span></label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => { setFormData({ ...formData, service: service.id }); setErrors({ ...errors, service: '' }); }}
                          className={`p-4 rounded-xl border-2 text-start transition-all ${formData.service === service.id ? 'border-gold bg-gold/5' : 'border-gray-200 hover:border-gold/50'}`}
                        >
                          <service.icon className={`w-8 h-8 mb-2 ${formData.service === service.id ? 'text-gold' : 'text-primary'}`} />
                          <p className="font-heading font-semibold text-sm text-primary">{tServices(`${service.id}.title`)}</p>
                        </button>
                      ))}
                    </div>
                    {errors.service && <p className="text-xs text-red-500 mt-1">{errors.service}</p>}
                  </div>
                </div>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-4">{submitError}</div>
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
                <h2 className="font-heading font-bold text-2xl text-primary mb-2">{t('documents.title')}</h2>
                <p className="text-gray-500 text-sm mb-6">{t('documents.subtitle')}</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <FileUpload type="passport" label={t('documents.passport')} icon={FileText} />
                  <FileUpload type="cv" label={t('documents.cv')} icon={FileText} />
                  <FileUpload type="diploma" label={t('documents.diploma')} icon={FileText} />
                  <FileUpload type="paymentReceipt" label={t('documents.paymentReceipt')} icon={FileText} />
                </div>
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mt-4">{submitError}</div>
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
                <h2 className="font-heading font-bold text-2xl text-primary mb-6 text-center">{t('payment.title')}</h2>
                <div className="max-w-md mx-auto space-y-6">
                  <div className="bg-cream rounded-2xl p-6">
                    <h3 className="font-semibold text-primary mb-4">{t('payment.orderSummary')}</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-600">{t('payment.service')}</span><span className="font-medium">{tServices(`${formData.service}.title`)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-600">{t('payment.processingFee')}</span><span className="font-medium">$150.00</span></div>
                      <div className="flex justify-between text-lg font-bold border-t pt-3 mt-3"><span>{t('payment.total')}</span><span className="text-gold">$150.00</span></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-3">{t('payment.paymentMethod')}</label>
                    <div className="p-4 rounded-xl border-2 border-gold bg-gold/5 flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-gold flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-gold" /></div>
                      <CreditCard className="w-5 h-5 text-primary" />
                      <span className="font-medium">{t('payment.card')}</span>
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-12 h-12 text-green-500" /></motion.div>
                <h2 className="font-heading font-bold text-3xl text-primary mb-4">{t('confirmation.title')}</h2>
                <p className="text-gray-600 mb-4 max-w-md mx-auto">{t('confirmation.message')}</p>
                <p className="text-gray-500 text-sm mb-6">{t('confirmation.emailSent')}</p>
                <div className="bg-cream rounded-2xl p-6 max-w-md mx-auto mb-8">
                  <p className="text-sm text-gray-500 mb-2">{t('confirmation.reference')}</p>
                  <p className="font-mono font-bold text-xl text-primary">{referenceCode}</p>
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
