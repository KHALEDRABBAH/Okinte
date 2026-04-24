'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChatPanel from '@/components/ChatPanel';
import TestimonialForm from '@/components/TestimonialForm';
import PhoneInput from '@/components/PhoneInput';
import { 
  FileText, Clock, CheckCircle, XCircle, Eye, Upload,
  Plus, LogOut, User, AlertCircle, Loader2, MessageSquare, Trash2, RotateCcw, MessageCircle, Check,
  GraduationCap, Briefcase, Award, Palmtree, Building2, CreditCard, ArrowRight
} from 'lucide-react';

interface Application {
  id: string;
  referenceCode: string;
  status: string;
  createdAt: string;
  notes?: string;
  userResponse?: string;
  service: { key: string } | null;
  documents: { id: string; type: string; fileName: string }[];
  payment: { status: string; amount: number } | null;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  avatarUrl?: string;
}

export default function Dashboard() {
  const t = useTranslations('apply');
  const td = useTranslations('dashboard');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', phone: '', country: '', city: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'support'>('applications');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for inline response to RETURNED applications
  const [respondingAppId, setRespondingAppId] = useState<string | null>(null);
  const [responseComment, setResponseComment] = useState('');
  const [responseFiles, setResponseFiles] = useState<Record<string, File | null>>({});
  const [isResponding, setIsResponding] = useState(false);
  const [responseSuccess, setResponseSuccess] = useState<string | null>(null);

  // Continue Application flow (service selection + payment)
  const [selectedService, setSelectedService] = useState('');
  const [servicePrices, setServicePrices] = useState<Record<string, number>>({});
  const [isCreatingApp, setIsCreatingApp] = useState(false);
  const [appFlowError, setAppFlowError] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<{ valid: boolean; discount: number; finalPrice: number; code: string; type: string; value: number } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [continuingDraftId, setContinuingDraftId] = useState<string | null>(null);

  const handleRespondToReturn = async (appId: string) => {
    setIsResponding(true);
    setResponseSuccess(null);
    try {
      const formData = new FormData();
      formData.append('comment', responseComment);
      
      // Append any uploaded files
      for (const [type, file] of Object.entries(responseFiles)) {
        if (file) formData.append(type, file);
      }

      const res = await fetch(`/api/applications/${appId}/respond`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to submit response');

      // Update application in local state
      setApplications(prev => prev.map(app => 
        app.id === appId ? { ...app, status: 'SUBMITTED', userResponse: responseComment } : app
      ));
      
      setResponseSuccess('Your response has been submitted successfully!');
      setRespondingAppId(null);
      setResponseComment('');
      setResponseFiles({});
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit';
      alert(message);
    } finally {
      setIsResponding(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm('Are you sure you want to delete this draft application?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(prev => prev.filter(app => app.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete application', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push(`/${locale}/login`); return; }
        const meData = await meRes.json();
        setUser(meData.user);
        setEditForm({
          firstName: meData.user.firstName || '',
          lastName: meData.user.lastName || '',
          phone: meData.user.phone || '',
          country: meData.user.country || '',
          city: meData.user.city || '',
        });

        if (meData.user.role === 'ADMIN') { router.push(`/${locale}/admin`); return; }

        const appsRes = await fetch('/api/applications');
        const appsData = await appsRes.json();
        if (appsRes.ok) setApplications(appsData.applications);

        // Fetch service prices for continue application flow
        try {
          const svcRes = await fetch('/api/services');
          if (svcRes.ok) {
            const svcData = await svcRes.json();
            if (svcData.services) {
              const prices: Record<string, number> = {};
              svcData.services.forEach((svc: { key: string; price: number }) => {
                prices[svc.key] = Number(svc.price);
              });
              setServicePrices(prices);
            }
          }
        } catch {}
      } catch {
        router.push(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [locale, router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}/login`);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
      setIsEditingProfile(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save';
      console.error('Profile save error:', message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File must be less than 5MB');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);
      setUser(data.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      alert(`Avatar upload failed: ${message}`);
    } finally {
      setIsUploadingAvatar(false);
      // reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    DRAFT: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
    SUBMITTED: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    UNDER_REVIEW: { icon: Eye, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    RETURNED: { icon: RotateCcw, color: 'text-orange-600', bg: 'bg-orange-50' },
  };

  const serviceLabels: Record<string, string> = {
    study: td('study'),
    internship: td('internship'),
    scholarship: td('scholarship'),
    sabbatical: td('sabbatical'),
    employment: td('employment'),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
          <span className="text-sm text-gray-500">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">

          {/* Welcome header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="section-label text-sm mb-2">
                <User className="w-4 h-4" />
                {td('title')}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-[#1a1a2e]">
                {user ? `${user.firstName} ${user.lastName}` : 'Dashboard'}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
            {/* Actions removed from here since they are in the Header now */}
          </div>

          {/* Tabs Navigation */}
          <nav className="flex gap-2 mb-8 bg-white rounded-xl p-1.5 overflow-x-auto w-full md:w-fit border border-gray-200 shadow-sm">
            {[
              { id: 'applications', label: td('myApplications'), icon: <FileText className="w-4 h-4" /> },
              { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
              { id: 'support', label: 'Support Chat', icon: <MessageSquare className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0f172a] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Tab Content */}
          <div className="relative">
            {/* PROFILE TAB */}
            {activeTab === 'profile' && user && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm mb-8 border border-gray-100">
              <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative group">
                    <div 
                      className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-slate-100 flex items-center justify-center text-[#0f172a] font-bold text-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg border border-slate-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-6 h-6 animate-spin text-[#0f172a]" />
                      ) : user.avatarUrl ? (
                        <img 
                          src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bolila-documents/${user.avatarUrl}`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        <span className="group-hover:opacity-0 transition-opacity duration-300">{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-full">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <input type="file" hidden ref={fileInputRef} accept="image/*" onChange={handleAvatarSelect} />
                  </div>
                  
                  {/* User info */}
                  <div>
                    <h2 className="font-bold text-xl text-[#1a1a2e]">{user.firstName} {user.lastName}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3 flex-wrap justify-end">

                  {!isEditingProfile && (
                    <button 
                      onClick={() => setIsEditingProfile(true)} 
                      className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors bg-[#2563EB]/10 hover:bg-[#2563EB]/20 px-4 py-2 rounded-xl"
                    >
                      {td('editProfile')}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Profile details */}
              {isEditingProfile ? (
                <div className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">{t('form.firstName')}</label>
                      <input 
                        type="text" 
                        value={editForm.firstName} 
                        onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} 
                        className="input-field" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">{t('form.lastName')}</label>
                      <input 
                        type="text" 
                        value={editForm.lastName} 
                        onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} 
                        className="input-field" 
                      />
                    </div>
                    <div className="col-span-full md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-2">{td('phone')}</label>
                      <PhoneInput 
                        value={editForm.phone} 
                        onChange={val => setEditForm({ ...editForm, phone: val })} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">{td('country')}</label>
                      <input 
                        type="text" 
                        value={editForm.country} 
                        onChange={e => setEditForm({ ...editForm, country: e.target.value })} 
                        className="input-field" 
                        placeholder="e.g. France"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-2">{td('city')}</label>
                      <input 
                        type="text" 
                        value={editForm.city} 
                        onChange={e => setEditForm({ ...editForm, city: e.target.value })} 
                        className="input-field" 
                        placeholder="e.g. Paris"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-end pt-2">
                    <button 
                      onClick={() => setIsEditingProfile(false)} 
                      disabled={isSaving} 
                      className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
                    >
                      {td('cancel')}
                    </button>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={isSaving} 
                      className="btn-primary py-2.5 px-6 text-sm disabled:opacity-50"
                    >
                      {isSaving ? (
                        <><Loader2 className="w-4 h-4 me-2 animate-spin" /> {td('saving')}</>
                      ) : td('saveChanges')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">{td('phone')}</span>
                    <span className="font-medium text-[#1a1a2e] text-lg">{user.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">{td('country')}</span>
                    <span className="font-medium text-[#1a1a2e] text-lg">{user.country || '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">{td('city')}</span>
                    <span className="font-medium text-[#1a1a2e] text-lg">{user.city || '—'}</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* APPLICATIONS TAB */}
          {activeTab === 'applications' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e]">
                  {td('myApplications')} 
                  <span className="ml-3 text-lg font-normal text-gray-400">({applications.length})</span>
                </h2>
                <button
                  onClick={() => {
                    setShowAddService(!showAddService);
                    setSelectedService('');
                    setAppFlowError('');
                    setPromoCode('');
                    setPromoResult(null);
                    if (!showAddService) {
                      setTimeout(() => {
                        document.getElementById('add-service-section')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }
                  }}
                  className="btn-primary text-sm py-2.5 px-5"
                >
                  <Plus className="w-4 h-4 me-2" /> Add Service
                </button>
              </div>

            {/* Success notification */}
            {responseSuccess && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-sm font-medium text-emerald-800 flex-1">{responseSuccess}</p>
                <button onClick={() => setResponseSuccess(null)} className="text-emerald-500 hover:text-emerald-700 text-sm font-medium">Dismiss</button>
              </motion.div>
            )}

            {applications.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#2563EB]/5 flex items-center justify-center">
                    <ArrowRight className="w-8 h-8 text-[#2563EB]" />
                  </div>
                  <h3 className="font-heading font-bold text-2xl text-[#1a1a2e] mb-2">Continue Your Application</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Select the service you need and proceed to payment to submit your application.</p>
                </div>

                {/* Service Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[#1a1a2e] mb-4">Select Service *</label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'study', icon: GraduationCap, label: 'Study Abroad Placement' },
                      { id: 'internship', icon: Briefcase, label: 'International Internship Placement' },
                      { id: 'scholarship', icon: Award, label: 'Scholarship Search & Application' },
                      { id: 'sabbatical', icon: Palmtree, label: 'Sabbatical Professional Experience' },
                      { id: 'employment', icon: Building2, label: 'International Job Placement' },
                    ].map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => { setSelectedService(service.id); setAppFlowError(''); }}
                        className={`p-4 rounded-xl border-2 text-start transition-all duration-200 ${
                          selectedService === service.id 
                            ? 'border-[#0f172a] bg-slate-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <service.icon className={`w-6 h-6 mb-2 ${selectedService === service.id ? 'text-[#0f172a]' : 'text-gray-400'}`} />
                        <p className="font-semibold text-sm text-[#1a1a2e]">{service.label}</p>
                        {servicePrices[service.id] && (
                          <p className="text-xs text-gray-400 mt-1">${servicePrices[service.id].toFixed(2)}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                {selectedService && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-5">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-[#1a1a2e] mb-4">Order Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Service</span><span className="font-medium text-[#1a1a2e] capitalize">{selectedService.replace('_', ' ')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Processing Fee</span><span className="font-medium text-[#1a1a2e]">{servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span></div>
                        {promoResult && (
                          <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−${promoResult.discount.toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                          <span className="text-[#1a1a2e]">Total</span>
                          <span className="text-[#2563EB]">{promoResult ? `$${promoResult.finalPrice.toFixed(2)}` : servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span>
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
                                body: JSON.stringify({ code: promoCode, originalPrice: servicePrices[selectedService] }),
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
                          <span className="text-emerald-700 font-medium">✓ Code {promoResult.code} applied — {promoResult.type === 'PERCENTAGE' ? `${promoResult.value}%` : `$${promoResult.value}`} off</span>
                        </div>
                      )}
                    </div>

                    {/* Payment method */}
                    <div className="p-4 rounded-xl border-2 border-[#0f172a] bg-slate-50 shadow-sm flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#0f172a] flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-[#0f172a]" /></div>
                      <CreditCard className="w-5 h-5 text-[#0f172a]" />
                      <span className="font-medium text-[#1a1a2e]">Credit / Debit Card (Stripe)</span>
                    </div>

                    {appFlowError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                        {appFlowError}
                      </div>
                    )}

                    <button
                      onClick={async () => {
                        if (!selectedService) { setAppFlowError('Please select a service.'); return; }
                        setIsCreatingApp(true);
                        setAppFlowError('');
                        try {
                          // Create application
                          const appRes = await fetch('/api/applications', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ serviceKey: selectedService }),
                          });
                          const appData = await appRes.json();
                          if (!appRes.ok) throw new Error(appData.error || 'Failed to create application');
                          const newAppId = appData.application.id;

                          // Process payment
                          const checkoutRes = await fetch('/api/payments/checkout', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ applicationId: newAppId, promoCode: promoResult?.code || undefined }),
                          });
                          const checkoutData = await checkoutRes.json();

                          if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Payment service unavailable');

                          if (checkoutData.free) {
                            // Redirect to dashboard after free payment
                            window.location.reload();
                            return;
                          }

                          if (checkoutData.url) {
                            window.location.href = checkoutData.url;
                            return;
                          }

                          throw new Error('Payment could not be processed.');
                        } catch (err: any) {
                          setAppFlowError(err.message);
                        } finally {
                          setIsCreatingApp(false);
                        }
                      }}
                      disabled={isCreatingApp || !selectedService}
                      className="btn-primary w-full py-3.5 disabled:opacity-50 text-base"
                    >
                      {isCreatingApp ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Now & Submit <ArrowRight className="w-5 h-5 ms-2" /></>}
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const config = statusConfig[app.status] || statusConfig.DRAFT;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div 
                      key={app.id} 
                      className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm group hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                    >
                      <div className="flex items-start md:items-center justify-between gap-4">
                        {/* Left: Reference & Status */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-[#2563EB] text-lg">{app.referenceCode}</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{app.service ? (serviceLabels[app.service.key] || app.service.key) : <span className="text-amber-600 italic">No service selected</span>}</p>
                          <p className="text-gray-400 text-sm mt-1">
                            {td('applied')}: {new Date(app.createdAt).toLocaleDateString('en-GB', { 
                              day: 'numeric', 
                              month: 'short', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                        
                        {/* Right: Documents & Payment */}
                        <div className="text-right shrink-0">
                          <div className="text-sm text-gray-400 mb-2">
                            {app.documents.length}/4 {td('documents')}
                          </div>
                          <div className="text-sm">
                            {app.payment ? (
                              <span className={`font-medium ${
                                app.payment.status === 'SUCCEEDED' 
                                  ? 'text-green-600' 
                                  : 'text-yellow-600'
                              }`}>
                                ${Number(app.payment.amount)} — {app.payment.status}
                              </span>
                            ) : (
                              <span className="text-gray-400">{td('noPayment')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Admin Feedback — show for all statuses when notes exist */}
                      {app.notes && app.status !== 'REJECTED' && app.status !== 'RETURNED' && (
                        <div className="mt-4 pt-4 border-t border-blue-100 bg-blue-50/30 -mx-5 md:-mx-6 px-5 md:px-6 pb-4">
                          <div className="flex items-start gap-2">
                            <MessageCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                              <h4 className="text-sm font-semibold text-blue-800 mb-1">Admin Feedback</h4>
                              <p className="text-sm text-blue-700">{app.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rejection Details & Actions */}
                      {app.status === 'REJECTED' && (
                        <div className="mt-4 pt-4 border-t border-red-100 bg-red-50/50 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-2xl">
                          {app.notes && (
                            <div className="mb-4">
                              <div className="flex items-start gap-2">
                                <MessageCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="text-sm font-semibold text-red-800 mb-1">{td('rejectionReason')}</h4>
                                  <p className="text-sm text-red-700">{app.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <Link href={`/apply?service=${app.service?.key || ''}` as any} className="btn-primary text-sm py-2 px-4 shadow-sm">
                            <Plus className="w-4 h-4 me-2" /> {td('reapply')}
                          </Link>
                        </div>
                      )}

                      {/* Returned — inline response panel */}
                      {app.status === 'RETURNED' && (
                        <div className="mt-4 pt-4 border-t border-orange-200 bg-orange-50/50 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-2xl">
                          {app.notes && (
                            <div className="mb-4">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                                <div>
                                  <h4 className="text-sm font-semibold text-orange-800 mb-1">Action Required</h4>
                                  <p className="text-sm text-orange-700">{app.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {respondingAppId !== app.id ? (
                            <button 
                              onClick={() => { setRespondingAppId(app.id); setResponseComment(''); setResponseFiles({}); setResponseSuccess(null); }}
                              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-colors font-medium"
                            >
                              <RotateCcw className="w-4 h-4" /> Respond & Resubmit
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mt-2">
                              {/* Response comment */}
                              <div>
                                <label className="block text-sm font-medium text-orange-800 mb-2">Your Response</label>
                                <textarea
                                  rows={3}
                                  value={responseComment}
                                  onChange={(e) => setResponseComment(e.target.value)}
                                  placeholder="Describe the corrections you've made or provide additional details..."
                                  className="w-full px-4 py-3 rounded-xl border border-orange-200 bg-white text-[#1a1a2e] text-sm placeholder:text-gray-400 focus:border-orange-400 focus:ring-1 focus:ring-orange-300 focus:outline-none resize-none"
                                />
                              </div>

                              {/* Document upload slots */}
                              <div>
                                <label className="block text-sm font-medium text-orange-800 mb-2">Upload Replacement Documents (optional)</label>
                                <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { type: 'PASSPORT', label: 'Passport' },
                                    { type: 'CV', label: 'CV' },
                                    { type: 'DIPLOMA', label: 'Diploma' },
                                    { type: 'PAYMENT_RECEIPT', label: 'Payment Receipt' },
                                  ].map(doc => {
                                    const existingDoc = app.documents.find(d => d.type === doc.type);
                                    const newFile = responseFiles[doc.type];
                                    return (
                                      <label key={doc.type} className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center ${
                                        newFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-gray-200 hover:border-orange-300 bg-white/70'
                                      }`}>
                                        <input
                                          type="file"
                                          className="hidden"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={(e) => {
                                            const f = e.target.files?.[0] || null;
                                            if (f && f.size > 5 * 1024 * 1024) { alert('File must be less than 5MB'); return; }
                                            setResponseFiles(prev => ({ ...prev, [doc.type]: f }));
                                          }}
                                        />
                                        {newFile ? (
                                          <>
                                            <Check className="w-5 h-5 text-emerald-600" />
                                            <span className="text-xs text-emerald-700 font-medium truncate max-w-full">{newFile.name}</span>
                                          </>
                                        ) : (
                                          <>
                                            <Upload className="w-5 h-5 text-gray-400" />
                                            <span className="text-xs font-medium text-gray-600">{doc.label}</span>
                                            {existingDoc && <span className="text-[10px] text-gray-400">✓ Already uploaded</span>}
                                          </>
                                        )}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Action buttons */}
                              <div className="flex items-center gap-3 pt-1">
                                <button
                                  onClick={() => handleRespondToReturn(app.id)}
                                  disabled={isResponding || !responseComment.trim()}
                                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2.5 px-5 rounded-lg shadow-sm transition-colors font-medium disabled:opacity-50"
                                >
                                  {isResponding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                                  {isResponding ? 'Submitting...' : 'Submit Response'}
                                </button>
                                <button
                                  onClick={() => { setRespondingAppId(null); setResponseComment(''); setResponseFiles({}); }}
                                  disabled={isResponding}
                                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors px-3 py-2.5"
                                >
                                  Cancel
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* DRAFT: Continue Application — select service + pay */}
                      {app.status === 'DRAFT' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {continuingDraftId !== app.id ? (
                            <button
                              onClick={() => { setContinuingDraftId(app.id); setSelectedService(app.service?.key || ''); setAppFlowError(''); setPromoCode(''); setPromoResult(null); }}
                              className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 rounded-lg"
                            >
                              <ArrowRight className="w-4 h-4" /> Continue Application
                            </button>
                          ) : (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                              {/* Service Selection */}
                              <div>
                                <label className="block text-sm font-semibold text-[#1a1a2e] mb-3">Select Service *</label>
                                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {[
                                    { id: 'study', icon: GraduationCap, label: 'Study Abroad Placement' },
                                    { id: 'internship', icon: Briefcase, label: 'International Internship' },
                                    { id: 'scholarship', icon: Award, label: 'Scholarship Search' },
                                    { id: 'sabbatical', icon: Palmtree, label: 'Sabbatical Experience' },
                                    { id: 'employment', icon: Building2, label: 'Job Placement' },
                                  ].map((svc) => (
                                    <button key={svc.id} type="button" onClick={() => { setSelectedService(svc.id); setAppFlowError(''); }}
                                      className={`p-3 rounded-xl border-2 text-start transition-all duration-200 ${selectedService === svc.id ? 'border-[#0f172a] bg-slate-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                      <svc.icon className={`w-5 h-5 mb-1.5 ${selectedService === svc.id ? 'text-[#0f172a]' : 'text-gray-400'}`} />
                                      <p className="font-semibold text-xs text-[#1a1a2e]">{svc.label}</p>
                                      {servicePrices[svc.id] && <p className="text-[11px] text-gray-400 mt-0.5">${servicePrices[svc.id].toFixed(2)}</p>}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Order Summary + Payment */}
                              {selectedService && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                  <div className="bg-gray-50 rounded-xl p-5">
                                    <div className="flex justify-between text-sm mb-2"><span className="text-gray-600">Service</span><span className="font-medium capitalize">{selectedService}</span></div>
                                    <div className="flex justify-between text-sm"><span className="text-gray-600">Fee</span><span className="font-medium">{servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span></div>
                                    {promoResult && <div className="flex justify-between text-sm text-emerald-700 mt-1"><span>Discount</span><span>−${promoResult.discount.toFixed(2)}</span></div>}
                                    <div className="flex justify-between font-bold border-t border-gray-200 pt-2 mt-2"><span>Total</span><span className="text-[#2563EB]">{promoResult ? `$${promoResult.finalPrice.toFixed(2)}` : servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span></div>
                                  </div>

                                  {/* Promo */}
                                  <div className="flex gap-2">
                                    <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null); }} placeholder="Promo code" className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono" />
                                    <button type="button" onClick={async () => { if (!promoCode.trim()) return; setPromoLoading(true); setPromoError(''); try { const r = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: promoCode, originalPrice: servicePrices[selectedService] }) }); const d = await r.json(); if (r.ok && d.valid) setPromoResult(d); else { setPromoError(d.error || 'Invalid'); setPromoResult(null); } } catch { setPromoError('Failed'); } finally { setPromoLoading(false); } }} disabled={promoLoading || !promoCode.trim()} className="bg-[#0f172a] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">{promoLoading ? '...' : 'Apply'}</button>
                                  </div>
                                  {promoError && <p className="text-red-500 text-xs">{promoError}</p>}
                                  {promoResult && <p className="text-emerald-700 text-xs font-medium">✓ {promoResult.code} applied</p>}

                                  {appFlowError && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">{appFlowError}</div>}

                                  <div className="flex gap-3">
                                    <button onClick={() => setContinuingDraftId(null)} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
                                    <button
                                      onClick={async () => {
                                        setIsCreatingApp(true); setAppFlowError('');
                                        try {
                                          // Update the draft application's service
                                          await fetch(`/api/applications/${app.id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ serviceKey: selectedService }),
                                          });
                                          // Process payment
                                          const checkoutRes = await fetch('/api/payments/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId: app.id, promoCode: promoResult?.code || undefined }) });
                                          const checkoutData = await checkoutRes.json();
                                          if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Payment failed');
                                          if (checkoutData.free) { window.location.reload(); return; }
                                          if (checkoutData.url) { window.location.href = checkoutData.url; return; }
                                          throw new Error('Payment could not be processed.');
                                        } catch (err: any) { setAppFlowError(err.message); } finally { setIsCreatingApp(false); }
                                      }}
                                      disabled={isCreatingApp || !selectedService}
                                      className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-50"
                                    >
                                      {isCreatingApp ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Pay & Submit <ArrowRight className="w-4 h-4 ms-1" /></>}
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </motion.div>
                          )}
                        </div>
                      )}

                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Add Service Section (shown when user clicks Add Service button) */}
            {showAddService && applications.length > 0 && (
              <motion.div id="add-service-section" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 md:p-10 border border-gray-100 shadow-sm mt-6">
                <div className="text-center mb-8">
                  <h3 className="font-heading font-bold text-2xl text-[#1a1a2e] mb-2">Add New Service</h3>
                  <p className="text-gray-500 max-w-md mx-auto">Select a service and proceed to payment.</p>
                </div>

                {/* Service Selection */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-[#1a1a2e] mb-4">Select Service *</label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { id: 'study', icon: GraduationCap, label: 'Study Abroad Placement' },
                      { id: 'internship', icon: Briefcase, label: 'International Internship Placement' },
                      { id: 'scholarship', icon: Award, label: 'Scholarship Search & Application' },
                      { id: 'sabbatical', icon: Palmtree, label: 'Sabbatical Professional Experience' },
                      { id: 'employment', icon: Building2, label: 'International Job Placement' },
                    ].map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => { setSelectedService(service.id); setAppFlowError(''); }}
                        className={`p-4 rounded-xl border-2 text-start transition-all duration-200 ${
                          selectedService === service.id 
                            ? 'border-[#0f172a] bg-slate-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <service.icon className={`w-6 h-6 mb-2 ${selectedService === service.id ? 'text-[#0f172a]' : 'text-gray-400'}`} />
                        <p className="font-semibold text-sm text-[#1a1a2e]">{service.label}</p>
                        {servicePrices[service.id] && (
                          <p className="text-xs text-gray-400 mt-1">${servicePrices[service.id].toFixed(2)}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Summary */}
                {selectedService && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto space-y-5">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-[#1a1a2e] mb-4">Order Summary</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Service</span><span className="font-medium text-[#1a1a2e] capitalize">{selectedService.replace('_', ' ')}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Processing Fee</span><span className="font-medium text-[#1a1a2e]">{servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span></div>
                        {promoResult && (
                          <div className="flex justify-between text-emerald-700"><span>Discount</span><span>−${promoResult.discount.toFixed(2)}</span></div>
                        )}
                        <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3">
                          <span className="text-[#1a1a2e]">Total</span>
                          <span className="text-[#2563EB]">{promoResult ? `$${promoResult.finalPrice.toFixed(2)}` : servicePrices[selectedService] ? `$${servicePrices[selectedService].toFixed(2)}` : '...'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="bg-gray-50 rounded-xl p-5">
                      <label className="block text-sm font-medium text-[#1a1a2e] mb-3">Promo Code (optional)</label>
                      <div className="flex gap-2">
                        <input type="text" value={promoCode} onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoResult(null); }} placeholder="Enter code" className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 font-mono" />
                        <button type="button" onClick={async () => { if (!promoCode.trim()) return; setPromoLoading(true); setPromoError(''); try { const res = await fetch('/api/promo/validate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: promoCode, originalPrice: servicePrices[selectedService] }) }); const data = await res.json(); if (res.ok && data.valid) { setPromoResult(data); } else { setPromoError(data.error || 'Invalid promo code'); setPromoResult(null); } } catch { setPromoError('Failed to validate'); } finally { setPromoLoading(false); } }} disabled={promoLoading || !promoCode.trim()} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors">{promoLoading ? 'Checking...' : 'Apply'}</button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-2">{promoError}</p>}
                      {promoResult && <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm"><span className="text-emerald-700 font-medium">✓ Code {promoResult.code} applied</span></div>}
                    </div>

                    {/* Payment method */}
                    <div className="p-4 rounded-xl border-2 border-[#0f172a] bg-slate-50 shadow-sm flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border-2 border-[#0f172a] flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-[#0f172a]" /></div>
                      <CreditCard className="w-5 h-5 text-[#0f172a]" />
                      <span className="font-medium text-[#1a1a2e]">Credit / Debit Card (Stripe)</span>
                    </div>

                    {appFlowError && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">{appFlowError}</div>}

                    <div className="flex gap-3">
                      <button onClick={() => setShowAddService(false)} className="btn-secondary flex-1 py-3">Cancel</button>
                      <button
                        onClick={async () => {
                          if (!selectedService) { setAppFlowError('Please select a service.'); return; }
                          setIsCreatingApp(true); setAppFlowError('');
                          try {
                            const appRes = await fetch('/api/applications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serviceKey: selectedService }) });
                            const appData = await appRes.json();
                            if (!appRes.ok) throw new Error(appData.error || 'Failed to create application');
                            const newAppId = appData.application.id;
                            const checkoutRes = await fetch('/api/payments/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId: newAppId, promoCode: promoResult?.code || undefined }) });
                            const checkoutData = await checkoutRes.json();
                            if (!checkoutRes.ok) throw new Error(checkoutData.error || 'Payment service unavailable');
                            if (checkoutData.free) { window.location.reload(); return; }
                            if (checkoutData.url) { window.location.href = checkoutData.url; return; }
                            throw new Error('Payment could not be processed.');
                          } catch (err: any) { setAppFlowError(err.message); } finally { setIsCreatingApp(false); }
                        }}
                        disabled={isCreatingApp || !selectedService}
                        className="btn-primary flex-1 py-3 disabled:opacity-50"
                      >
                        {isCreatingApp ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Pay Now & Submit <ArrowRight className="w-5 h-5 ms-2" /></>}
                      </button>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            </motion.div>
          )}

          {/* SUPPORT CHAT TAB */}
          {activeTab === 'support' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
              <div className="mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-[#1a1a2e]">Support Chat</h2>
                <p className="text-gray-500 mt-1">Get in touch with our team for any assistance you need.</p>
              </div>
              <ChatPanel user={user || undefined} inline={true} />
            </motion.div>
          )}
          
          </div>
          
          {/* Keep floating chat widget ONLY when support tab is not active */}
          {activeTab !== 'support' && <ChatPanel user={user || undefined} inline={false} />}
        </div>
      </div>
      <Footer />
    </div>
  );
}