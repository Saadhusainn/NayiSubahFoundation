import { Link } from 'react-router-dom';
import { Sun, Eye, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';

export function About() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const journey = data.journey_items.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-sunrise-50 via-white to-trust-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-sunrise-100 text-sunrise-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sun className="w-4 h-4" /><span>{t('nav.about')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">{isHi ? 'नयी सुबह फाउंडेशन' : 'Nayi Subah Foundation'}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{t('about.desc')}</p>
            </div>
            <div className="relative">
              <img src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800" alt="Team" className="rounded-2xl shadow-xl" loading="lazy" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-sunrise-500 to-sunrise-600 rounded-2xl p-8 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6"><Eye className="w-8 h-8" /></div>
            <h2 className="text-2xl font-bold mb-4">{t('about.vision')}</h2>
            <p className="text-sunrise-100 leading-relaxed">{t('about.vision.text')}</p>
            <ul className="mt-6 space-y-3">
              {[isHi ? 'सभी के लिए गुणवत्तापूर्ण शिक्षा' : 'Quality education for all', isHi ? 'सुलभ स्वास्थ्य सेवाएं' : 'Accessible healthcare', isHi ? 'सशक्त समुदाय' : 'Empowered communities'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-trust-500 to-trust-600 rounded-2xl p-8 text-white">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-6"><Target className="w-8 h-8" /></div>
            <h2 className="text-2xl font-bold mb-4">{t('about.mission')}</h2>
            <p className="text-trust-100 leading-relaxed">{t('about.mission.text')}</p>
            <ul className="mt-6 space-y-3">
              {[isHi ? 'स्वास्थ्य शिविरों का आयोजन' : 'Organizing health camps', isHi ? 'शैक्षिक सहायता' : 'Educational support', isHi ? 'सामुदायिक विकास' : 'Community development'].map((item, i) => (
                <li key={i} className="flex items-center gap-2"><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {journey.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">{t('about.journey')}</h2>
            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-sunrise-200 transform md:-translate-x-1/2" />
              <div className="space-y-8">
                {journey.map((m, i) => (
                  <div key={m.id} className={cn("relative flex items-center gap-6", i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse")}>
                    <div className={cn("flex-1 hidden md:block", i % 2 === 0 ? "text-right" : "text-left")}>
                      <div className="bg-white rounded-xl p-4 inline-block shadow-sm"><p className="text-gray-900 font-medium">{pick(m.event_en, m.event_hi)}</p></div>
                    </div>
                    <div className="relative z-10 w-8 h-8 bg-sunrise-500 rounded-full flex items-center justify-center text-white flex-shrink-0"><div className="w-3 h-3 bg-white rounded-full" /></div>
                    <div className="flex-1">
                      <span className="bg-sunrise-100 text-sunrise-700 px-3 py-1 rounded-full text-sm font-semibold">{m.year}</span>
                      <p className="text-gray-900 font-medium mt-2 md:hidden">{pick(m.event_en, m.event_hi)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-16 lg:py-24 bg-gradient-to-br from-sunrise-500 to-sunrise-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{isHi ? 'हमारी टीम से मिलें' : 'Meet Our Team'}</h2>
          <Link to="/team" className="inline-flex items-center gap-2 bg-white text-sunrise-600 px-6 py-3 rounded-lg font-semibold hover:bg-sunrise-50">
            {t('nav.team')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
