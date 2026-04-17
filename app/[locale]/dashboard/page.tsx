'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  FileText, Clock, CheckCircle, XCircle, Eye, 
  Plus, LogOut, User, AlertCircle, Loader2 
} from 'lucide-react';

interface Application {
  id: string;
  referenceCode: string;
  status: string;
  createdAt: string;
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
}

export default function Dashboard() {
  const t = useTranslations('apply');
  const locale = useLocale();
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check auth
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) { router.push(`/${locale}/login`); return; }
        const meData = await meRes.json();
        setUser(meData.user);

        // Redirect admin to admin dashboard
        if (meData.user.role === 'ADMIN') { router.push(`/${locale}/admin`); return; }

        // Load applications
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

  const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
    DRAFT: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-100' },
    SUBMITTED: { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
    UNDER_REVIEW: { icon: Eye, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    APPROVED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    REJECTED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  };

  const serviceLabels: Record<string, string> = {
    study: '🎓 Study Connection',
    internship: '💼 Internship Connection',
    scholarship: '🏆 Scholarship Connection',
    sabbatical: '✈️ Sabbatical Vacation',
    employment: '🔧 Employment Connection',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Header />
      <div className="pt-28 pb-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-5xl">

          {/* Welcome header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold text-primary">
                {user ? `${user.firstName} ${user.lastName}` : 'Dashboard'}
              </h1>
              <p className="text-gray-500 mt-1">{user?.email}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/apply" className="btn-primary text-sm">
                <Plus className="w-4 h-4 me-2" /> {t('title')}
              </Link>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                <LogOut className="w-4 h-4 me-2" /> Logout
              </button>
            </div>
          </div>

          {/* Profile card */}
          {user && (
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
              <h2 className="font-heading font-semibold text-lg text-primary mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-gold" /> Profile
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-gray-400 block">Phone</span><span className="font-medium">{user.phone}</span></div>
                <div><span className="text-gray-400 block">Country</span><span className="font-medium">{user.country}</span></div>
                <div><span className="text-gray-400 block">City</span><span className="font-medium">{user.city}</span></div>
              </div>
            </div>
          )}

          {/* Applications */}
          <div>
            <h2 className="font-heading font-semibold text-xl text-primary mb-4">
              My Applications ({applications.length})
            </h2>

            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                <FileText className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="font-heading font-semibold text-lg text-primary mb-2">No applications yet</h3>
                <p className="text-gray-500 mb-6">Start your international journey by applying for one of our services.</p>
                <Link href="/apply" className="btn-primary">
                  <Plus className="w-4 h-4 me-2" /> Apply Now
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map(app => {
                  const config = statusConfig[app.status] || statusConfig.DRAFT;
                  const StatusIcon = config.icon;
                  return (
                    <div key={app.id} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono font-bold text-gold">{app.referenceCode}</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-700 font-medium">{serviceLabels[app.service.key] || app.service.key}</p>
                          <p className="text-gray-400 text-sm mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400 mb-1">
                            {app.documents.length}/4 documents
                          </div>
                          <div className="text-sm">
                            {app.payment ? (
                              <span className={app.payment.status === 'SUCCEEDED' ? 'text-green-600' : 'text-yellow-600'}>
                                ${Number(app.payment.amount)} — {app.payment.status}
                              </span>
                            ) : (
                              <span className="text-gray-400">No payment</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
