import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, Sun } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/utils/cn';

export function Header() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t, isHi } = useLanguage();
  const loc = useLocation();

  const links = [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/work', label: 'nav.work' },
    { to: '/gallery', label: 'nav.gallery' },
    { to: '/blog', label: 'nav.blog' },
    { to: '/team', label: 'nav.team' },
    { to: '/contact', label: 'nav.contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-sunrise-400 to-sunrise-600 rounded-full flex items-center justify-center shadow-lg">
              <Sun className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
            </div>
            <div className={cn("flex flex-col", isHi ? "font-hindi" : "font-english")}>
              <span className="text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                {isHi ? 'नयी सुबह' : 'Nayi Subah'}
              </span>
              <span className="text-xs lg:text-sm text-sunrise-600 font-medium leading-tight">
                {isHi ? 'फाउंडेशन' : 'Foundation'}
              </span>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isHi ? "font-hindi" : "font-english",
                  loc.pathname === l.to ? "bg-sunrise-100 text-sunrise-700" : "text-gray-700 hover:bg-gray-100 hover:text-sunrise-600"
                )}
              >
                {t(l.label)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-trust-50 hover:bg-trust-100 text-trust-700 transition-colors text-sm font-medium"
            >
              <Globe className="w-4 h-4" />
              <span>{isHi ? 'EN' : 'हिं'}</span>
            </button>
            <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-gray-100 py-4 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "px-4 py-3 rounded-lg font-medium transition-colors",
                    isHi ? "font-hindi" : "font-english",
                    loc.pathname === l.to ? "bg-sunrise-100 text-sunrise-700" : "text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {t(l.label)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
