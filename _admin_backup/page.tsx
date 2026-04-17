'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Header from '@/components/Header';
import {
  Users, FileText, DollarSign, MessageSquare, Settings, LogOut,
  TrendingUp, Briefcase, Eye, Check, X, Search, Filter, MoreVertical,
  UserPlus, Bell, ChevronLeft, ChevronRight, Download
} from 'lucide-react';

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: t('totalUsers'), value: '2,847', change: '+12%', icon: Users, color: 'bg-blue-500' },
    { label: t('pendingApplications'), value: '156', change: '-5%', icon: Briefcase, color: 'bg-amber-500' },
    { label: t('totalRevenue'), value: '$128,450', change: '+23%', icon: DollarSign, color: 'bg-green-500' },
    { label: t('successRate'), value: '94%', change: '+3%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const recentApplications = [
    { id: '1', name: 'Ahmed Hassan', email: 'ahmed@example.com', service: 'Study Connection', status: 'underReview', date: '2026-04-15' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', service: 'Scholarship', status: 'approved', date: '2026-04-14' },
    { id: '3', name: 'Mohamed Ali', email: 'mohamed@example.com', service: 'Employment', status: 'submitted', date: '2026-04-13' },
    { id: '4', name: 'Fatima Zahra', email: 'fatima@example.com', service: 'Internship', status: 'approved', date: '2026-04-12' },
    { id: '5', name: 'John Smith', email: 'john@example.com', service: 'Study Connection', status: 'submitted', date: '2026-04-11' },
  ];

  const messages = [
    { id: '1', name: 'Ahmed Hassan', email: 'ahmed@example.com', subject: 'Application Status', preview: 'I wanted to check the status of my application...', time: '2 hours ago', unread: true },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', subject: 'Document Query', preview: 'I have a question about the required documents...', time: '5 hours ago', unread: true },
    { id: '3', name: 'Mohamed Ali', email: 'mohamed@example.com', subject: 'Payment Issue', preview: 'I encountered an issue with my payment...', time: '1 day ago', unread: false },
  ];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-600',
    underReview: 'bg-amber-100 text-amber-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
  };

  const sidebarItems = [
    { id: 'overview', icon: TrendingUp, label: 'Overview' },
    { id: 'users', icon: Users, label: t('users') },
    { id: 'applications', icon: FileText, label: t('applications') },
    { id: 'payments', icon: DollarSign, label: t('payments') },
    { id: 'messages', icon: MessageSquare, label: t('messages') },
    { id: 'settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-primary text-white sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6 text-gold">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="2" />
                  <ellipse cx="20" cy="20" rx="8" ry="16" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="4" y1="20" x2="36" y2="20" stroke="currentColor" strokeWidth="2" />
                  <circle cx="20" cy="12" r="3" fill="currentColor" />
                </svg>
              </div>
              <span className="font-heading font-bold text-xl">Bolila Admin</span>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
                  <span className="font-bold text-primary">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="font-medium text-sm">Admin User</p>
                  <p className="text-xs text-white/60">admin@bolila.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] sticky top-16">
          <nav className="p-4 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gold text-primary'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
<span className="font-medium">{item.label}</span>
              </button>
            ))}
            <hr className="my-4" />
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-heading font-bold text-2xl text-primary mb-6">Dashboard Overview</h1>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Applications */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-heading font-semibold text-lg text-primary">Recent Applications</h2>
                  <button onClick={() => setActiveTab('applications')} className="text-gold text-sm font-medium hover:underline">
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 font-medium">Name</th>
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.slice(0, 5).map((app) => (
                        <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="py-4">
                            <div>
                              <p className="font-medium text-primary">{app.name}</p>
                              <p className="text-sm text-gray-500">{app.email}</p>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{app.service}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status as keyof typeof statusColors]}`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="py-4 text-sm text-gray-500">{app.date}</td>
                          <td className="py-4">
                            <div className="flex gap-2">
                              <button className="p-2 hover:bg-gray-100 rounded-lg">
                                <Eye className="w-4 h-4 text-gray-500" />
                              </button>
                              <button className="p-2 hover:bg-green-50 rounded-lg">
                                <Check className="w-4 h-4 text-green-500" />
                              </button>
                              <button className="p-2 hover:bg-red-50 rounded-lg">
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-6">
                <h1 className="font-heading font-bold text-2xl text-primary">{t('users')}</h1>
                <button className="btn-primary">
                  <UserPlus className="w-5 h-5 me-2" />
                  Add User
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm">
                <div className="p-4 border-b flex gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="input-field ps-10"
                    />
                  </div>
                  <button className="btn-secondary">
                    <Filter className="w-5 h-5 me-2" />
                    Filter
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="p-4 font-medium">User</th>
                        <th className="p-4 font-medium">Country</th>
                        <th className="p-4 font-medium">Applications</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Ahmed Hassan', email: 'ahmed@example.com', country: 'Egypt', apps: 3, status: 'active' },
                        { name: 'Sarah Johnson', email: 'sarah@example.com', country: 'USA', apps: 1, status: 'active' },
                        { name: 'Mohamed Ali', email: 'mohamed@example.com', country: 'Egypt', apps: 2, status: 'active' },
                      ].map((user, index) => (
                        <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="font-medium text-primary">{user.name[0]}</span>
                              </div>
                              <div>
                                <p className="font-medium text-primary">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm">{user.country}</td>
                          <td className="p-4 text-sm">{user.apps}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                              {user.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t flex items-center justify-between">
                  <p className="text-sm text-gray-500">Showing 1-10 of 2,847 users</p>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="px-3 py-1 bg-gold text-primary rounded-lg font-medium">1</button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-lg">2</button>
                    <button className="px-3 py-1 hover:bg-gray-100 rounded-lg">3</button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-heading font-bold text-2xl text-primary mb-6">{t('messages')}</h1>
              <div className="bg-white rounded-2xl shadow-sm">
                {messages.map((msg) => (
                  <div key={msg.id} className={`p-4 border-b last:border-0 hover:bg-gray-50 cursor-pointer ${msg.unread ? 'bg-blue-50/50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${msg.unread ? 'bg-primary' : 'bg-gray-200'}`}>
                          <span className={`font-medium ${msg.unread ? 'text-white' : 'text-gray-600'}`}>
                            {msg.name[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-primary">{msg.name}</p>
                            {msg.unread && <span className="w-2 h-2 bg-gold rounded-full" />}
                          </div>
                          <p className="text-sm font-medium text-gray-700">{msg.subject}</p>
                          <p className="text-sm text-gray-500 truncate max-w-md">{msg.preview}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{msg.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="font-heading font-bold text-2xl text-primary mb-6">{t('settings')}</h1>
              <div className="bg-white rounded-2xl shadow-sm p-6 max-w-2xl">
                <h2 className="font-heading font-semibold text-lg text-primary mb-4">Language Settings</h2>
                <p className="text-gray-600 mb-4">Enable or disable languages for the platform</p>
                <div className="space-y-3">
                  {['English', 'French', 'Arabic', 'Turkish', 'Japanese', 'Spanish', 'Italian'].map((lang, index) => (
                    <label key={lang} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <span className="font-medium">{lang}</span>
                      <input type="checkbox" defaultChecked={index < 3} className="w-5 h-5 rounded text-gold" />
                    </label>
                  ))}
                </div>
                <button className="btn-primary mt-6">Save Changes</button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
