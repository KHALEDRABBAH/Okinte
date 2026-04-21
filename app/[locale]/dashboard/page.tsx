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
  FileText, Clock, CheckCircle, XCircle, Eye, 
  Plus, LogOut, User, AlertCircle, Loader2, MessageSquare, Trash2, RotateCcw 
} from 'lucide-react';

interface Application {
  id: string;
  referenceCode: string;
  status: string;
  createdAt: string;
  notes?: string;
  service: { key: string };
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
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/apply" className="btn-primary text-sm">
                <Plus className="w-4 h-4 me-2" /> {t('title')}
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm bg-gray-100 hover:bg-gray-200">
                <LogOut className="w-4 h-4 me-2" /> {td('logout')}
              </button>
            </div>
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
                  <TestimonialForm />
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
              </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-lg text-[#1a1a2e] mb-2">{td('noApplications')}</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">{td('noApplicationsText')}</p>
                <Link href="/apply" className="btn-primary">
                  <Plus className="w-4 h-4 me-2" /> {td('applyNow')}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app, index) => {
                  const config = statusConfig[app.status] || statusConfig.DRAFT;
                  const StatusIcon = config.icon;
                  return (
                    <motion.div 
                      key={app.id} 
                      className="bg-white rounded-2xl p-5 md:p-6 border border-gray-100 group hover:shadow-md transition-all"
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
                          <p className="text-gray-700 font-medium">{serviceLabels[app.service.key] || app.service.key}</p>
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
                      
                      {/* Rejection Details & Actions */}
                      {app.status === 'REJECTED' && (
                        <div className="mt-4 pt-4 border-t border-red-100 bg-red-50/50 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-2xl">
                          {app.notes && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-red-800 mb-1">{td('rejectionReason')}</h4>
                              <p className="text-sm text-red-700">{app.notes}</p>
                            </div>
                          )}
                          <Link href={`/apply?service=${app.service.key}` as any} className="btn-primary text-sm py-2 px-4 shadow-sm">
                            <Plus className="w-4 h-4 me-2" /> {td('reapply')}
                          </Link>
                        </div>
                      )}

                      {/* Returned — needs completion */}
                      {app.status === 'RETURNED' && (
                        <div className="mt-4 pt-4 border-t border-orange-200 bg-orange-50/50 -mx-5 md:-mx-6 -mb-5 md:-mb-6 p-5 md:p-6 rounded-b-2xl">
                          {app.notes && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-orange-800 mb-1 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> Action Required
                              </h4>
                              <p className="text-sm text-orange-700">{app.notes}</p>
                            </div>
                          )}
                          <Link href={`/apply?draftId=${app.id}` as any} className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-sm py-2 px-4 rounded-lg shadow-sm transition-colors font-medium">
                            <RotateCcw className="w-4 h-4" /> Complete Application
                          </Link>
                        </div>
                      )}
                      
                      {/* Draft Action */}
                      {app.status === 'DRAFT' && (
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                          <Link href={`/apply?draftId=${app.id}` as any} className="text-sm font-medium text-[#2563EB] hover:text-[#1D4ED8] transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-[#2563EB]/5 hover:bg-[#2563EB]/10 rounded-lg">
                            <Plus className="w-4 h-4" /> Continue Application
                          </Link>
                          <button onClick={() => handleDeleteDraft(app.id)} className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-3 py-1.5">
                            <Trash2 className="w-4 h-4" /> Delete Draft
                          </button>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
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