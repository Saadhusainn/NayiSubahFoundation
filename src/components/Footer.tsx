import { Link } from 'react-router-dom';
import { Sun, MapPin, Phone, Mail, Facebook, Instagram, Youtube } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';

export function Footer() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const settings = data.site_settings;

  const quickLinks = [
    { to: '/', label: 'nav.home' },
    { to: '/about', label: 'nav.about' },
    { to: '/work', label: 'nav.work' },
    { to: '/gallery', label: 'nav.gallery' },
    { to: '/blog', label: 'nav.blog' },
    { to: '/contact', label: 'nav.contact' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-sunrise-400 to-sunrise-600 rounded-full flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className={cn("text-lg font-bold", isHi ? "font-hindi" : "font-english")}>
                {pick(settings.org_name_en, settings.org_name_hi)}
              </span>
            </div>
            <p className={cn("text-gray-400 text-sm leading-relaxed", isHi ? "font-hindi" : "font-english")}>
              {t('footer.about.text')}
            </p>
          </div>

          <div>
            <h4 className={cn("text-lg font-semibold mb-4", isHi ? "font-hindi" : "font-english")}>{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className={cn("text-gray-400 hover:text-sunrise-400 transition-colors text-sm", isHi ? "font-hindi" : "font-english")}>
                    {t(l.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={cn("text-lg font-semibold mb-4", isHi ? "font-hindi" : "font-english")}>{t('footer.contactInfo')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-sunrise-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm">{pick(settings.address_en, settings.address_hi)}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-sunrise-400 flex-shrink-0" />
                <a href={`tel:${settings.phone}`} className="text-gray-400 hover:text-white text-sm">{settings.phone}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-sunrise-400 flex-shrink-0" />
                <a href={`mailto:${settings.email}`} className="text-gray-400 hover:text-white text-sm">{settings.email}</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={cn("text-lg font-semibold mb-4", isHi ? "font-hindi" : "font-english")}>{t('footer.followUs')}</h4>
            <div className="flex gap-3 mb-6">
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-sunrise-500 rounded-full flex items-center justify-center transition-colors"><Facebook className="w-5 h-5" /></a>
              )}
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-sunrise-500 rounded-full flex items-center justify-center transition-colors"><Instagram className="w-5 h-5" /></a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-sunrise-500 rounded-full flex items-center justify-center transition-colors"><Youtube className="w-5 h-5" /></a>
              )}
              {!settings.facebook && !settings.instagram && !settings.youtube && (
                <p className="text-gray-500 text-sm">{isHi ? 'जल्द आ रहा है' : 'Coming soon'}</p>
              )}
            </div>
            <div className="rounded-lg overflow-hidden h-24">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=79.02625%2C28.8095%2C79.0325%2C28.815&layer=mapnik&marker=28.8115%2C79.0296"
                width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Location"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className={cn("text-gray-500 text-sm", isHi ? "font-hindi" : "font-english")}>{t('footer.copyright')}</p>
          <Link to="/admin" className="text-gray-600 hover:text-gray-400 text-sm">{t('nav.admin')}</Link>
        </div>
      </div>
    </footer>
  );
}
