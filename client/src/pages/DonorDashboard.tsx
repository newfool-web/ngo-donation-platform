import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Download, Heart, Calendar, IndianRupee, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function DonorDashboard() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyDonations()
      .then((res: any) => setDonations(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (donationId: string, type: 'receipt' | 'certificate', receiptNum: string) => {
    try {
      const blob = type === 'receipt'
        ? await api.downloadReceipt(donationId)
        : await api.downloadCertificate(donationId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${receiptNum}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t('डाउनलोड विफल', 'Download failed'));
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full"><CheckCircle className="w-3 h-3" />{t('सफल', 'Success')}</span>;
      case 'FAILED': return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full"><XCircle className="w-3 h-3" />{t('विफल', 'Failed')}</span>;
      default: return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full"><Clock className="w-3 h-3" />{t('लंबित', 'Pending')}</span>;
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {t(`नमस्ते, ${user?.name}!`, `Hello, ${user?.name}!`)}
        </h1>
        <p className="text-gray-500 mt-1">{user?.email}</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/donate" className="btn-primary inline-flex items-center gap-2 text-sm py-2">
          <Heart className="w-4 h-4" /> {t('दान करें', 'Donate Now')}
        </Link>
        <Link to="/schemes" className="btn-outline inline-flex items-center gap-2 text-sm py-2">
          {t('योजनाएं देखें', 'Browse Schemes')}
        </Link>
      </div>

      {/* Donation History */}
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary-500" />
        {t('दान इतिहास', 'Donation History')}
      </h2>

      {donations.length === 0 ? (
        <div className="card text-center py-12">
          <IndianRupee className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 mb-4">{t('अभी तक कोई दान नहीं', 'No donations yet')}</p>
          <Link to="/donate" className="btn-primary text-sm inline-block">
            {t('अपना पहला दान करें', 'Make your first donation')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {donations.map((d: any) => (
            <div key={d.id} className="card flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-lg">₹{d.amount.toLocaleString('en-IN')}</span>
                  {statusBadge(d.status)}
                  <span className="text-xs text-gray-400">{d.type === 'MONTHLY' ? t('मासिक', 'Monthly') : t('एकमुश्त', 'One-time')}</span>
                </div>
                <p className="text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(d.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t('रसीद:', 'Receipt:')} {d.receiptNumber}
                  {d.campaign && ` | ${lang === 'hi' ? d.campaign.titleHi : d.campaign.title}`}
                </p>
              </div>
              {d.status === 'SUCCESS' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(d.id, 'receipt', d.receiptNumber)}
                    className="btn-outline text-xs px-3 py-1.5 inline-flex items-center gap-1"
                    aria-label={t('रसीद डाउनलोड', 'Download Receipt')}
                  >
                    <Download className="w-3 h-3" /> {t('रसीद', 'Receipt')}
                  </button>
                  <button
                    onClick={() => handleDownload(d.id, 'certificate', d.receiptNumber)}
                    className="btn-outline text-xs px-3 py-1.5 inline-flex items-center gap-1"
                    aria-label={t('प्रमाणपत्र डाउनलोड', 'Download Certificate')}
                  >
                    <Download className="w-3 h-3" /> {t('80G', '80G')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
