import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { api } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { FileText, MapPin, Phone, ExternalLink, CheckCircle, AlertTriangle, Clock, ArrowLeft, Shield } from 'lucide-react';

export default function SchemeDetailPage() {
  const { id } = useParams();
  const { t, lang } = useLang();
  const [scheme, setScheme] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getScheme(id)
      .then((res: any) => setScheme(res.data))
      .catch((e: any) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!scheme) return <ErrorMessage message={t('योजना नहीं मिली', 'Scheme not found')} />;

  const eligibility = scheme.eligibility as any;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/schemes" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> {t('वापस', 'Back')}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium mb-3 ${
          scheme.category === 'health' ? 'bg-blue-100 text-blue-700' :
          scheme.category === 'pension' ? 'bg-amber-100 text-amber-700' :
          'bg-green-100 text-green-700'
        }`}>
          {scheme.category}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          {lang === 'hi' ? scheme.nameHi : scheme.nameEn}
        </h1>
        <p className="text-gray-500">{lang === 'hi' ? scheme.nameEn : scheme.nameHi}</p>
        <p className="text-xs text-gray-400 mt-2">
          {t('योजना कोड:', 'Scheme Code:')} {scheme.code}
        </p>
      </div>

      {/* AI Summary */}
      {scheme.summaryHi && scheme.summaryApproved && (
        <div className="bg-primary-50 border border-primary-200 rounded-xl p-5 mb-6">
          <h3 className="font-semibold text-primary-700 mb-2 text-sm">{t('सारांश', 'Summary')}</h3>
          <p className="text-gray-700">{scheme.summaryHi}</p>
        </div>
      )}

      {/* Description */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">{t('विवरण', 'Description')}</h2>
        <p className="text-gray-600 leading-relaxed">
          {lang === 'hi' ? scheme.descriptionHi : scheme.descriptionEn}
        </p>
      </div>

      {/* Eligibility */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary-500" />
          {t('पात्रता', 'Eligibility')}
        </h2>
        <ul className="space-y-2 text-gray-600">
          {eligibility?.minAge && (
            <li>• {t(`न्यूनतम आयु: ${eligibility.minAge} वर्ष`, `Minimum age: ${eligibility.minAge} years`)}</li>
          )}
          {eligibility?.maxAge && (
            <li>• {t(`अधिकतम आयु: ${eligibility.maxAge} वर्ष`, `Maximum age: ${eligibility.maxAge} years`)}</li>
          )}
          {eligibility?.maritalStatus && (
            <li>• {t(`वैवाहिक स्थिति: ${eligibility.maritalStatus.join(', ')}`, `Marital status: ${eligibility.maritalStatus.join(', ')}`)}</li>
          )}
          {eligibility?.requiresBPL && (
            <li>• {t('बीपीएल कार्ड आवश्यक', 'BPL card required')}</li>
          )}
          {eligibility?.requiresSHG && (
            <li>• {t('स्वयं सहायता समूह सदस्यता आवश्यक', 'SHG membership required')}</li>
          )}
          {eligibility?.requiresPregnancy && (
            <li>• {t('गर्भावस्था आवश्यक', 'Pregnancy required')}</li>
          )}
        </ul>
      </div>

      {/* Benefits */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">{t('लाभ', 'Benefits')}</h2>
        <p className="text-gray-600">{lang === 'hi' ? scheme.benefitsHi : scheme.benefits}</p>
      </div>

      {/* Documents */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <FileText className="w-5 h-5 text-terracotta-500" />
          {t('आवश्यक दस्तावेज', 'Required Documents')}
        </h2>
        <ul className="space-y-1 text-gray-600">
          {(lang === 'hi' ? scheme.documentsHi : scheme.documents)?.map((doc: string, i: number) => (
            <li key={i}>• {doc}</li>
          ))}
        </ul>
      </div>

      {/* Application Process */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">{t('आवेदन प्रक्रिया', 'Application Process')}</h2>
        <p className="text-gray-600">{lang === 'hi' ? scheme.applicationProcessHi : scheme.applicationProcess}</p>
      </div>

      {/* Help Centre */}
      {scheme.helpCentre && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            {t('निकटतम सहायता केंद्र', 'Nearest Help Centre')}
          </h2>
          <p className="font-medium text-gray-700">{lang === 'hi' ? scheme.helpCentre.nameHi : scheme.helpCentre.name}</p>
          <p className="text-gray-500 text-sm">{lang === 'hi' ? scheme.helpCentre.addressHi : scheme.helpCentre.address}</p>
          <p className="flex items-center gap-1 text-sm text-primary-600 mt-1">
            <Phone className="w-4 h-4" /> {scheme.helpCentre.phone}
          </p>
        </div>
      )}

      {/* Source and Date */}
      <div className="flex flex-wrap gap-4 items-center text-sm text-gray-500 mb-6">
        {scheme.sourceUrl && (
          <a href={scheme.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-600 hover:underline">
            <ExternalLink className="w-4 h-4" /> {t('आधिकारिक स्रोत', 'Official Source')}
          </a>
        )}
        {scheme.lastCheckedDate && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {t('अंतिम जाँच:', 'Last checked:')} {new Date(scheme.lastCheckedDate).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <p className="flex items-start gap-2 text-sm text-amber-700">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          {t(
            'यह पात्रता सांकेतिक है। अंतिम पात्रता सरकारी नियमों के अनुसार निर्धारित होती है। यहाँ प्रदर्शित जानकारी सत्यापित सरकारी नीति के रूप में प्रस्तुत नहीं की गई है।',
            'This eligibility is indicative only. Final eligibility is determined by government rules. Information displayed here is not presented as verified government policy.'
          )}
        </p>
      </div>

      <Link to="/eligibility" className="btn-outline inline-flex items-center gap-2">
        <Shield className="w-5 h-5" />
        {t('पात्रता जाँचें', 'Check Eligibility')}
      </Link>
    </div>
  );
}
