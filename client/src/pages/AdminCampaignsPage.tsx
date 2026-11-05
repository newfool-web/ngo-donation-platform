import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, ArrowLeft, BarChart3, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminCampaignsPage() {
  const { t, lang } = useLang();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', titleHi: '', description: '', descriptionHi: '',
    targetAmount: '', startDate: '', endDate: '',
  });

  const fetchCampaigns = () => {
    setLoading(true);
    api.getAllCampaigns()
      .then((res: any) => setCampaigns(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleToggleStatus = async (id: string) => {
    await api.toggleCampaignStatus(id);
    fetchCampaigns();
  };

  const handleViewReport = async (id: string) => {
    if (reportId === id) { setReport(null); setReportId(null); return; }
    try {
      const res: any = await api.getCampaignReport(id);
      setReport(res.data);
      setReportId(id);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createCampaign({
        ...form,
        targetAmount: parseFloat(form.targetAmount),
      });
      setShowForm(false);
      setForm({ title: '', titleHi: '', description: '', descriptionHi: '', targetAmount: '', startDate: '', endDate: '' });
      fetchCampaigns();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-primary-600 hover:text-primary-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{t('अभियान प्रबंधन', 'Campaign Management')}</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> {t('नया अभियान', 'New Campaign')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4">
          <h3 className="font-semibold">{t('नया अभियान बनाएं', 'Create New Campaign')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Title (English) *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Title (Hindi) *</label><input value={form.titleHi} onChange={e => setForm({ ...form, titleHi: e.target.value })} className="input-field" required /></div>
            <div className="sm:col-span-2"><label className="label">Description (English) *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} required /></div>
            <div className="sm:col-span-2"><label className="label">Description (Hindi) *</label><textarea value={form.descriptionHi} onChange={e => setForm({ ...form, descriptionHi: e.target.value })} className="input-field" rows={2} required /></div>
            <div><label className="label">Target Amount (₹) *</label><input type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} className="input-field" required min="1" /></div>
            <div><label className="label">Start Date *</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="input-field" required /></div>
            <div><label className="label">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2">{t('बनाएं', 'Create')}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2">{t('रद्द करें', 'Cancel')}</button>
          </div>
        </form>
      )}

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.map((c: any) => {
          const progress = c.targetAmount > 0 ? Math.min((c.raisedAmount / c.targetAmount) * 100, 100) : 0;
          return (
            <div key={c.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      c.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>{c.status}</span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{lang === 'hi' ? c.titleHi : c.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{lang === 'hi' ? c.descriptionHi : c.description}</p>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>₹{c.raisedAmount.toLocaleString('en-IN')}</span>
                      <span className="font-medium">₹{c.targetAmount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{progress.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => handleToggleStatus(c.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border ${
                      c.status === 'ACTIVE' ? 'border-red-200 text-red-600' : 'border-green-200 text-green-600'
                    }`}>
                    {c.status === 'ACTIVE' ? <><ToggleRight className="w-3 h-3" />{t('निष्क्रिय', 'Deactivate')}</> : <><ToggleLeft className="w-3 h-3" />{t('सक्रिय', 'Activate')}</>}
                  </button>
                  <button onClick={() => handleViewReport(c.id)}
                    className="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-blue-200 text-blue-600 hover:bg-blue-50">
                    <BarChart3 className="w-3 h-3" /> {t('रिपोर्ट', 'Report')}
                  </button>
                </div>
              </div>

              {/* Report */}
              {reportId === c.id && report && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold text-sm mb-3">{t('अभियान रिपोर्ट', 'Campaign Report')}</h4>
                  <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold">₹{report.totalAmount.toLocaleString('en-IN')}</div>
                      <div className="text-xs text-gray-500">{t('कुल राशि', 'Total')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold">{report.donorCount}</div>
                      <div className="text-xs text-gray-500">{t('दानदाता', 'Donors')}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-bold">{report.donationCount}</div>
                      <div className="text-xs text-gray-500">{t('दान', 'Donations')}</div>
                    </div>
                  </div>
                  {report.donations?.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead><tr className="border-b text-gray-500"><th className="py-2 pr-3 text-left">{t('रसीद', 'Receipt')}</th><th className="py-2 pr-3 text-left">{t('दानदाता', 'Donor')}</th><th className="py-2 pr-3 text-left">{t('राशि', 'Amount')}</th><th className="py-2 text-left">{t('दिनांक', 'Date')}</th></tr></thead>
                        <tbody>
                          {report.donations.map((d: any) => (
                            <tr key={d.id} className="border-b last:border-0">
                              <td className="py-2 pr-3 font-mono">{d.receiptNumber}</td>
                              <td className="py-2 pr-3">{d.donorName}</td>
                              <td className="py-2 pr-3">₹{d.amount.toLocaleString('en-IN')}</td>
                              <td className="py-2">{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
