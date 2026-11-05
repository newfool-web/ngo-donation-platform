import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Filter, MapPin } from 'lucide-react';

const CATEGORY_LABELS: Record<string, { hi: string; en: string }> = {
  health: { hi: 'स्वास्थ्य', en: 'Health' },
  pension: { hi: 'पेंशन', en: 'Pension' },
  livelihood: { hi: 'आजीविका', en: 'Livelihood' },
};

export default function SchemesPage() {
  const { t, lang } = useLang();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCategories(), api.getDistricts()])
      .then(([c, d]: any) => {
        setCategories(c.data || []);
        setDistricts(d.data || []);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (selectedCategory) params.category = selectedCategory;
    if (selectedDistrict) params.district = selectedDistrict;
    api.getSchemes(params)
      .then((res: any) => setSchemes(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedDistrict]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
        {t('सरकारी कल्याण योजनाएं', 'Government Welfare Schemes')}
      </h1>
      <p className="text-gray-500 mb-6">
        {t('⚠️ यहाँ प्रदर्शित जानकारी सांकेतिक है', '⚠️ Information shown here is illustrative')}
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="input-field py-2 text-sm"
            aria-label={t('श्रेणी चुनें', 'Select Category')}
          >
            <option value="">{t('सभी श्रेणियाँ', 'All Categories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {CATEGORY_LABELS[cat]?.[lang] || cat}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="input-field py-2 text-sm"
            aria-label={t('जिला चुनें', 'Select District')}
          >
            <option value="">{t('सभी जिले', 'All Districts')}</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : schemes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">{t('कोई योजना उपलब्ध नहीं', 'No schemes available')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {schemes.map((scheme: any) => (
            <Link key={scheme.id} to={`/schemes/${scheme.id}`} className="card hover:shadow-md transition-shadow group">
              <span className={`inline-block text-xs px-2 py-1 rounded-full mb-3 font-medium ${
                scheme.category === 'health' ? 'bg-blue-100 text-blue-700' :
                scheme.category === 'pension' ? 'bg-amber-100 text-amber-700' :
                'bg-green-100 text-green-700'
              }`}>
                {CATEGORY_LABELS[scheme.category]?.[lang] || scheme.category}
              </span>
              <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-primary-600 transition-colors">
                {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
              </h3>
              <p className="text-xs text-gray-400 mb-2">
                {lang === 'hi' ? scheme.nameEn : scheme.nameHi}
              </p>
              <p className="text-sm text-gray-500 line-clamp-3 mb-3">
                {lang === 'hi' ? scheme.descriptionHi?.slice(0, 120) : scheme.descriptionEn?.slice(0, 120)}...
              </p>
              {scheme.lastCheckedDate && (
                <p className="text-xs text-gray-400">
                  {t('अंतिम जाँच:', 'Last checked:')} {new Date(scheme.lastCheckedDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
