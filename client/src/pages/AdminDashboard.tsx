import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart3, Users, IndianRupee, Megaphone, BookOpen, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState<any>(null);
  const [recent, setRecent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getRecentDonations()])
      .then(([s, r]: any) => { setStats(s.data); setRecent(r.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const statCards = [
    { icon: IndianRupee, label: t('कुल राशि', 'Total Amount'), value: `₹${(stats?.totalAmount || 0).toLocaleString('en-IN')}`, color: 'text-green-600 bg-green-50' },
    { icon: BarChart3, label: t('कुल दान', 'Total Donations'), value: stats?.totalDonations || 0, color: 'text-blue-600 bg-blue-50' },
    { icon: Users, label: t('कुल दानदाता', 'Total Donors'), value: stats?.totalDonors || 0, color: 'text-purple-600 bg-purple-50' },
    { icon: Megaphone, label: t('अभियान', 'Campaigns'), value: stats?.campaignCount || 0, color: 'text-terracotta-600 bg-terracotta-50' },
    { icon: BookOpen, label: t('प्रकाशित योजनाएं', 'Published Schemes'), value: stats?.schemeCount || 0, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
        {t('एडमिन डैशबोर्ड', 'Admin Dashboard')}
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {statCards.map((s, i) => (
          <div key={i} className="card text-center p-4">
            <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-xl font-bold text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link to="/admin/schemes" className="card hover:shadow-md transition-shadow flex items-center gap-4 p-4">
          <BookOpen className="w-8 h-8 text-primary-500" />
          <div>
            <h3 className="font-semibold">{t('योजना प्रबंधन', 'Manage Schemes')}</h3>
            <p className="text-sm text-gray-500">{t('योजनाएं बनाएं, संपादित करें, प्रकाशित करें', 'Create, edit, publish schemes')}</p>
          </div>
        </Link>
        <Link to="/admin/campaigns" className="card hover:shadow-md transition-shadow flex items-center gap-4 p-4">
          <Megaphone className="w-8 h-8 text-terracotta-500" />
          <div>
            <h3 className="font-semibold">{t('अभियान प्रबंधन', 'Manage Campaigns')}</h3>
            <p className="text-sm text-gray-500">{t('अभियान बनाएं और रिपोर्ट देखें', 'Create campaigns and view reports')}</p>
          </div>
        </Link>
      </div>

      {/* Recent Donations */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">{t('हाल के दान', 'Recent Donations')}</h2>
      {recent.length === 0 ? (
        <p className="text-gray-400 card text-center py-8">{t('कोई दान नहीं', 'No donations yet')}</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="py-3 pr-4">{t('रसीद', 'Receipt')}</th>
                <th className="py-3 pr-4">{t('दानदाता', 'Donor')}</th>
                <th className="py-3 pr-4">{t('राशि', 'Amount')}</th>
                <th className="py-3 pr-4">{t('दिनांक', 'Date')}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((d: any) => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 pr-4 font-mono text-xs">{d.receiptNumber}</td>
                  <td className="py-3 pr-4">{d.donorName}</td>
                  <td className="py-3 pr-4 font-medium">₹{d.amount.toLocaleString('en-IN')}</td>
                  <td className="py-3 pr-4 text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(d.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
