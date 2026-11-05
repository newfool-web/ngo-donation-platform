import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, isAdmin } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Check role after login to redirect
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        navigate(payload.role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (e: any) {
      setError(e.message || t('लॉगिन विफल', 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <LogIn className="w-10 h-10 text-primary-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-800">{t('लॉगिन', 'Login')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="label">{t('ईमेल', 'Email')}</label>
            <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" required autoComplete="email" />
          </div>
          <div>
            <label htmlFor="password" className="label">{t('पासवर्ड', 'Password')}</label>
            <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" required autoComplete="current-password" />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? t('प्रतीक्षा करें...', 'Please wait...') : t('लॉगिन', 'Login')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {t('खाता नहीं है?', "Don't have an account?")}{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            {t('रजिस्टर करें', 'Register')}
          </Link>
        </p>

        <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
          <p className="font-medium mb-1">Demo Credentials:</p>
          <p>Admin: admin@companya.org / admin123456</p>
          <p>Donor: rajesh@example.com / donor123456</p>
        </div>
      </div>
    </div>
  );
}
