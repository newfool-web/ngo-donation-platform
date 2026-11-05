import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Search, CheckCircle, Phone, AlertTriangle, ArrowRight } from 'lucide-react';

const DISTRICTS = ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain', 'Sagar', 'Rewa', 'Satna', 'Chhindwara'];

export default function EligibilityPage() {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    district: '',
    age: '',
    maritalStatus: '' as '' | 'married' | 'unmarried' | 'widow' | 'divorced',
    isPregnant: false,
    isSHGMember: false,
    isBPL: false,
  });
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.district || !form.age || !form.maritalStatus) {
      setError(t('कृपया सभी आवश्यक फ़ील्ड भरें', 'Please fill all required fields'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res: any = await api.checkEligibility({
        ...form,
        age: parseInt(form.age),
      });
      setResults(res.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <Search className="w-12 h-12 text-primary-500 mx-auto mb-3" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
          {t('पात्रता जाँच', 'Eligibility Finder')}
        </h1>
        <p className="text-gray-500">
          {t('कुछ सरल प्रश्नों का उत्तर दें', 'Answer a few simple questions')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* District */}
        <div>
          <label htmlFor="district" className="label">{t('जिला', 'District')} *</label>
          <select
            id="district"
            value={form.district}
            onChange={e => setForm({ ...form, district: e.target.value })}
            className="input-field"
            required
          >
            <option value="">{t('जिला चुनें', 'Select District')}</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="label">{t('आयु (वर्ष)', 'Age (years)')} *</label>
          <input
            id="age"
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={e => setForm({ ...form, age: e.target.value })}
            className="input-field"
            placeholder={t('उदा. 35', 'e.g. 35')}
            required
          />
        </div>

        {/* Marital Status */}
        <fieldset>
          <legend className="label">{t('वैवाहिक स्थिति', 'Marital Status')} *</legend>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { value: 'married', hi: 'विवाहित', en: 'Married' },
              { value: 'unmarried', hi: 'अविवाहित', en: 'Unmarried' },
              { value: 'widow', hi: 'विधवा', en: 'Widow' },
              { value: 'divorced', hi: 'तलाकशुदा', en: 'Divorced' },
            ].map(opt => (
              <label
                key={opt.value}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  form.maritalStatus === opt.value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="maritalStatus"
                  value={opt.value}
                  checked={form.maritalStatus === opt.value}
                  onChange={e => setForm({ ...form, maritalStatus: e.target.value as any })}
                  className="accent-primary-600"
                />
                <span className="text-sm">{lang === 'hi' ? opt.hi : opt.en}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Yes/No Questions */}
        {[
          { key: 'isPregnant', hi: 'क्या आप गर्भवती हैं?', en: 'Are you pregnant?' },
          { key: 'isSHGMember', hi: 'क्या आप स्वयं सहायता समूह की सदस्य हैं?', en: 'Are you a SHG member?' },
          { key: 'isBPL', hi: 'क्या आपके पास बीपीएल कार्ड है?', en: 'Do you have a BPL card?' },
        ].map(q => (
          <fieldset key={q.key}>
            <legend className="label">{lang === 'hi' ? q.hi : q.en}</legend>
            <div className="flex gap-4 mt-2">
              {[
                { value: true, label: t('हाँ', 'Yes') },
                { value: false, label: t('नहीं', 'No') },
              ].map(opt => (
                <label
                  key={String(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                    (form as any)[q.key] === opt.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={q.key}
                    checked={(form as any)[q.key] === opt.value}
                    onChange={() => setForm({ ...form, [q.key]: opt.value })}
                    className="accent-primary-600"
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? t('जाँच हो रही है...', 'Checking...') : t('पात्रता जाँचें', 'Check Eligibility')}
        </button>
      </form>

      {/* Results */}
      {results && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold text-gray-800">
            {results.results?.length > 0
              ? t(`${results.results.length} योजनाएं मिलीं`, `${results.results.length} scheme(s) found`)
              : t('कोई योजना नहीं मिली', 'No matching schemes found')}
          </h2>

          {results.results?.length === 0 && (
            <div className="card text-center">
              <p className="text-gray-500 mb-4">
                {t('चिंता न करें, हमारी हेल्पलाइन से संपर्क करें:', 'Don\'t worry, contact our helpline:')}
              </p>
              <p className="flex items-center justify-center gap-2 text-lg font-semibold text-primary-600">
                <Phone className="w-5 h-5" /> 1800-XXX-XXXX
              </p>
            </div>
          )}

          {results.results?.map((r: any, i: number) => (
            <div key={i} className="card">
              <h3 className="font-semibold text-gray-800 mb-2">
                {lang === 'hi' ? r.scheme.nameHi : r.scheme.nameEn}
              </h3>
              <div className="space-y-1 mb-3">
                {(lang === 'hi' ? r.matchedRulesHi : r.matchedRules)?.map((rule: string, j: number) => (
                  <p key={j} className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="w-4 h-4 shrink-0" /> {rule}
                  </p>
                ))}
              </div>
              <Link to={`/schemes/${r.scheme.id}`} className="text-primary-600 hover:underline text-sm inline-flex items-center gap-1">
                {t('विवरण देखें', 'View Details')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}

          {/* Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="flex items-start gap-2 text-sm text-amber-700">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              {results.disclaimer || t('यह पात्रता जाँच सांकेतिक है।', 'This eligibility check is indicative only.')}
            </p>
          </div>

          {/* Helpline */}
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm mb-1">{t('सहायता के लिए कॉल करें', 'Call for help')}</p>
            <p className="flex items-center justify-center gap-2 text-lg font-semibold text-primary-600">
              <Phone className="w-5 h-5" /> {results.helpline || '1800-XXX-XXXX'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
