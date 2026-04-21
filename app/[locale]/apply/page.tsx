'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { GraduationCap, Briefcase, Award, Palmtree, Building2, Upload, FileText, CreditCard, Check, ArrowRight, ArrowLeft, Loader2, User, Mail, Phone, MapPin, AlertCircle, Lock, CheckCircle2 } from 'lucide-react';
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

// ============================================================
// EXTRACTED COMPONENTS (outside main function to prevent re-render lag)
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
  return (
    <div>
      <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{label} <span className="text-red-500">*</span></label>
      <div className="relative">
        <Icon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type={type}
          name={name}
          required
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(name, e.target.value)}
          className={`input-field ps-12 ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''}`}
        />
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
  existingFileName?: string;
}

function FileUpload({ type, label, icon: Icon, file, onFileChange, uploadedLabel, formatsLabel, existingFileName }: FileUploadProps) {
  const hasFile = file || existingFileName;
  return (
    <div className={`relative overflow-hidden border-2 border-dashed rounded-xl p-5 text-center transition-all duration-200 group ${hasFile ? 'border-emerald-300 bg-emerald-50/30' : 'border-gray-200 hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5'}`}>
      <input type="file" id={type} onChange={(e) => onFileChange(type, e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept=".pdf,.jpg,.jpeg,.png" />
      <div className="space-y-3 relative z-0 pointer-events-none">
        {file ? (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-emerald-600" />
            </motion.div>
            <p className="text-emerald-600 font-semibold text-sm">{uploadedLabel}</p>
            <p className="text-xs text-gray-400 truncate max-w-[180px] mx-auto bg-gray-100 px-2 py-1 rounded">{file.name}</p>
          </>
        ) : existingFileName ? (
          <>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-emerald-600 font-semibold text-sm">✓ Already uploaded</p>
            <p className="text-xs text-gray-400 truncate max-w-[180px] mx-auto bg-gray-100 px-2 py-1 rounded">{existingFileName}</p>
            <p className="text-[10px] text-gray-400 mt-1">Click to replace</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-105 transition-transform duration-200">
              <Icon className="w-6 h-6 text-gray-400 group-hover:text-[#2563EB] transition-colors" />
            </div>
            <p className="font-semibold text-sm text-[#1a1a2e]">{label}</p>
            <p className="text-xs text-gray-500">Drag & drop or <span className="text-[#2563EB]">browse</span></p>
            <p className="text-[10px] text-gray-400 mt-2">{formatsLabel}</p>
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<{ firstName: string; lastName: string; email: string; phone: string; country: string; city: string } | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [existingDocs, setExistingDocs] = useState<Record<string, string>>({}); // type -> fileName

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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setIsLoggedIn(true);
            setLoggedInUser(data.user);
            setFormData(prev => ({
              ...prev,
              firstName: data.user.firstName || '',
              lastName: data.user.lastName || '',
              email: data.user.email || '',
              phone: data.user.phone || '',
              country: data.user.country || '',
              city: data.user.city || '',
            }));
          }
        }
      } catch {}
    };
    checkAuth();
  }, []);

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
      setSubmitError('Payment was canceled. Your application is saved as a draft. You can try again from your dashboard.');
      if (appIdParam) setApplicationId(appIdParam);
      return;
    }

    if (draftIdParam && !successParam) {
      fetch(`/api/applications/${draftIdParam}`)
        .then(res => res.json())
        .then(data => {
          if (data.application) {
            setApplicationId(data.application.id);
            setReferenceCode(data.application.referenceCode);
            setFormData(prev => ({ ...prev, service: data.application.service.key }));
            
            // Load existing documents so user doesn't re-upload
            if (data.application.documents && data.application.documents.length > 0) {
              const docs: Record<string, string> = {};
              data.application.documents.forEach((doc: { type: string; fileName: string }) => {
                const typeMap: Record<string, string> = { PASSPORT: 'passport', CV: 'cv', DIPLOMA: 'diploma', PAYMENT_RECEIPT: 'paymentReceipt' };
                const key = typeMap[doc.type];
                if (key) docs[key] = doc.fileName;
              });
              setExistingDocs(docs);
            }
            
            // If has all 4 documents, jump to payment step; otherwise documents
            if (data.application.documents?.length >= 4) {
              setCurrentStep(3);
            } else {
              setCurrentStep(2);
            }
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
          setSubmitError('Payment failed. Your application is saved as a draft. You can try again from your dashboard.');
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

  // Stable callback for input changes (prevents re-render)
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
    if (!isLoggedIn) {
      if (!formData.password) {
        newErrors.password = 'Required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Min 8 characters';
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Must contain at least one uppercase letter (A-Z)';
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Must contain at least one number (0-9)';
      }
    }
    if (!formData.country) newErrors.country = 'Required';
    if (!formData.city.trim()) newErrors.city = 'Required';
    if (formData.city.trim() && formData.city.trim().length < 2) newErrors.city = 'At least 2 characters';
    if (!formData.service) newErrors.service = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check duplicate email/phone before proceeding
  const checkAvailability = async (): Promise<boolean> => {
    if (isLoggedIn) return true; // Skip check for logged-in users
    
    try {
      const res = await fetch('/api/auth/check-availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), phone: formData.phone.trim() }),
      });
      const data = await res.json();
      
      if (!res.ok) return true; // If API fails, don't block the user
      
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
      return true; // Don't block on network errors
    }
  };

  const handleNext = async () => {
    setSubmitError('');

    if (currentStep === 1) {
      if (!validateStep1()) return;
      
      // Check duplicate email/phone
      setIsSubmitting(true);
      const available = await checkAvailability();
      setIsSubmitting(false);
      if (!available) return;
      
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      const hasPassport = files.passport || existingDocs.passport;
      const hasCv = files.cv || existingDocs.cv;
      const hasDiploma = files.diploma || existingDocs.diploma;
      const hasReceipt = files.paymentReceipt || existingDocs.paymentReceipt;
      if (!hasPassport || !hasCv || !hasDiploma || !hasReceipt) {
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
    setDraftSaved(false);

    try {
      // Step A: Register or verify login
      if (!isLoggedIn) {
        const meRes = await fetch('/api/auth/me');
        let loggedIn = meRes.ok;

        if (!loggedIn) {
          const regRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, country: formData.country, city: formData.city, password: formData.password }),
          });
          if (!regRes.ok) {
            const regData = await regRes.json();
            if (regRes.status === 409) {
              const field = regData.field || 'email';
              if (field === 'phone') {
                throw new Error('This phone number is already registered. Please login or use a different number.');
              }
              throw new Error('An account with this email already exists. Please login first.');
            }
            // Show specific validation errors
            if (regData.details) {
              const fieldErrors = regData.details;
              const messages: string[] = [];
              for (const [field, errs] of Object.entries(fieldErrors)) {
                if (Array.isArray(errs) && errs.length > 0) {
                  messages.push(`${field}: ${errs[0]}`);
                }
              }
              if (messages.length > 0) {
                throw new Error(messages.join(' | '));
              }
            }
            throw new Error(regData.error || 'Registration failed');
          }
          setIsLoggedIn(true);
        }
      }

      // Step B: Create application
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

      // Step C: Upload documents (only new files — skip already-uploaded ones)
      const typeMap: Record<string, string> = { PASSPORT: 'passport', CV: 'cv', DIPLOMA: 'diploma', PAYMENT_RECEIPT: 'paymentReceipt' };
      const fileEntries: [string, File | null][] = [['PASSPORT', files.passport], ['CV', files.cv], ['DIPLOMA', files.diploma], ['PAYMENT_RECEIPT', files.paymentReceipt]];
      for (const [type, file] of fileEntries) {
        if (file) {
          // Upload new file (replaces existing if any)
          const fd = new FormData();
          fd.append('file', file);
          fd.append('applicationId', newAppId);
          fd.append('type', type);

          const uploadRes = await fetch('/api/documents/upload', { method: 'POST', body: fd });
          if (!uploadRes.ok) {
            // Don't delete the application! Save as draft instead
            throw new Error(`Failed to upload ${type}. Your application has been saved as a draft. You can try again from your dashboard.`);
          }
          setUploadProgress(prev => ({ ...prev, [type]: true }));
        }
        // If no new file but existing doc exists, skip (already uploaded)
      }

      // Step D: Try payment — if it fails, save as draft (NEVER delete the application)
      try {
        const checkoutRes = await fetch('/api/payments/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ applicationId: newAppId, promoCode: promoResult?.code || undefined }),
        });
        
        const checkoutData = await checkoutRes.json();
        
        // Handle free payment ($0 after promo code)
        if (checkoutRes.ok && checkoutData.free) {
          setReferenceCode(checkoutData.referenceCode || referenceCode);
          setCurrentStep(4);
          setIsSubmitting(false);
          return;
        }
        
        if (!checkoutRes.ok) {
          // Payment failed — but DON'T delete the application!
          // Save as draft and let user continue later
          setDraftSaved(true);
          setSubmitError(`Payment service is currently unavailable. Your application has been saved as a draft (Ref: ${referenceCode || 'see dashboard'}). You can complete the payment later from your dashboard.`);
          setIsSubmitting(false);
          return;
        }

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }

        // No URL returned — payment service issue, save as draft
        setDraftSaved(true);
        setSubmitError(`Payment service is temporarily unavailable. Your application has been saved as a draft. You can complete the payment later from your dashboard.`);
      } catch (paymentErr) {
        // Network error or other — save as draft
        setDraftSaved(true);
        setSubmitError(`Payment service is temporarily unavailable. Your application has been saved as a draft. You can complete the payment later from your dashboard.`);
      }
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

          {/* Logged-in indicator */}
          {isLoggedIn && loggedInUser && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">
                  Logged in as <strong>{loggedInUser.firstName} {loggedInUser.lastName}</strong> ({loggedInUser.email})
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Your information has been pre-filled. Just pick a service, upload documents, and pay.</p>
              </div>
            </motion.div>
          )}

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

          {/* Payment Processing Overlay */}
          {isProcessingPayment && (
            <div className="bg-white rounded-2xl shadow-sm p-10 border border-gray-100 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#2563EB] mx-auto mb-4" />
              <h2 className="font-bold text-xl text-[#1a1a2e] mb-2">Processing Payment...</h2>
              <p className="text-gray-500">Please wait while we confirm your payment.</p>
            </div>
          )}

          {/* Step Content */}
          {!isProcessingPayment && (
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
                    <InputField name="firstName" label={t('form.firstName')} icon={User} value={formData.firstName} error={errors.firstName} onChange={handleInputChange} disabled={isLoggedIn} />
                    <InputField name="lastName" label={t('form.lastName')} icon={User} value={formData.lastName} error={errors.lastName} onChange={handleInputChange} disabled={isLoggedIn} />
                  </div>
                  <InputField name="phone" label={t('form.phone')} type="tel" icon={Phone} hint={t('form.phoneHint')} value={formData.phone} error={errors.phone} onChange={handleInputChange} disabled={isLoggedIn} />
                  <InputField name="email" label={t('form.email')} type="email" icon={Mail} value={formData.email} error={errors.email} onChange={handleInputChange} disabled={isLoggedIn} />
                  
                  {/* Only show password field for new users */}
                  {!isLoggedIn && (
                    <InputField name="password" label={t('form.password')} type="password" icon={Lock} hint={t('form.passwordHint')} value={formData.password} error={errors.password} onChange={handleInputChange} />
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-2">{t('form.country')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <select
                          name="country"
                          required
                          value={formData.country}
                          disabled={isLoggedIn}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className={`input-field ps-12 appearance-none ${isLoggedIn ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''} ${errors.country ? 'border-red-400' : ''}`}
                        >
                          <option value="">{t('form.selectCountry')}</option>
                          {ALL_COUNTRIES.map((c) => (<option key={c} value={c}>{c}</option>))}
                        </select>
                      </div>
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                    <InputField name="city" label={t('form.city')} icon={MapPin} value={formData.city} error={errors.city} onChange={handleInputChange} disabled={isLoggedIn} />
                  </div>

                  {/* Service selection */}
                  <div>
                    <label className="block text-sm font-medium text-[#1a1a2e] mb-3">{t('form.service')} <span className="text-red-500">*</span></label>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {services.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => handleInputChange('service', service.id)}
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
                  <FileUpload type="passport" label={t('documents.passport')} icon={FileText} file={files.passport} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} existingFileName={existingDocs.passport} />
                  <FileUpload type="cv" label={t('documents.cv')} icon={FileText} file={files.cv} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} existingFileName={existingDocs.cv} />
                  <FileUpload type="diploma" label={t('documents.diploma')} icon={FileText} file={files.diploma} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} existingFileName={existingDocs.diploma} />
                  <FileUpload type="paymentReceipt" label={t('documents.paymentReceipt')} icon={FileText} file={files.paymentReceipt} onFileChange={handleFileChange} uploadedLabel={t('documents.uploaded')} formatsLabel={t('documents.formats')} existingFileName={existingDocs.paymentReceipt} />
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
                  <button onClick={handleNext} disabled={isSubmitting || !(
                    (files.passport || existingDocs.passport) &&
                    (files.cv || existingDocs.cv) &&
                    (files.diploma || existingDocs.diploma) &&
                    (files.paymentReceipt || existingDocs.paymentReceipt)
                  )} className="btn-primary disabled:opacity-50">
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
                
                {submitError && (
                  <div className={`px-4 py-3 rounded-xl text-sm mt-5 ${draftSaved ? 'bg-amber-50 border border-amber-200 text-amber-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
                    {draftSaved && <p className="font-semibold mb-1">✓ Application Saved as Draft</p>}
                    {submitError}
                    {draftSaved && (
                      <Link href="/dashboard" className="inline-block mt-3 text-sm font-medium text-[#2563EB] underline">
                        Go to Dashboard →
                      </Link>
                    )}
                  </div>
                )}
                
                <div className="mt-8 flex flex-col sm:flex-row justify-between gap-3">
                  <button onClick={handleBack} className="btn-secondary"><ArrowLeft className="w-5 h-5 me-2 rtl:rotate-180" />{t('form.back')}</button>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={async () => {
                        // Save as draft — register + create app + upload docs, but skip payment
                        setIsSubmitting(true);
                        setSubmitError('');
                        try {
                          if (!isLoggedIn) {
                            const meRes = await fetch('/api/auth/me');
                            if (!meRes.ok) {
                              const regRes = await fetch('/api/auth/register', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ firstName: formData.firstName, lastName: formData.lastName, email: formData.email, phone: formData.phone, country: formData.country, city: formData.city, password: formData.password }),
                              });
                              if (!regRes.ok) {
                                const regData = await regRes.json();
                                throw new Error(regData.error || 'Registration failed');
                              }
                              setIsLoggedIn(true);
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
                          }
                          // Upload docs
                          const fileEntries: [string, File | null][] = [['PASSPORT', files.passport], ['CV', files.cv], ['DIPLOMA', files.diploma], ['PAYMENT_RECEIPT', files.paymentReceipt]];
                          for (const [type, file] of fileEntries) {
                            if (file) {
                              const fd = new FormData();
                              fd.append('file', file);
                              fd.append('applicationId', newAppId);
                              fd.append('type', type);
                              await fetch('/api/documents/upload', { method: 'POST', body: fd });
                            }
                          }
                          setDraftSaved(true);
                          setSubmitError('Your application has been saved as a draft. You can complete the payment later from your dashboard.');
                        } catch (err: any) {
                          setSubmitError(err.message);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }} 
                      disabled={isSubmitting}
                      className="btn-secondary text-sm whitespace-nowrap"
                    >
                      Save as Draft
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary min-w-[160px]">
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{t('payment.payNow')} <ArrowRight className="w-5 h-5 ms-2 rtl:rotate-180" /></>}
                    </button>
                  </div>
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
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}