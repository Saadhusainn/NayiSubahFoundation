import { Phone, Mail, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';

export function Team() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const members = data.team_members.sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-sunrise-50 via-white to-trust-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('team.title')}</h1>
          <p className="text-xl text-gray-600">{isHi ? 'हमारी समर्पित टीम' : 'Our dedicated team'}</p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {members.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{isHi ? 'कोई सदस्य नहीं' : 'No team members yet'}</p>
          ) : (
            <div className="space-y-16">
              {members.map((m, idx) => (
                <div key={m.id} className={cn("grid lg:grid-cols-2 gap-8 lg:gap-12 items-center", idx % 2 === 1 && "lg:[direction:rtl] lg:*:[direction:ltr]")}>
                  <div>
                    {m.image_url ? (
                      <img src={m.image_url} alt={pick(m.name_en, m.name_hi)} className="rounded-2xl shadow-xl w-full aspect-[4/5] object-cover" loading="lazy" />
                    ) : (
                      <div className="rounded-2xl shadow-xl w-full aspect-[4/5] bg-gradient-to-br from-sunrise-200 to-trust-200 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">{m.name_en.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{pick(m.name_en, m.name_hi)}</h2>
                      <p className="text-xl text-sunrise-600 font-medium">{pick(m.role_en, m.role_hi)}</p>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{pick(m.bio_en, m.bio_hi)}</p>
                    {(pick(m.expertise_en, m.expertise_hi).length > 0) && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-3">{t('team.expertise')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {pick(m.expertise_en, m.expertise_hi).map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-trust-100 text-trust-700 rounded-full text-sm font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">{t('team.contact')}</h3>
                      <div className="space-y-2">
                        {m.phone && <a href={`tel:${m.phone}`} className="flex items-center gap-3 text-gray-600 hover:text-sunrise-600"><Phone className="w-5 h-5" />{m.phone}</a>}
                        {m.email && <a href={`mailto:${m.email}`} className="flex items-center gap-3 text-gray-600 hover:text-sunrise-600"><Mail className="w-5 h-5" />{m.email}</a>}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {m.social?.facebook && <a href={m.social.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 rounded-full flex items-center justify-center transition-colors"><Facebook className="w-5 h-5" /></a>}
                      {m.social?.twitter && <a href={m.social.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-sky-100 text-gray-600 hover:text-sky-500 rounded-full flex items-center justify-center transition-colors"><Twitter className="w-5 h-5" /></a>}
                      {m.social?.linkedin && <a href={m.social.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-700 rounded-full flex items-center justify-center transition-colors"><Linkedin className="w-5 h-5" /></a>}
                      {m.social?.instagram && <a href={m.social.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-100 hover:bg-pink-100 text-gray-600 hover:text-pink-600 rounded-full flex items-center justify-center transition-colors"><Instagram className="w-5 h-5" /></a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
