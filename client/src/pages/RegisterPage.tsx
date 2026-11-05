import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { UserPlus } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', pan: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError(t('पासवर्ड मेल नहीं खाते', 'Passwords do not match'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('पासवर्ड कम से कम 8 अक्षर का होना चाहिए', 'Password must be at least 8 characters'));
      return;
    }
    if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
      setError(t('अमान्य PAN प्रारूप', 'Invalid PAN format'));
      return;
    }
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone || undefined,
        pan: form.pan || undefined,
        password: form.password,
      });
      navigate('/dashboard');
    } catch (e: any) {
      setError(e.message || t('रजिस्ट्रेशन विफल', 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <UserPlus className="w-10 h-10 text-primary-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">{t('रजिस्टर करें', 'Register')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">{t('नाम', 'Name')} *</label>
            <input id="name" type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label htmlFor="email" className="label">{t('ईमेल', 'Email')} *</label>
            <input id="email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              className="input-field" required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="phone" className="label">{t('फ़ोन', 'Phone')}</label>
            <input id="phone" type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label htmlFor="pan" className="label">{t('PAN (वैकल्पिक)', 'PAN (optional)')}</label>
            <input id="pan" type="text" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              className="input-field" placeholder="ABCDE1234F" maxLength={10} />
          </div>
          <div>
            <label htmlFor="password" className="label">{t('पासवर्ड', 'Password')} *</label>
            <input id="password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
              className="input-field" required minLength={8} autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="label">{t('पासवर्ड पुष्टि', 'Confirm Password')} *</label>
            <input id="confirmPassword" type="password" value={form.confirmPassword}
              onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
              className="input-field" required autoComplete="new-password" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t('प्रतीक्षा करें...', 'Please wait...') : t('रजिस्टर करें', 'Register')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t('पहले से खाता है?', 'Already have an account?')}{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            {t('लॉगिन करें', 'Login')}
          </Link>
        </p>
      </div>
    </div>
  );
}
