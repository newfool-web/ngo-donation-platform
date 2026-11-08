import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Heart, Users, Shield, ArrowRight, Search, BookOpen } from 'lucide-react';

const CATEGORY_LABELS: Record<string, { hi: string; en: string }> = {
  health: { hi: 'स्वास्थ्य', en: 'Health' },
  pension: { hi: 'पेंशन', en: 'Pension' },
  livelihood: { hi: 'आजीविका', en: 'Livelihood' },
};

export default function HomePage() {
  const { t, lang } = useLang();
  const [schemes, setSchemes] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('');

  useEffect(() => {
    Promise.allSettled([
      api.getSchemes(activeCategory ? { category: activeCategory } : undefined),
      api.getCampaigns(),
    ])
      .then(([schemesResult, campaignsResult]) => {
        if (schemesResult.status === 'fulfilled') {
          setSchemes(Array.isArray(schemesResult.value.data) ? schemesResult.value.data : []);
        } else {
          console.error('Failed to load schemes:', schemesResult.reason);
          setSchemes([]);
        }

        if (campaignsResult.status === 'fulfilled') {
          setCampaigns(Array.isArray(campaignsResult.value.data) ? campaignsResult.value.data : []);
        } else {
          console.error('Failed to load campaigns:', campaignsResult.reason);
          setCampaigns([]);
        }
      })
      .finally(() => setLoading(false));
  }, [activeCategory]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {t('महिला सशक्तिकरण और कल्याण', "Women's Empowerment & Welfare")}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {t(
              'मध्य प्रदेश के 9 जिलों में महिलाओं को सरकारी योजनाओं से जोड़ना और उनके जीवन को बेहतर बनाना',
              'Connecting women across 9 districts of Madhya Pradesh with government welfare schemes and building better lives'
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/schemes" className="btn-primary bg-white text-primary-700 hover:bg-gray-100 inline-flex items-center justify-center gap-2">
              <BookOpen className="w-5 h-5" />
              {t('योजनाएं देखें', 'Browse Schemes')}
            </Link>
            <Link to="/donate" className="btn-secondary inline-flex items-center justify-center gap-2">
              <Heart className="w-5 h-5" />
              {t('दान करें', 'Donate Now')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '9', label: t('जिले', 'Districts') },
            { value: '220+', label: t('कर्मचारी', 'Staff') },
            { value: '1,400+', label: t('स्वयंसेवक', 'Volunteers') },
            { value: '12,000+', label: t('दानदाता', 'Donors') },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl sm:text-3xl font-bold text-primary-600">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Schemes Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2">
            {t('सरकारी कल्याण योजनाएं', 'Government Welfare Schemes')}
          </h2>
          <p className="text-gray-500 text-center mb-8">
            {t('आवश्यकता के अनुसार योजनाएं खोजें', 'Find schemes based on your needs')}
          </p>

          {/* Category Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !activeCategory ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('सभी', 'All')}
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === key ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang === 'hi' ? label.hi : label.en}
              </button>
            ))}
          </div>

          {/* Scheme Cards */}
          {schemes.length === 0 ? (
            <p className="text-center text-gray-400 py-8">{t('कोई योजना उपलब्ध नहीं', 'No schemes available')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schemes.slice(0, 6).map((scheme: any) => (
                <Link key={scheme.id} to={`/schemes/${scheme.id}`} className="card hover:shadow-md transition-shadow group">
                  <span className={`inline-block text-xs px-2 py-1 rounded-full mb-3 font-medium ${
                    scheme.category === 'health' ? 'bg-blue-100 text-blue-700' :
                    scheme.category === 'pension' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {CATEGORY_LABELS[scheme.category]?.[lang] || scheme.category}
                  </span>
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                    {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {lang === 'hi' ? scheme.descriptionHi?.slice(0, 100) : scheme.descriptionEn?.slice(0, 100)}...
                  </p>
                  <span className="text-primary-600 text-sm font-medium inline-flex items-center gap-1">
                    {t('और जानें', 'Learn More')} <ArrowRight className="w-4 h-4" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Eligibility Finder CTA */}
      <section className="py-12 px-4 bg-terracotta-50">
        <div className="max-w-3xl mx-auto text-center">
          <Search className="w-12 h-12 text-terracotta-500 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
            {t('क्या आप किसी योजना के लिए पात्र हैं?', 'Are you eligible for a scheme?')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            {t(
              'कुछ सरल प्रश्नों का उत्तर दें और जानें कि आप किन सरकारी योजनाओं का लाभ उठा सकती हैं।',
              'Answer a few simple questions and find out which government schemes you may benefit from.'
            )}
          </p>
          <Link to="/eligibility" className="btn-secondary inline-flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {t('पात्रता जाँचें', 'Check Eligibility')}
          </Link>
        </div>
      </section>

      {/* Active Campaigns */}
      {campaigns.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
              {t('सक्रिय अभियान', 'Active Campaigns')}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign: any) => {
                const progress = campaign.targetAmount > 0
                  ? Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100)
                  : 0;
                return (
                  <div key={campaign.id} className="card">
                    <h3 className="font-semibold text-gray-800 mb-2">
                      {lang === 'hi' ? campaign.titleHi : campaign.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {lang === 'hi' ? campaign.descriptionHi : campaign.description}
                    </p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">₹{campaign.raisedAmount.toLocaleString('en-IN')}</span>
                        <span className="font-medium text-gray-700">₹{campaign.targetAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                          role="progressbar"
                          aria-valuenow={progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                    </div>
                    <Link
                      to={`/donate?campaign=${campaign.id}`}
                      className="btn-primary w-full text-center text-sm py-2 block"
                    >
                      {t('दान करें', 'Donate')}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
