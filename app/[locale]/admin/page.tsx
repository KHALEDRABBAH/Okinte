'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, FileText, DollarSign, MessageSquare, 
  CheckCircle, Clock, XCircle, Eye, ChevronDown,
  ChevronUp, Shield, LogOut, BarChart3, AlertCircle
} from 'lucide-react';

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

interface User {
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

type Tab = 'overview' | 'applications' | 'users' | 'messages';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<Stats | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [adminUser, setAdminUser] = useState<any>(null);

  // Check admin auth on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (!data.user || data.user.role !== 'ADMIN') {
          router.push('/login');
        } else {
          setAdminUser(data.user);
        }
      })
      .catch(() => router.push('/login'));
  }, [router]);

  // Load data based on active tab
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
        } else if (activeTab === 'applications') {
          const url = statusFilter 
            ? `/api/admin/applications?status=${statusFilter}` 
            : '/api/admin/applications';
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
        }
      } catch (e: any) {
        setError(e.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeTab, statusFilter, adminUser]);

  const handleStatusUpdate = async (applicationId: string, status: string, notes?: string) => {
    try {
      const res = await fetch('/api/admin/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, status, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      // Refresh applications
      setApplications(prev => 
        prev.map(app => app.id === applicationId ? { ...app, status } : app)
      );
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-500/20 text-gray-300';
      case 'SUBMITTED': return 'bg-blue-500/20 text-blue-300';
      case 'UNDER_REVIEW': return 'bg-yellow-500/20 text-yellow-300';
      case 'APPROVED': return 'bg-emerald-500/20 text-emerald-300';
      case 'REJECTED': return 'bg-red-500/20 text-red-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const serviceLabel = (key: string) => {
    const labels: Record<string, string> = {
      study: '🎓 Study', internship: '💼 Internship', scholarship: '🏆 Scholarship',
      sabbatical: '✈️ Sabbatical', employment: '🔧 Employment',
    };
    return labels[key] || key;
  };

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[#d4a843] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      {/* Top Bar */}
      <header className="bg-[#0d1529] border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-[#d4a843]" />
            <h1 className="text-xl font-bold">Bolila Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm">{adminUser.email}</span>
            <button onClick={handleLogout} className="flex items-center gap-2 text-white/60 hover:text-red-400 transition-colors text-sm">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <nav className="flex gap-1 mb-8 bg-[#0d1529] rounded-xl p-1.5 w-fit">
          {(['overview', 'applications', 'users', 'messages'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-[#d4a843] text-[#0a0f1e] shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-[#d4a843] border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            {/* ========== OVERVIEW TAB ========== */}
            {activeTab === 'overview' && stats && (
              <div className="space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard icon={<Users />} label="Total Users" value={stats.totalUsers} color="blue" />
                  <StatCard icon={<FileText />} label="Applications" value={stats.totalApplications} color="purple" />
                  <StatCard icon={<DollarSign />} label="Revenue" value={`$${stats.totalRevenue}`} color="green" />
                  <StatCard icon={<MessageSquare />} label="Unread Messages" value={stats.unreadMessages} color="orange" />
                </div>

                {/* Status Breakdown */}
                <div className="bg-[#0d1529] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#d4a843]" /> Applications by Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(status => (
                      <div key={status} className="bg-white/5 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold">{stats.applicationsByStatus[status] || 0}</div>
                        <div className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${statusColor(status)}`}>
                          {status.replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Applications */}
                <div className="bg-[#0d1529] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-lg font-semibold mb-4">Recent Applications</h3>
                  {applications.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No applications yet</p>
                  ) : (
                    <ApplicationTable 
                      applications={applications} 
                      expandedApp={expandedApp}
                      setExpandedApp={setExpandedApp}
                      statusColor={statusColor}
                      serviceLabel={serviceLabel}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ========== APPLICATIONS TAB ========== */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                {/* Status Filter */}
                <div className="flex gap-2 flex-wrap">
                  <FilterButton label="All" active={!statusFilter} onClick={() => setStatusFilter('')} />
                  {['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'DRAFT'].map(s => (
                    <FilterButton key={s} label={s.replace('_', ' ')} active={statusFilter === s} onClick={() => setStatusFilter(s)} />
                  ))}
                </div>

                <div className="bg-[#0d1529] rounded-2xl p-6 border border-white/5">
                  {applications.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No applications found</p>
                  ) : (
                    <ApplicationTable 
                      applications={applications}
                      expandedApp={expandedApp}
                      setExpandedApp={setExpandedApp}
                      statusColor={statusColor}
                      serviceLabel={serviceLabel}
                      onStatusUpdate={handleStatusUpdate}
                    />
                  )}
                </div>
              </div>
            )}

            {/* ========== USERS TAB ========== */}
            {activeTab === 'users' && (
              <div className="bg-[#0d1529] rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Email</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Phone</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Country</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Apps</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-white/60">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map(user => (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-medium">{user.firstName} {user.lastName}</td>
                        <td className="px-6 py-4 text-white/70">{user.email}</td>
                        <td className="px-6 py-4 text-white/70">{user.phone}</td>
                        <td className="px-6 py-4 text-white/70">{user.country}</td>
                        <td className="px-6 py-4">
                          <span className="bg-[#d4a843]/20 text-[#d4a843] px-2 py-0.5 rounded-full text-sm">
                            {user._count.applications}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white/50 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-white/40 text-center py-8">No users registered yet</p>
                )}
              </div>
            )}

            {/* ========== MESSAGES TAB ========== */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <p className="text-white/40 text-center py-8 bg-[#0d1529] rounded-2xl">No messages yet</p>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`bg-[#0d1529] rounded-2xl p-6 border transition-all ${
                      msg.isRead ? 'border-white/5' : 'border-[#d4a843]/30 shadow-lg shadow-[#d4a843]/5'
                    }`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold">{msg.name}</span>
                            {!msg.isRead && (
                              <span className="bg-[#d4a843] text-[#0a0f1e] text-xs px-2 py-0.5 rounded-full font-bold">NEW</span>
                            )}
                          </div>
                          <p className="text-white/50 text-sm mb-3">{msg.email} {msg.phone && `· ${msg.phone}`}</p>
                          <p className="text-white/80 leading-relaxed">{msg.message}</p>
                          <p className="text-white/30 text-xs mt-3">{new Date(msg.createdAt).toLocaleString()}</p>
                        </div>
                        {!msg.isRead && (
                          <button
                            onClick={() => handleMarkRead(msg.id)}
                            className="bg-white/10 hover:bg-white/20 text-white/70 px-3 py-1.5 rounded-lg text-sm transition-colors"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/20',
    purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/20',
    green: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20',
    orange: 'from-orange-500/20 to-orange-600/5 border-orange-500/20',
  };
  const iconColors: Record<string, string> = {
    blue: 'text-blue-400', purple: 'text-purple-400', green: 'text-emerald-400', orange: 'text-orange-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-6`}>
      <div className={`${iconColors[color]} mb-3`}>{icon}</div>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-white/50 text-sm mt-1">{label}</div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-[#d4a843] text-[#0a0f1e]'
          : 'bg-white/5 text-white/60 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

function ApplicationTable({
  applications, expandedApp, setExpandedApp, statusColor, serviceLabel, onStatusUpdate,
}: {
  applications: Application[];
  expandedApp: string | null;
  setExpandedApp: (id: string | null) => void;
  statusColor: (s: string) => string;
  serviceLabel: (k: string) => string;
  onStatusUpdate: (id: string, status: string, notes?: string) => void;
}) {
  return (
    <div className="space-y-3">
      {applications.map(app => (
        <div key={app.id} className="bg-white/5 rounded-xl overflow-hidden">
          {/* Main Row */}
          <div
            className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[#d4a843] text-sm font-bold">{app.referenceCode}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(app.status)}`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>
              <div className="text-white/50 text-sm mt-1">
                {app.user.firstName} {app.user.lastName} · {app.user.email} · {app.user.country}
              </div>
            </div>
            <div className="text-sm text-white/50">{serviceLabel(app.service.key)}</div>
            <div className="text-sm text-white/40">{new Date(app.createdAt).toLocaleDateString()}</div>
            {expandedApp === app.id ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
          </div>

          {/* Expanded Details */}
          {expandedApp === app.id && (
            <div className="px-5 pb-5 border-t border-white/5 pt-4 space-y-4">
              {/* Documents */}
              <div>
                <h4 className="text-sm font-medium text-white/60 mb-2">Documents</h4>
                {app.documents.length === 0 ? (
                  <p className="text-white/30 text-sm">No documents uploaded</p>
                ) : (
                  <div className="flex gap-3 flex-wrap">
                    {app.documents.map(doc => (
                      <a
                        key={doc.id}
                        href={`/api/documents/${doc.id}`}
                        target="_blank"
                        className="bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" /> {doc.type}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Payment */}
              <div>
                <h4 className="text-sm font-medium text-white/60 mb-2">Payment</h4>
                {app.payment ? (
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    app.payment.status === 'SUCCEEDED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    ${Number(app.payment.amount)} — {app.payment.status}
                  </span>
                ) : (
                  <span className="text-white/30 text-sm">No payment recorded</span>
                )}
              </div>

              {/* Admin Actions */}
              {['SUBMITTED', 'UNDER_REVIEW'].includes(app.status) && (
                <div className="flex gap-3 pt-2">
                  {app.status === 'SUBMITTED' && (
                    <button
                      onClick={() => onStatusUpdate(app.id, 'UNDER_REVIEW')}
                      className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      <Clock className="w-4 h-4" /> Start Review
                    </button>
                  )}
                  <button
                    onClick={() => onStatusUpdate(app.id, 'APPROVED', 'Application approved by admin')}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => {
                      const notes = prompt('Rejection reason:');
                      if (notes) onStatusUpdate(app.id, 'REJECTED', notes);
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}

              {app.notes && (
                <div className="bg-white/5 rounded-lg p-3 text-sm text-white/70">
                  <span className="text-white/40">Notes:</span> {app.notes}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
