import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Plus, Eye, EyeOff, Sparkles, Check, ArrowLeft } from 'lucide-react';

export default function AdminSchemesPage() {
  const { t, lang } = useLang();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '', nameHi: '', nameEn: '', descriptionHi: '', descriptionEn: '',
    category: 'health', eligibility: '{}', benefits: '', benefitsHi: '',
    documents: '', documentsHi: '', applicationProcess: '', applicationProcessHi: '',
    sourceUrl: '', lastCheckedDate: '', district: '',
  });

  const fetchSchemes = () => {
    setLoading(true);
    api.getAllSchemes()
      .then((res: any) => setSchemes(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSchemes(); }, []);

  const handleTogglePublish = async (id: string) => {
    await api.toggleSchemePublish(id);
    fetchSchemes();
  };

  const handleGenerateSummary = async (id: string) => {
    setAiLoading(id);
    try {
      await api.generateSchemeSummary(id);
      fetchSchemes();
    } catch (e: any) {
      alert(e.message);
    }
    setAiLoading(null);
  };

  const handleApproveSummary = async (id: string) => {
    await api.approveSchemeSummary(id);
    fetchSchemes();
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createScheme({
        ...form,
        eligibility: JSON.parse(form.eligibility || '{}'),
        documents: form.documents.split(',').map(s => s.trim()).filter(Boolean),
        documentsHi: form.documentsHi.split(',').map(s => s.trim()).filter(Boolean),
        district: form.district.split(',').map(s => s.trim()).filter(Boolean),
      });
      setShowForm(false);
      fetchSchemes();
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
          <h1 className="text-2xl font-bold text-gray-800">{t('योजना प्रबंधन', 'Scheme Management')}</h1>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm py-2 inline-flex items-center gap-1">
          <Plus className="w-4 h-4" /> {t('नई योजना', 'New Scheme')}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4">
          <h3 className="font-semibold">{t('नई योजना बनाएं', 'Create New Scheme')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="label">Code *</label><input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="health">Health</option><option value="pension">Pension</option><option value="livelihood">Livelihood</option>
              </select>
            </div>
            <div><label className="label">Name (Hindi) *</label><input value={form.nameHi} onChange={e => setForm({ ...form, nameHi: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Name (English) *</label><input value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} className="input-field" required /></div>
            <div className="sm:col-span-2"><label className="label">Description (Hindi) *</label><textarea value={form.descriptionHi} onChange={e => setForm({ ...form, descriptionHi: e.target.value })} className="input-field" rows={3} required /></div>
            <div className="sm:col-span-2"><label className="label">Description (English) *</label><textarea value={form.descriptionEn} onChange={e => setForm({ ...form, descriptionEn: e.target.value })} className="input-field" rows={3} required /></div>
            <div><label className="label">Benefits (English) *</label><input value={form.benefits} onChange={e => setForm({ ...form, benefits: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Benefits (Hindi) *</label><input value={form.benefitsHi} onChange={e => setForm({ ...form, benefitsHi: e.target.value })} className="input-field" required /></div>
            <div><label className="label">Documents (comma-separated)</label><input value={form.documents} onChange={e => setForm({ ...form, documents: e.target.value })} className="input-field" /></div>
            <div><label className="label">Documents Hindi (comma-separated)</label><input value={form.documentsHi} onChange={e => setForm({ ...form, documentsHi: e.target.value })} className="input-field" /></div>
            <div className="sm:col-span-2"><label className="label">Application Process (English) *</label><textarea value={form.applicationProcess} onChange={e => setForm({ ...form, applicationProcess: e.target.value })} className="input-field" rows={2} required /></div>
            <div className="sm:col-span-2"><label className="label">Application Process (Hindi) *</label><textarea value={form.applicationProcessHi} onChange={e => setForm({ ...form, applicationProcessHi: e.target.value })} className="input-field" rows={2} required /></div>
            <div><label className="label">Eligibility (JSON)</label><textarea value={form.eligibility} onChange={e => setForm({ ...form, eligibility: e.target.value })} className="input-field font-mono text-xs" rows={3} /></div>
            <div><label className="label">Districts (comma-separated)</label><input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} className="input-field" placeholder="Bhopal, Indore" /></div>
            <div><label className="label">Source URL</label><input value={form.sourceUrl} onChange={e => setForm({ ...form, sourceUrl: e.target.value })} className="input-field" /></div>
            <div><label className="label">Last Checked Date</label><input type="date" value={form.lastCheckedDate} onChange={e => setForm({ ...form, lastCheckedDate: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary text-sm py-2">{t('बनाएं', 'Create')}</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2">{t('रद्द करें', 'Cancel')}</button>
          </div>
        </form>
      )}

      {/* Scheme List */}
      <div className="space-y-4">
        {schemes.map((s: any) => (
          <div key={s.id} className="card">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-gray-400">{s.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${s.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.published ? t('प्रकाशित', 'Published') : t('अप्रकाशित', 'Unpublished')}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800">{s.nameHi}</h3>
                <p className="text-sm text-gray-500">{s.nameEn}</p>

                {/* AI Summary */}
                {s.summaryAiDraft && !s.summaryApproved && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-700 mb-1">{t('AI ड्राफ्ट (समीक्षा लंबित)', 'AI Draft (pending review)')}</p>
                    <p className="text-sm text-gray-700">{s.summaryAiDraft}</p>
                    <button onClick={() => handleApproveSummary(s.id)} className="mt-2 text-xs bg-green-600 text-white px-3 py-1 rounded inline-flex items-center gap-1">
                      <Check className="w-3 h-3" /> {t('स्वीकृत करें', 'Approve')}
                    </button>
                  </div>
                )}
                {s.summaryApproved && s.summaryHi && (
                  <div className="mt-2 bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-xs text-green-600 mb-1">{t('स्वीकृत सारांश', 'Approved Summary')}</p>
                    <p className="text-sm text-gray-700">{s.summaryHi}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleTogglePublish(s.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border transition-colors ${
                    s.published ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'
                  }`}>
                  {s.published ? <><EyeOff className="w-3 h-3" />{t('अप्रकाशित', 'Unpublish')}</> : <><Eye className="w-3 h-3" />{t('प्रकाशित', 'Publish')}</>}
                </button>
                <button onClick={() => handleGenerateSummary(s.id)} disabled={aiLoading === s.id}
                  className="text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1 border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50">
                  <Sparkles className="w-3 h-3" />
                  {aiLoading === s.id ? t('उत्पन्न...', 'Generating...') : t('AI सारांश', 'AI Summary')}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
