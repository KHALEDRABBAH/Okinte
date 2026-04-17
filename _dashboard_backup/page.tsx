// @ts-nocheck
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  FileText, Upload, CreditCard, User, Bell, Settings, LogOut,
  Plus, Clock, CheckCircle, XCircle, Download, Eye, ChevronRight,
  TrendingUp, Users, Briefcase, DollarSign, FileCheck
} from 'lucide-react';
import { rtlLocales } from '@/i18n/routing';

export default function Dashboard() {
  const t = useTranslations('dashboard');
  const tAdmin = useTranslations('admin');
  const locale = useLocale();
  const isRTL = rtlLocales.includes(locale as any);

  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: tAdmin('totalUsers'), value: '2,847', icon: Users, color: 'bg-blue-500' },
    { label: tAdmin('pendingApplications'), value: '156', icon: Briefcase, color: 'bg-amber-500' },
    { label: tAdmin('totalRevenue'), value: '$128,450', icon: DollarSign, color: 'bg-green-500' },
    { label: tAdmin('successRate'), value: '94%', icon: TrendingUp, color: 'bg-purple-500' },
  ];

  const recentApplications = [
    { id: '1', name: 'Ahmed Hassan', service: 'Study Connection', status: 'underReview', date: '2026-04-15' },
    { id: '2', name: 'Sarah Johnson', service: 'Scholarship', status: 'approved', date: '2026-04-14' },
    { id: '3', name: 'Mohamed Ali', service: 'Employment', status: 'submitted', date: '2026-04-13' },
    { id: '4', name: 'Fatima Zahra', service: 'Internship', status: 'approved', date: '2026-04-12' },
  ];

  const statusColors = {
    draft: 'bg-gray-100 text-gray-600',
    submitted: 'bg-blue-100 text-blue-600',
    underReview: 'bg-amber-100 text-amber-600',
    approved: 'bg-green-100 text-green-600',
    rejected: 'bg-red-100 text-red-600',
  };

  const sidebarLinks = [
    { id: 'overview', icon: TrendingUp, label: 'Overview' },
    { id: 'applications', icon: FileText, label: t('myApplications') },
    { id: 'documents', icon: Upload, label: t('documents') },
    { id: 'payments', icon: CreditCard, label: t('payments') },
    { id: 'profile', icon: User, label: t('profile') },
  ];

  return (
    <div className="min-h-screen bg-cream">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex gap-8">
            {/* Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              className={`hidden lg:block w-64 flex-shrink-0`}
            >
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center">
                    <span className="text-xl font-heading font-bold text-gold">A</span>
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-primary">Ahmed Hassan</p>
                    <p className="text-sm text-gray-500">ahmed@example.com</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  {sidebarLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => setActiveTab(link.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === link.id
                          ? 'bg-gold text-primary'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <link.icon className="w-5 h-5" />
                      <span className="font-medium">{link.label}</span>
                    </button>
                  ))}
                </nav>

                <div className="mt-6 pt-6 border-t space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">{tAdmin('settings')}</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('logout')}</span>
                  </button>
                </div>
              </div>
            </motion.aside>

            {/* Main Content */}
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg"
                  >
                    <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl font-heading font-bold text-primary">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Recent Applications */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <h2 className="font-heading font-bold text-xl text-primary">
                    {t('myApplications')}
                  </h2>
                  <Link href="/apply" className="btn-primary text-sm py-2">
                    <Plus className="w-4 h-4 me-2" />
                    {t('newApplication')}
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FileCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div className={isRTL ? 'text-right' : ''}>
                          <p className="font-semibold text-primary">{app.name}</p>
                          <p className="text-sm text-gray-500">{app.service}</p>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusColors[app.status as keyof typeof statusColors]}`}>
                            {t(`status.${app.status}`)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{app.date}</p>
                        </div>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <ChevronRight className={`w-5 h-5 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid md:grid-cols-3 gap-6 mt-8"
              >
                <Link href="/apply" className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white hover:shadow-xl transition-shadow">
                  <Plus className="w-10 h-10 text-gold mb-4" />
                  <h3 className="font-heading font-bold text-lg mb-2">New Application</h3>
                  <p className="text-white/70 text-sm">Start your journey today</p>
                </Link>

                <Link href="/documents" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-gold">
                  <Upload className="w-10 h-10 text-gold mb-4" />
                  <h3 className="font-heading font-bold text-lg text-primary mb-2">Upload Documents</h3>
                  <p className="text-gray-500 text-sm">Securely upload your files</p>
                </Link>

                <Link href="/payments" className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border-2 border-transparent hover:border-gold">
                  <CreditCard className="w-10 h-10 text-gold mb-4" />
                  <h3 className="font-heading font-bold text-lg text-primary mb-2">Payment History</h3>
                  <p className="text-gray-500 text-sm">View your transactions</p>
                </Link>
              </motion.div>
            </motion.main>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
