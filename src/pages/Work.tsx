import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';

export function Work() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const programs = data.programs.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-trust-50 via-white to-sunrise-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{isHi ? 'हमारे कार्यक्रम' : 'Our Programs & Initiatives'}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{isHi ? 'हम विभिन्न क्षेत्रों में समुदाय की सेवा करते हैं।' : 'We serve the community across various sectors.'}</p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {programs.length === 0 ? (
            <p className="text-center text-gray-500">{isHi ? 'कोई कार्यक्रम नहीं जोड़ा गया' : 'No programs added yet.'}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map(p => (
                <div key={p.id} className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{pick(p.title_en, p.title_hi)}</h2>
                  <p className="text-gray-600">{pick(p.description_en, p.description_hi)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{isHi ? 'हमसे जुड़ें' : 'Get Involved'}</h2>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-sunrise-500 hover:bg-sunrise-600 text-white px-6 py-3 rounded-lg font-semibold">
            {t('nav.contact')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
