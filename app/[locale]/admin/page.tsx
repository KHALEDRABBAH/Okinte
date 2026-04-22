'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { 
  Users, FileText, DollarSign, MessageSquare, 
  CheckCircle, Clock, XCircle, Eye, ChevronDown,
  ChevronUp, Shield, LogOut, BarChart3, AlertCircle,
  Search, Save, Edit3, Calendar, Download, Send,
  Plus, Trash2, ToggleLeft, ToggleRight, Settings,
  RotateCcw
} from 'lucide-react';
import ExpandableText from '@/components/ExpandableText';
import AdminCharts from '@/components/AdminCharts';

interface Stats {
  totalUsers: number;
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
  totalRevenue: number;
  totalPayments: number;
  unreadMessages: number;
}

interface Application {
  id: string;
  referenceCode: string;
  status: string;
  createdAt: string;
  notes: string | null;
  user: { firstName: string; lastName: string; email: string; country: string };
  service: { key: string };
  payment: { status: string; amount: number } | null;
  documents: { id: string; type: string; fileName: string }[];
}

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  role: string;
  createdAt: string;
  _count: { applications: number };
}

interface PromoCode {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

interface ServiceItem {
  id: string;
  key: string;
  price: number;
  isActive: boolean;
  _count: { applications: number };
}

interface ChatConversation {
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  messageCount: number;
  unreadCount: number;
  lastMessage: { content: string; isAdmin: boolean; createdAt: string } | null;
}

interface ChatMsg {
  id: string;
  content: string;
  isAdmin: boolean;
  createdAt: string;
}

interface MonthlyData {
  label: string;
  applications: number;
  revenue: number;
  users: number;
}

type Tab = 'overview' | 'applications' | 'users' | 'messages' | 'chat' | 'promo' | 'services';

export default function AdminDashboard() {
  const router = useRouter();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesText, setNotesText] = useState('');
  const [rejectingApp, setRejectingApp] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [returningApp, setReturningApp] = useState<string | null>(null);
  const [returnNote, setReturnNote] = useState('');

