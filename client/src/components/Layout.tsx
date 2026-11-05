import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import { Menu, X, Globe, User, LogOut, Phone, Heart } from 'lucide-react';

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const { lang, setLang, t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/', label: t('होम', 'Home') },
    { to: '/schemes', label: t('योजनाएं', 'Schemes') },
    { to: '/eligibility', label: t('पात्रता जाँचें', 'Check Eligibility') },
    { to: '/donate', label: t('दान करें', 'Donate') },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-warm-50">
      {/* Header */}
      <header className="bg-primary-700 text-white sticky top-0 z-50 shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6" aria-label="Main navigation">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
              <Heart className="w-6 h-6 text-terracotta-300" aria-hidden="true" />
              <span className="hidden sm:inline">{t('कंपनी A ट्रस्ट', 'Company A Trust')}</span>
              <span className="sm:hidden">{t('कंपनी A', 'Company A')}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-white/90 hover:text-white transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setLang(lang === 'hi' ? 'en' : 'hi')}
                className="flex items-center gap-1 text-white/80 hover:text-white text-sm px-2 py-1 rounded border border-white/30 hover:border-white/60 transition-colors"
                aria-label={lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              >
                <Globe className="w-4 h-4" aria-hidden="true" />
                {lang === 'hi' ? 'EN' : 'हिं'}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    className="flex items-center gap-1 text-white/90 hover:text-white text-sm"
                  >
                    <User className="w-4 h-4" aria-hidden="true" />
                    {user.name.split(' ')[0]}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label={t('लॉग आउट', 'Logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="text-white/90 hover:text-white text-sm font-medium">
                    {t('लॉगिन', 'Login')}
                  </Link>
                  <Link to="/register" className="bg-terracotta-500 hover:bg-terracotta-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
                    {t('रजिस्टर', 'Register')}
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-white/20 py-4 space-y-3">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block text-white/90 hover:text-white py-2 text-base"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-white/20" />
              <button
                onClick={() => { setLang(lang === 'hi' ? 'en' : 'hi'); setMenuOpen(false); }}
                className="flex items-center gap-2 text-white/80 hover:text-white py-2"
              >
                <Globe className="w-4 h-4" />
                {lang === 'hi' ? 'Switch to English' : 'हिंदी में बदलें'}
              </button>
              {user ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/dashboard'}
                    onClick={() => setMenuOpen(false)}
                    className="block text-white/90 hover:text-white py-2"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {isAdmin ? t('एडमिन डैशबोर्ड', 'Admin Dashboard') : t('मेरा डैशबोर्ड', 'My Dashboard')}
                    </span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-white/70 hover:text-white py-2">
                    <LogOut className="w-4 h-4" />
                    {t('लॉग आउट', 'Logout')}
                  </button>
                </>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-white/90 hover:text-white">
                    {t('लॉगिन', 'Login')}
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="bg-terracotta-500 text-white px-3 py-1.5 rounded-lg">
                    {t('रजिस्टर', 'Register')}
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-2">{t('कंपनी A चैरिटेबल ट्रस्ट', 'Company A Charitable Trust')}</h3>
              <p className="text-sm text-gray-400">
                {t(
                  'मध्य प्रदेश के 9 जिलों में महिला सशक्तिकरण और कल्याण',
                  "Women's empowerment and welfare across 9 districts of Madhya Pradesh"
                )}
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-2">{t('हेल्पलाइन', 'Helpline')}</h3>
              <p className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-terracotta-400" aria-hidden="true" />
                1800-XXX-XXXX
              </p>
              <p className="text-xs text-gray-500 mt-1">{t('(सोम-शनि, सुबह 9 - शाम 6)', '(Mon-Sat, 9 AM - 6 PM)')}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(
                  '⚠️ यह एक डेमो प्लेटफॉर्म है। यहाँ प्रदर्शित योजनाओं की जानकारी सांकेतिक है और सत्यापित सरकारी नीति के रूप में प्रस्तुत नहीं की गई है। दान प्रवाह परीक्षण मोड में है।',
                  '⚠️ This is a demo platform. Scheme information shown is illustrative and not presented as verified government policy. Donation flow is in test mode.'
                )}
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-4 text-center text-xs text-gray-500">
            © 2026 Company A Charitable Trust — {t('डेमो प्लेटफॉर्म', 'Demo Platform')}
          </div>
        </div>
      </footer>
    </div>
  );
}
