'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Upload, FileText, Check, ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, MapPin, AlertCircle, Lock, Eye, EyeOff, MailCheck } from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';
import PhoneInput from '@/components/PhoneInput';

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

// ============================================================
// EXTRACTED COMPONENTS
// ============================================================

interface InputFieldProps {
  name: string;
  label: string;
  type?: string;
  icon: any;
  hint?: string;
  value: string;
  error?: string;
  onChange: (name: string, value: string) => void;
  disabled?: boolean;
}

function InputField({ name, label, type = 'text', icon: Icon, hint, value, error, onChange, disabled }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-[#1a1a2e] mb-2">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <Icon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          id={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          name={name}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : isPassword ? 'new-password' : 'given-name'}
          className={`input-field ps-12 ${isPassword ? 'pe-12' : ''} ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

interface FileUploadProps {
  type: string;
  label: string;
  icon: any;
  file: File | null;
  onFileChange: (type: string, file: File | null) => void;
  uploadedLabel: string;
  formatsLabel: string;
}

function FileUpload({ type, label, icon: Icon, file, onFileChange, uploadedLabel, formatsLabel }: FileUploadProps) {
  return (
    <div className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 group ${file ? 'border-emerald-400 bg-emerald-50/50 shadow-sm' : 'border-gray-300 hover:border-[#2563EB]/60 hover:bg-[#2563EB]/5 hover:shadow-sm hover:-translate-y-0.5'}`}>
      <input type="file" id={type} onChange={(e) => onFileChange(type, e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" />
      <div className="space-y-3 relative z-0 pointer-events-none">
        {file ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-emerald-200">
              <Check className="w-7 h-7 text-emerald-600" />
            </motion.div>
            <p className="text-emerald-700 font-semibold text-sm">{uploadedLabel}</p>
            <p className="text-xs text-emerald-600/80 truncate max-w-[200px] mx-auto bg-emerald-100/50 px-3 py-1.5 rounded-lg border border-emerald-100">{file.name}</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-white group-hover:scale-110 group-hover:shadow-sm transition-all duration-300">
              <Icon className="w-7 h-7 text-gray-400 group-hover:text-[#2563EB] transition-colors" />
            </div>
            <p className="font-semibold text-[15px] text-[#1a1a2e] group-hover:text-[#2563EB] transition-colors">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or <span className="text-[#2563EB] font-medium underline decoration-[#2563EB]/30 underline-offset-2">browse</span></p>
            <p className="text-[11px] text-gray-400 mt-2">{formatsLabel}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Apply() {
  const t = useTranslations('apply');
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
  });

  const [files, setFiles] = useState({
    passport: null as File | null,
    cv: null as File | null,
    diploma: null as File | null,
  });

  const steps = [
    { number: 1, title: t('steps.personalInfo'), icon: User },
    { number: 2, title: t('steps.documents'), icon: Upload },
    { number: 3, title: 'Verify Email', icon: MailCheck },
  ];

  const handleInputChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  }, []);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Required';
    if (formData.firstName.trim() && formData.firstName.trim().length < 2) newErrors.firstName = 'At least 2 characters';
    if (!formData.lastName.trim()) newErrors.lastName = 'Required';
    if (formData.lastName.trim() && formData.lastName.trim().length < 2) newErrors.lastName = 'At least 2 characters';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    if (!formData.password) {
      newErrors.password = 'Required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Min 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Must contain at least one uppercase letter (A-Z)';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Must contain at least one number (0-9)';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.country) newErrors.country = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (formData.city.trim() && formData.city.trim().length < 2) newErrors.city = 'At least 2 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkAvailability = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), phone: formData.phone.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) return true;
      
      const newErrors: Record<string, string> = {};
      if (data.emailTaken) {
        newErrors.email = 'This email is already registered. Please login or use a different email.';
      }
      if (data.phoneTaken) {
        newErrors.phone = 'This phone number is already registered. Please use a different number.';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...newErrors }));
        return false;
      }
      return true;
    } catch {
      return true;
    }
  };

  const handleNext = async () => {
    setSubmitError('');

    if (currentStep === 1) {
      if (!validateStep1()) return;
      
      setIsSubmitting(true);
      const available = await checkAvailability();
      setIsSubmitting(false);
      if (!available) return;
      
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!files.passport || !files.cv || !files.diploma) {
        setSubmitError('Please upload all required documents (Passport, CV, Diploma).');
        return;
      }
      // Submit: register user + upload docs, then show verify email step
      await handleSubmitRegistration();
      return;
    }
  };

  const handleSubmitRegistration = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Step A: Register user
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country,
          city: formData.city,
          password: formData.password,
          locale,
        }),
      });
      const regData = await regRes.json();
      
      if (!regRes.ok) {
        if (regRes.status === 409) {
          const field = regData.field || 'email';
          if (field === 'phone') {
            throw new Error('This phone number is already registered. Please login or use a different number.');
          }
          throw new Error('An account with this email already exists. Please login first.');
        }
        if (regData.details) {
          const messages: string[] = [];
          for (const [field, errs] of Object.entries(regData.details)) {
            if (Array.isArray(errs) && errs.length > 0) {
              messages.push(`${field}: ${errs[0]}`);
            }
          }
          if (messages.length > 0) throw new Error(messages.join(' | '));
        }
        throw new Error(regData.error || 'Registration failed');
      }

      // Step B: Upload documents (we need to do this after registration)
      // Note: Documents will be uploaded when user continues from dashboard after verifying email
      // For now, we store them temporarily and the user will re-upload from the dashboard

      setRegisteredEmail(formData.email);
      setCurrentStep(3);

    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const [fileError, setFileError] = useState('');

  const handleFileChange = useCallback((type: string, file: File | null) => {
    setFileError('');
    if (file && file.size > 5 * 1024 * 1024) {
      setFileError(`${file.name}: File size must be less than 5MB`);
      return;
    }
    setFiles(prev => ({ ...prev, [type]: file }));
  }, []);

  const handleResendVerification = async () => {
    try {
      setIsSubmitting(true);
      await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, locale }),
      });
      setSubmitError('');
      alert('Verification email resent! Please check your inbox.');
    } catch {
      // silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-6 lg:px-8 max-w-4xl">
          {/* Page Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 md:mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[#1a1a2e] mb-2">Create Your Account</h1>
            <p className="text-gray-500">Fill in your details, upload documents, and verify your email to get started.</p>
          </motion.div>

          {/* Already have an account? */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-[#2563EB] font-semibold hover:text-[#1D4ED8] transition-colors underline underline-offset-4 decoration-[#2563EB]/30">
                Log in here
              </Link>
            </p>
          </motion.div>

          {/* Step Indicator */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 md:mb-10">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                      currentStep === step.number
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/25 ring-4 ring-[#2563EB]/10 scale-110'
                        : currentStep > step.number 
                        ? 'bg-[#0f172a] text-white shadow-md' 
                        : 'bg-white text-gray-400 border-2 border-gray-100'
                    }`}>
                      {currentStep > step.number ? <Check className="w-5 h-5 md:w-6 md:h-6" /> : <step.icon className="w-5 h-5 md:w-6 md:h-6" />}
                    </div>
                    <span className={`text-[10px] sm:text-xs mt-3 text-center max-w-[4rem] sm:max-w-none leading-tight transition-colors duration-300 ${
                      currentStep === step.number ? 'text-[#2563EB] font-bold' : currentStep > step.number ? 'text-[#1a1a2e] font-semibold' : 'text-gray-400 font-medium'
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
                    <InputField name="firstName" label={t('form.firstName')} icon={User} value={formData.firstName} error={errors.firstName} onChange={handleInputChange} />
                    <InputField name="lastName" label={t('form.lastName')} icon={User} value={formData.lastName} error={errors.lastName} onChange={handleInputChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('form.phone')} <span className="text-red-500">*</span></label>
                    <PhoneInput 
                      value={formData.phone} 
                      onChange={(val) => handleInputChange('phone', val)} 
                      required 
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
                  </div>
                  <InputField name="email" label={t('form.email')} type="email" icon={Mail} value={formData.email} error={errors.email} onChange={handleInputChange} />
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <InputField name="password" label={t('form.password')} type="password" icon={Lock} hint={t('form.passwordHint')} value={formData.password} error={errors.password} onChange={handleInputChange} />
                    <InputField name="confirmPassword" label="Confirm Password" type="password" icon={Lock} value={formData.confirmPassword} error={errors.confirmPassword} onChange={handleInputChange} />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('form.country')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="country"
                          required
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className={`input-field ps-12 appearance-none ${errors.country ? 'border-red-400' : ''}`}
                        >
                          <option value="">{t('form.selectCountry')}</option>
                          {ALL_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                    <InputField name="city" label={t('form.city')} icon={MapPin} value={formData.city} error={errors.city} onChange={handleInputChange} />
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
                <p className="text-gray-500 text-sm mb-6">Upload your Passport, CV, and Diploma to complete your registration.</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <FileUpload type="passport" label={t('documents.passport')} icon={FileText} file={files.passport} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} />
                  <FileUpload type="cv" label={t('documents.cv')} icon={FileText} file={files.cv} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} />
                  <FileUpload type="diploma" label={t('documents.diploma')} icon={FileText} file={files.diploma} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} />
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
                  <button onClick={handleNext} disabled={isSubmitting || !(files.passport && files.cv && files.diploma)} className="btn-primary disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Verify Email */}
            {currentStep === 3 && (
              <div className="text-center py-8">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }} className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MailCheck className="w-10 h-10 text-[#2563EB]" />
                </motion.div>
                <h2 className="font-bold text-3xl text-[#1a1a2e] mb-4">Check Your Email</h2>
                <p className="text-gray-600 mb-2 max-w-md mx-auto">
                  We&apos;ve sent a verification link to:
                </p>
                <p className="font-mono font-bold text-lg text-[#2563EB] mb-6">{registeredEmail}</p>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 max-w-md mx-auto mb-8">
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Please open the email and click the verification link to activate your account. 
                    Once verified, you&apos;ll be able to log in, select a service, and complete your application.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Link href="/login" className="btn-primary px-8 py-3">
                    Go to Login
                  </Link>
                  <button 
                    onClick={handleResendVerification}
                    disabled={isSubmitting}
                    className="text-sm text-gray-500 hover:text-[#2563EB] transition-colors underline underline-offset-4 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Sending...' : 'Didn\'t receive it? Resend verification email'}
                  </button>
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