  // Chat state
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatUser, setSelectedChatUser] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Promo form
  const [promoForm, setPromoForm] = useState({ code: '', type: 'PERCENTAGE', value: '', maxUses: '', expiresAt: '' });
  const [promoCreating, setPromoCreating] = useState(false);

  // Service form
  const [serviceForm, setServiceForm] = useState({ key: '', price: '' });
  const [serviceCreating, setServiceCreating] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push(`/${locale}/login`);
        } else {
          setAdminUser(data.user);
        }
      })
      .catch(() => router.push(`/${locale}/login`));
  }, [router, locale]);

  useEffect(() => {
    if (!adminUser) return;
    setLoading(true);
    setError('');

    const load = async () => {
      try {
        if (activeTab === 'overview') {
          const res = await fetch('/api/admin/stats');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setStats(data.stats);
          setApplications(data.recentApplications || []);
          setMonthlyData(data.monthlyData || []);
        } else if (activeTab === 'applications') {
          const params = new URLSearchParams();
          if (statusFilter) params.set('status', statusFilter);
          if (searchQuery.trim()) params.set('search', searchQuery.trim());
          const qs = params.toString();
          const url = `/api/admin/applications${qs ? `?${qs}` : ''}`;
          const res = await fetch(url);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setApplications(data.applications);
        } else if (activeTab === 'users') {
          const res = await fetch('/api/admin/users');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setUsers(data.users);
        } else if (activeTab === 'messages') {
          const res = await fetch('/api/admin/messages');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setMessages(data.messages);
        } else if (activeTab === 'chat') {
          const res = await fetch('/api/admin/chat');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setConversations(data.conversations || []);
        } else if (activeTab === 'promo') {
          const res = await fetch('/api/admin/promo');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setPromoCodes(data.promoCodes || []);
        } else if (activeTab === 'services') {
          const res = await fetch('/api/admin/services');
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          setServices(data.services || []);
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeTab, statusFilter, searchQuery, adminUser]);

  // Load chat messages when user selected
  useEffect(() => {
    if (!selectedChatUser) return;
    const loadChat = async () => {
      const res = await fetch(`/api/admin/chat?userId=${selectedChatUser}`);
      const data = await res.json();
      if (res.ok) setChatMessages(data.messages || []);
    };
    loadChat();
    const interval = setInterval(loadChat, 5000);
    return () => clearInterval(interval);
  }, [selectedChatUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleStatusUpdate = async (applicationId: string, status: string, notes?: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status, notes: notes || app.notes } : app)
      );
      setRejectingApp(null);
      setRejectReason('');
      setReturningApp(null);
      setReturnNote('');
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleNotesUpdate = async (applicationId: string, notes: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setApplications(prev =>
        prev.map(app => app.id === applicationId ? { ...app, notes } : app)
      );
      setEditingNotes(null);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    }
  };

  const handleMarkRead = async (messageId: string) => {
    await fetch('/api/admin/messages', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, isRead: true }),
    });
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isRead: true } : m));
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !selectedChatUser || sendingChat) return;
    setSendingChat(true);
    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedChatUser, content: chatInput.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, data.message]);
        setChatInput('');
      }
    } catch {} finally {
      setSendingChat(false);
    }
  };

  const handleCreatePromo = async () => {
    if (!promoForm.code || !promoForm.value) return;
    setPromoCreating(true);
    try {
      const res = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoForm.code,
          type: promoForm.type,
          value: Number(promoForm.value),
          maxUses: promoForm.maxUses ? Number(promoForm.maxUses) : null,
          expiresAt: promoForm.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPromoCodes(prev => [data.promoCode, ...prev]);
      setPromoForm({ code: '', type: 'PERCENTAGE', value: '', maxUses: '', expiresAt: '' });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setPromoCreating(false);
    }
  };

  const handleTogglePromo = async (id: string, isActive: boolean) => {
    const res = await fetch('/api/admin/promo', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setPromoCodes(prev => prev.map(p => p.id === id ? { ...p, isActive: !isActive } : p));
    }
  };

  const handleDeletePromo = async (id: string) => {
    if (!confirm('Delete this promo code?')) return;
    const res = await fetch(`/api/admin/promo?id=${id}`, { method: 'DELETE' });
    if (res.ok) setPromoCodes(prev => prev.filter(p => p.id !== id));
  };

  const handleCreateService = async () => {
    if (!serviceForm.key || !serviceForm.price) return;
    setServiceCreating(true);
    try {
      const res = await fetch('/api/admin/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: serviceForm.key, price: Number(serviceForm.price) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setServices(prev => [...prev, data.service]);
      setServiceForm({ key: '', price: '' });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setServiceCreating(false);
    }
  };

  const handleToggleService = async (id: string, isActive: boolean) => {
    const res = await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s));
    }
  };

  const handleUpdateServicePrice = async (id: string, price: string) => {
    const res = await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, price: Number(price) }),
    });
    if (res.ok) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, price: Number(price) } : s));
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}/login`);
  };

  const handleExport = (type: string, format: string) => {
    window.open(`/api/admin/export?type=${type}&format=${format}`, '_blank');
  };

  const statusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT': return { bg: 'bg-gray-100', text: 'text-gray-700' };
      case 'SUBMITTED': return { bg: 'bg-blue-50', text: 'text-blue-700' };
      case 'UNDER_REVIEW': return { bg: 'bg-yellow-50', text: 'text-yellow-700' };
      case 'APPROVED': return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
      case 'REJECTED': return { bg: 'bg-red-50', text: 'text-red-700' };
      case 'RETURNED': return { bg: 'bg-orange-50', text: 'text-orange-700' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
  };

  const serviceLabels: Record<string, string> = {
    study: 'Study',
    internship: 'Internship',
    scholarship: 'Scholarship',
    sabbatical: 'Sabbatical',
    employment: 'Employment',
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'applications', label: 'Applications', icon: <FileText className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'promo', label: 'Promo', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'services', label: 'Services', icon: <Settings className="w-4 h-4" /> },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-[3px] border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
          <span className="text-sm text-gray-500">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1a1a2e]">
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Okinte Admin</h1>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-gray-500 text-sm hidden sm:block">{adminUser.email}</span>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-[#0f172a] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-[3px] border-[#2563EB]/20 border-t-[#2563EB] animate-spin" />
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && stats && (
              <div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={<Users className="w-6 h-6" />} label="Total Users" value={stats.totalUsers} color="blue" />
                  <StatCard icon={<FileText className="w-6 h-6" />} label="Applications" value={stats.totalApplications} color="purple" />
                  <StatCard icon={<DollarSign className="w-6 h-6" />} label="Revenue" value={`$${stats.totalRevenue}`} color="green" />
                  <StatCard icon={<MessageSquare className="w-6 h-6" />} label="Unread Messages" value={stats.unreadMessages} color="orange" />
                </div>

                {/* Charts */}
                <AdminCharts monthlyData={monthlyData} statusCounts={stats.applicationsByStatus} />

                {/* Recent Applications */}
                {applications.length > 0 && (
                  <div className="mt-6 bg-white rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Recent Applications</h3>
                    <div className="space-y-3">
                      {applications.slice(0, 5).map(app => {
                        const config = statusConfig(app.status);
                        return (
                          <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                            <div>
                              <span className="font-mono text-[#2563EB] text-sm font-bold">{app.referenceCode}</span>
                              <span className="text-gray-500 text-sm ml-3">{app.user.firstName} {app.user.lastName}</span>
                            </div>
                            <span className={`text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                              {app.status.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* APPLICATIONS TAB */}
            {activeTab === 'applications' && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, email, or reference..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                    />
                  </div>
                  <button onClick={() => handleExport('applications', 'csv')} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button onClick={() => handleExport('applications', 'xlsx')} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <FilterButton label="All" active={!statusFilter} onClick={() => setStatusFilter('')} />
                  {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'DRAFT'].map(s => (
                    <FilterButton key={s} label={s.replace('_', ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
                  ))}
                </div>

                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  {applications.length === 0 ? (
                    <p className="text-gray-400 text-center py-10">No applications found</p>
                  ) : (
                    <div className="space-y-3">
                      {applications.map(app => {
                        const config = statusConfig(app.status);
                        const isExpanded = expandedApp === app.id;
                        return (
                          <div key={app.id} className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-[2px] transition-all duration-300">
                            <div
                              className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                              onClick={() => setExpandedApp(isExpanded ? null : app.id)}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3">
                                  <span className="font-mono text-[#2563EB] text-sm font-bold">{app.referenceCode}</span>
                                  <span className={`text-xs px-2.5 py-1 rounded-full ${config.bg} ${config.text}`}>
                                    {app.status.replace('_', ' ')}
                                  </span>
                                </div>
                                <div className="text-gray-500 text-sm mt-1.5">
                                  {app.user.firstName} {app.user.lastName} · {app.user.email} · {app.user.country}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 hidden sm:block">{serviceLabels[app.service.key] || app.service.key}</div>
                              <div className="text-sm text-gray-400 hidden md:block">{new Date(app.createdAt).toLocaleDateString()}</div>
                              {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />}
                            </div>

                            {isExpanded && (
                              <div className="px-5 pb-5 border-t border-gray-200 pt-4 space-y-5">
                                {/* Documents with View/Download */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-600 mb-3">Documents</h4>
                                  {app.documents.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No documents uploaded</p>
                                  ) : (
                                    <div className="flex gap-3 flex-wrap">
                                      {app.documents.map(doc => (
                                        <a
                                          key={doc.id}
                                          href={`/api/documents/${doc.id}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="bg-white hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors border border-gray-200 hover:border-blue-300"
                                        >
                                          <Eye className="w-4 h-4 text-blue-600" />
                                          <span className="font-medium">{doc.type}</span>
                                          <span className="text-gray-400 text-xs">({doc.fileName})</span>
                                        </a>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Payment */}
                                <div>
                                  <h4 className="text-sm font-medium text-gray-600 mb-3">Payment</h4>
                                  {app.payment ? (
                                    <span className={`text-sm px-4 py-1.5 rounded-full inline-block ${
                                      app.payment.status === 'SUCCEEDED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                      ${Number(app.payment.amount)} — {app.payment.status}
                                    </span>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No payment recorded</span>
                                  )}
                                </div>

                                {/* Admin Actions */}
                                {['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && (
                                  <div className="space-y-3 pt-2">
                                    <div className="flex gap-3 flex-wrap">
                                      {app.status === 'SUBMITTED' && (
                                        <button onClick={() => handleStatusUpdate(app.id, 'UNDER_REVIEW')} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                          <Clock className="w-4 h-4" /> Start Review
                                        </button>
                                      )}
                                      <button onClick={() => handleStatusUpdate(app.id, 'APPROVED', 'Application approved by admin')} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                        <CheckCircle className="w-4 h-4" /> Approve
                                      </button>
                                      <button onClick={() => { setReturningApp(returningApp === app.id ? null : app.id); setReturnNote(''); }} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                        <RotateCcw className="w-4 h-4" /> Return
                                      </button>
                                      <button onClick={() => { setRejectingApp(rejectingApp === app.id ? null : app.id); setRejectReason(''); }} className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                                        <XCircle className="w-4 h-4" /> Reject
                                      </button>
                                    </div>

                                    {/* Return Note */}
                                    {returningApp === app.id && (
                                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                                        <label className="text-sm font-medium text-orange-700">Return Note (explain what needs correction):</label>
                                        <textarea value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="e.g. Passport scan is unclear, please re-upload a higher quality scan..." rows={3} className="w-full px-3 py-2 rounded-lg border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none" />
                                        <div className="flex gap-2">
                                          <button onClick={() => { if (returnNote.trim()) handleStatusUpdate(app.id, 'RETURNED', returnNote.trim()); }} disabled={!returnNote.trim()} className="bg-orange-600 hover:bg-orange-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Confirm Return</button>
                                          <button onClick={() => { setReturningApp(null); setReturnNote(''); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                                        </div>
                                      </div>
                                    )}

                                    {/* Reject Reason */}
                                    {rejectingApp === app.id && (
                                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                                        <label className="text-sm font-medium text-red-700">Rejection Reason:</label>
                                        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why..." rows={3} className="w-full px-3 py-2 rounded-lg border border-red-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-300 resize-none" />
                                        <div className="flex gap-2">
                                          <button onClick={() => { if (rejectReason.trim()) handleStatusUpdate(app.id, 'REJECTED', rejectReason.trim()); }} disabled={!rejectReason.trim()} className="bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Confirm Rejection</button>
                                          <button onClick={() => { setRejectingApp(null); setRejectReason(''); }} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors">Cancel</button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Notes */}
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-500">Admin Notes</span>
                                    {editingNotes !== app.id ? (
                                      <button onClick={() => { setEditingNotes(app.id); setNotesText(app.notes || ''); }} className="text-xs text-[#0f172a] hover:text-black flex items-center gap-1 transition-colors">
                                        <Edit3 className="w-3 h-3" /> Edit
                                      </button>
                                    ) : (
                                      <div className="flex gap-2">
                                        <button onClick={() => handleNotesUpdate(app.id, notesText)} className="text-xs bg-[#0f172a] text-white px-3 py-1 rounded-lg flex items-center gap-1">
                                          <Save className="w-3 h-3" /> Save
                                        </button>
                                        <button onClick={() => setEditingNotes(null)} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">Cancel</button>
                                      </div>
                                    )}
                                  </div>
                                  {editingNotes === app.id ? (
                                    <textarea value={notesText} onChange={(e) => setNotesText(e.target.value)} placeholder="Add admin notes..." rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none resize-none" />
                                  ) : (
                                    <p className="text-sm text-gray-700">{app.notes || <span className="text-gray-400 italic">No notes yet</span>}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="space-y-4">
                <div className="flex justify-end gap-3">
                  <button onClick={() => handleExport('users', 'csv')} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" /> CSV
                  </button>
                  <button onClick={() => handleExport('users', 'xlsx')} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50">
                    <Download className="w-4 h-4" /> Excel
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600">Name</th>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600">Email</th>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600 hidden md:table-cell">Phone</th>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600">Country</th>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600">Apps</th>
                          <th className="text-left px-5 py-4 text-sm font-medium text-gray-600 hidden lg:table-cell">Joined</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-medium">{user.firstName} {user.lastName}</td>
                            <td className="px-5 py-4 text-gray-600">{user.email}</td>
                            <td className="px-5 py-4 text-gray-600 hidden md:table-cell">{user.phone}</td>
                            <td className="px-5 py-4 text-gray-600">{user.country}</td>
                            <td className="px-5 py-4">
                              <span className="bg-[#0f172a]/10 text-[#0f172a] px-2.5 py-1 rounded-full text-sm font-medium">{user._count.applications}</span>
                            </td>
                            <td className="px-5 py-4 text-gray-400 text-sm hidden lg:table-cell">{new Date(user.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {users.length === 0 && <p className="text-gray-400 text-center py-10">No users registered yet</p>}
                </div>
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                    <p className="text-gray-500">Messages from the contact form will appear here.</p>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`bg-white rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 ${msg.isRead ? 'border-gray-100 shadow-sm hover:shadow-md' : 'border-[#2563EB]/30 shadow-lg'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-lg">{msg.name}</span>
                            {!msg.isRead && <span className="bg-[#2563EB] text-white text-xs px-2.5 py-0.5 rounded-full font-bold">NEW</span>}
                          </div>
                          <p className="text-gray-500 text-sm mb-3">{msg.email} {msg.phone && `· ${msg.phone}`}</p>
                          <ExpandableText text={msg.message} maxLength={200} className="text-gray-700 leading-relaxed" />
                          <p className="text-gray-400 text-xs mt-3">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        {!msg.isRead && (
                          <button onClick={() => handleMarkRead(msg.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors shrink-0">Mark Read</button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden flex" style={{ height: '600px' }}>
                {/* Conversation List */}
                <div className="w-80 border-r border-gray-200 flex flex-col">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-sm text-gray-600">Conversations</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-10">No conversations yet</p>
                    ) : (
                      conversations.map(conv => (
                        <button
                          key={conv.userId}
                          onClick={() => setSelectedChatUser(conv.userId)}
                          className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedChatUser === conv.userId ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{conv.user?.firstName} {conv.user?.lastName}</span>
                            {conv.unreadCount > 0 && (
                              <span className="bg-[#2563EB] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{conv.unreadCount}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 truncate">{conv.lastMessage?.content || 'No messages'}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {!selectedChatUser ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                        {chatMessages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl p-3 text-sm ${msg.isAdmin ? 'bg-[#0f172a] text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'}`}>
                              <p>{msg.content}</p>
                              <span className={`text-[10px] mt-1 block text-end ${msg.isAdmin ? 'text-white/50' : 'text-gray-400'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="p-3 border-t bg-white flex gap-2">
                        <input
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                          placeholder="Reply to user..."
                          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                        />
                        <button onClick={handleSendChat} disabled={!chatInput.trim() || sendingChat} className="bg-[#0f172a] text-white px-4 py-2.5 rounded-xl hover:bg-black disabled:opacity-50 transition-colors">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* PROMO CODES TAB */}
            {activeTab === 'promo' && (
              <div className="space-y-6">
                {/* Create Form */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-semibold mb-4">Create Promo Code</h3>
                  <div className="grid md:grid-cols-5 gap-4">
                    <input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} placeholder="CODE" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                    <select value={promoForm.type} onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })} className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                      <option value="PERCENTAGE">Percentage %</option>
                      <option value="FIXED">Fixed $</option>
                    </select>
                    <input value={promoForm.value} onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })} placeholder="Value" type="number" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                    <input value={promoForm.maxUses} onChange={(e) => setPromoForm({ ...promoForm, maxUses: e.target.value })} placeholder="Max uses (optional)" type="number" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                    <input value={promoForm.expiresAt} onChange={(e) => setPromoForm({ ...promoForm, expiresAt: e.target.value })} type="date" className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                  </div>
                  <button onClick={handleCreatePromo} disabled={promoCreating || !promoForm.code || !promoForm.value} className="mt-4 bg-[#0f172a] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Create Code
                  </button>
                </div>

                {/* List */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Code</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Type</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Value</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Uses</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Expires</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {promoCodes.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-mono font-bold text-sm">{p.code}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{p.type === 'PERCENTAGE' ? '%' : '$'}</td>
                          <td className="px-5 py-3 text-sm font-medium">{p.type === 'PERCENTAGE' ? `${p.value}%` : `$${p.value}`}</td>
                          <td className="px-5 py-3 text-sm text-gray-600">{p.currentUses}{p.maxUses ? ` / ${p.maxUses}` : ' / ∞'}</td>
                          <td className="px-5 py-3 text-sm text-gray-400">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : 'Never'}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {p.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleTogglePromo(p.id, p.isActive)} className="text-gray-400 hover:text-gray-700 transition-colors">
                                {p.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                              </button>
                              <button onClick={() => handleDeletePromo(p.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {promoCodes.length === 0 && <p className="text-gray-400 text-center py-10">No promo codes created yet</p>}
                </div>
              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="font-semibold mb-4">Create New Service</h3>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="text-sm text-gray-500 mb-1 block">Service Key</label>
                      <input value={serviceForm.key} onChange={(e) => setServiceForm({ ...serviceForm, key: e.target.value })} placeholder="e.g. language_course" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                    </div>
                    <div className="w-32">
                      <label className="text-sm text-gray-500 mb-1 block">Price ($)</label>
                      <input value={serviceForm.price} onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} type="number" placeholder="150" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20" />
                    </div>
                    <button onClick={handleCreateService} disabled={serviceCreating || !serviceForm.key || !serviceForm.price} className="bg-[#0f172a] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-black disabled:opacity-50 transition-colors flex items-center gap-2 shrink-0">
                      <Plus className="w-4 h-4" /> Create
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Service Key</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Price</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Applications</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Status</th>
                        <th className="text-left px-5 py-3 text-sm font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {services.map(s => (
                        <tr key={s.id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 font-medium text-sm">{s.key}</td>
                          <td className="px-5 py-3 text-sm">
                            <input
                              type="number"
                              defaultValue={Number(s.price)}
                              onBlur={(e) => {
                                if (Number(e.target.value) !== Number(s.price)) {
                                  handleUpdateServicePrice(s.id, e.target.value);
                                }
                              }}
                              className="w-24 px-2 py-1 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                            />
                          </td>
                          <td className="px-5 py-3 text-sm text-gray-600">{s._count?.applications || 0}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                              {s.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => handleToggleService(s.id, s.isActive)} className="text-gray-400 hover:text-gray-700 transition-colors">
                              {s.isActive ? <ToggleRight className="w-5 h-5 text-emerald-500" /> : <ToggleLeft className="w-5 h-5" />}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {services.length === 0 && <p className="text-gray-400 text-center py-10">No services found</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// SUB-COMPONENTS

function StatCard({ icon, label, value, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  color: string; 
}) {
  const colors: Record<string, string> = {
    blue: 'from-blue-50 to-blue-100 border-blue-200',
    purple: 'from-purple-50 to-purple-100 border-purple-200',
    green: 'from-emerald-50 to-emerald-100 border-emerald-200',
    orange: 'from-orange-50 to-orange-100 border-orange-200',
  };
  const iconColors: Record<string, string> = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    green: 'text-emerald-600',
    orange: 'text-orange-600',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 hover:scale-[1.02] transition-transform`}
    >
      <div className={`${iconColors[color]} mb-3`}>{icon}</div>
      <div className="text-2xl font-bold text-[#1a1a2e]">{value}</div>
      <div className="text-gray-600 text-sm mt-1">{label}</div>
    </motion.div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
        active
          ? 'bg-[#0f172a] text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );
}