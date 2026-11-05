import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, CreditCard, Download, AlertCircle, ArrowRight, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

const PRESET_AMOUNTS = [500, 1000, 2500];

export default function DonatePage() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCampaign = searchParams.get('campaign');

  const [step, setStep] = useState(1);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    campaignId: preselectedCampaign || '',
    amount: 0,
    customAmount: '',
    type: 'ONE_TIME' as 'ONE_TIME' | 'MONTHLY',
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorPhone: '',
    donorPan: '',
  });

  useEffect(() => {
    api.getCampaigns()
      .then((res: any) => setCampaigns(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, donorName: user.name, donorEmail: user.email }));
    }
  }, [user]);

  const actualAmount = form.amount || parseInt(form.customAmount) || 0;

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (actualAmount < 100) {
      setError(t('न्यूनतम दान ₹100 है', 'Minimum donation is ₹100'));
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res: any = await api.createDonation({
        campaignId: form.campaignId || undefined,
        amount: actualAmount,
        type: form.type,
        donorName: form.donorName,
        donorEmail: form.donorEmail,
        donorPhone: form.donorPhone || undefined,
        donorPan: form.donorPan || undefined,
        idempotencyKey: crypto.randomUUID(),
      });
      setResult(res.data);
      setStep(4);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = async (type: 'receipt' | 'certificate') => {
    if (!result?.id) return;
    try {
      const blob = type === 'receipt'
        ? await api.downloadReceipt(result.id)
        : await api.downloadCertificate(result.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${result.receiptNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setError(t('डाउनलोड विफल', 'Download failed'));
    }
  };

  if (loading) return <LoadingSpinner />;

  // Step 4: Result
  if (step === 4 && result) {
    const isSuccess = result.status === 'SUCCESS';
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        {isSuccess ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t('दान सफल!', 'Donation Successful!')}
            </h1>
            <p className="text-gray-500 mb-6">
              {t('रसीद संख्या:', 'Receipt Number:')} <span className="font-mono font-bold">{result.receiptNumber}</span>
            </p>
            <p className="text-xs text-red-500 mb-6">
              {t('⚠️ यह एक परीक्षण भुगतान है। वास्तव में कोई धनराशि स्थानांतरित नहीं हुई है।',
                '⚠️ This is a test payment. No actual money has been transferred.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <button onClick={() => handleDownload('receipt')} className="btn-primary inline-flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {t('रसीद डाउनलोड करें', 'Download Receipt')}
              </button>
              <button onClick={() => handleDownload('certificate')} className="btn-outline inline-flex items-center justify-center gap-2">
                <Download className="w-5 h-5" /> {t('80G प्रमाणपत्र', '80G Certificate')}
              </button>
            </div>
            <Link to="/dashboard" className="text-primary-600 hover:underline text-sm">
              {t('मेरा डैशबोर्ड →', 'My Dashboard →')}
            </Link>
          </>
        ) : (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {t('भुगतान विफल', 'Payment Failed')}
            </h1>
            <p className="text-gray-500 mb-6">
              {t('कृपया पुनः प्रयास करें।', 'Please try again.')}
            </p>
            <button onClick={() => { setStep(3); setResult(null); }} className="btn-primary">
              {t('पुनः प्रयास करें', 'Try Again')}
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
        <Heart className="w-8 h-8 text-terracotta-500 inline mr-2" />
        {t('दान करें', 'Make a Donation')}
      </h1>
      <p className="text-center text-xs text-red-500 mb-6">
        {t('DEMO: यह एक परीक्षण भुगतान है', 'DEMO: This is a test payment')}
      </p>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map(s => (
          <React.Fragment key={s}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s}</div>
            {s < 3 && <div className={`w-12 h-1 rounded ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Campaign & Amount */}
      {step === 1 && (
        <div className="card space-y-6">
          <div>
            <label className="label">{t('अभियान चुनें (वैकल्पिक)', 'Select Campaign (optional)')}</label>
            <div className="space-y-2 mt-2">
              <label className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                !form.campaignId ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input type="radio" name="campaign" checked={!form.campaignId}
                  onChange={() => setForm({ ...form, campaignId: '' })} className="mr-2 accent-primary-600" />
                {t('सामान्य निधि', 'General Fund')}
              </label>
              {campaigns.map(c => (
                <label key={c.id} className={`block p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.campaignId === c.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input type="radio" name="campaign" checked={form.campaignId === c.id}
                    onChange={() => setForm({ ...form, campaignId: c.id })} className="mr-2 accent-primary-600" />
                  <span className="font-medium">{lang === 'hi' ? c.titleHi : c.title}</span>
                  <span className="text-sm text-gray-500 ml-2">
                    (₹{c.raisedAmount.toLocaleString('en-IN')} / ₹{c.targetAmount.toLocaleString('en-IN')})
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="label">{t('राशि चुनें', 'Select Amount')}</label>
            <div className="grid grid-cols-3 gap-3 mt-2">
              {PRESET_AMOUNTS.map(a => (
                <button key={a} type="button"
                  onClick={() => setForm({ ...form, amount: a, customAmount: '' })}
                  className={`py-3 rounded-lg border text-center font-semibold transition-colors ${
                    form.amount === a ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  ₹{a.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <input type="number" placeholder={t('या कोई अन्य राशि दर्ज करें', 'Or enter custom amount')}
                value={form.customAmount}
                onChange={e => setForm({ ...form, customAmount: e.target.value, amount: 0 })}
                className="input-field" min="100" max="1000000" />
            </div>
          </div>

          <div>
            <label className="label">{t('दान प्रकार', 'Donation Type')}</label>
            <div className="flex gap-3 mt-2">
              {[
                { value: 'ONE_TIME', label: t('एकमुश्त', 'One-time') },
                { value: 'MONTHLY', label: t('मासिक', 'Monthly') },
              ].map(opt => (
                <button key={opt.value} type="button"
                  onClick={() => setForm({ ...form, type: opt.value as any })}
                  className={`flex-1 py-2 rounded-lg border text-center font-medium transition-colors ${
                    form.type === opt.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { if (actualAmount >= 100) setStep(2); else setError(t('कम से कम ₹100 का दान करें', 'Minimum donation ₹100')); }}
            className="btn-primary w-full flex items-center justify-center gap-2">
            {t('आगे बढ़ें', 'Continue')} <ArrowRight className="w-5 h-5" />
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {/* Step 2: Donor Details */}
      {step === 2 && (
        <div className="card space-y-4">
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
              {t('दान करने के लिए लॉगिन आवश्यक है।', 'Login is required to donate.')}
              {' '}<Link to="/login" className="underline font-medium">{t('लॉगिन करें', 'Login')}</Link>
            </div>
          )}
          <div>
            <label htmlFor="donorName" className="label">{t('नाम', 'Name')} *</label>
            <input id="donorName" type="text" value={form.donorName}
              onChange={e => setForm({ ...form, donorName: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label htmlFor="donorEmail" className="label">{t('ईमेल', 'Email')} *</label>
            <input id="donorEmail" type="email" value={form.donorEmail}
              onChange={e => setForm({ ...form, donorEmail: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label htmlFor="donorPhone" className="label">{t('फ़ोन', 'Phone')}</label>
            <input id="donorPhone" type="tel" value={form.donorPhone}
              onChange={e => setForm({ ...form, donorPhone: e.target.value })} className="input-field" />
          </div>
          <div>
            <label htmlFor="donorPan" className="label">{t('PAN (80G के लिए)', 'PAN (for 80G)')}</label>
            <input id="donorPan" type="text" value={form.donorPan}
              onChange={e => setForm({ ...form, donorPan: e.target.value.toUpperCase() })}
              className="input-field" placeholder="ABCDE1234F" maxLength={10} />
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 inline mr-1" />
            {t('विदेशी कार्ड स्वीकार नहीं हैं (FCRA)', 'Foreign cards are not accepted (FCRA)')}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-outline flex-1 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> {t('वापस', 'Back')}
            </button>
            <button onClick={() => { if (form.donorName && form.donorEmail) setStep(3); }}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {t('आगे बढ़ें', 'Continue')} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Pay */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">{t('दान सारांश', 'Donation Summary')}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">{t('राशि', 'Amount')}</span>
              <span className="font-bold text-lg">₹{actualAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">{t('प्रकार', 'Type')}</span>
              <span>{form.type === 'MONTHLY' ? t('मासिक', 'Monthly') : t('एकमुश्त', 'One-time')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">{t('नाम', 'Name')}</span>
              <span>{form.donorName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-500">{t('ईमेल', 'Email')}</span>
              <span>{form.donorEmail}</span>
            </div>
            {form.campaignId && (
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-500">{t('अभियान', 'Campaign')}</span>
                <span>{campaigns.find(c => c.id === form.campaignId)?.[lang === 'hi' ? 'titleHi' : 'title']}</span>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700 text-center">
            ⚠️ DEMO: {t('यह एक परीक्षण भुगतान है। वास्तव में कोई धनराशि स्थानांतरित नहीं होगी।',
              'This is a test payment. No actual money will be transferred.')}
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-outline flex-1 flex items-center justify-center gap-2">
              <ArrowLeft className="w-5 h-5" /> {t('वापस', 'Back')}
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" />
              {submitting ? t('प्रक्रिया...', 'Processing...') : t('भुगतान करें', 'Pay Now')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
