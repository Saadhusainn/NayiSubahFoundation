import { Link } from 'react-router-dom';
import { Sun, ArrowRight, Calendar, MapPin, ChevronRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export function Home() {
  const { t, isHi, pick } = useLanguage();
  const { data, loading } = useSiteData();

  const blogPosts = data.blog_posts.filter(p => p.published).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()).slice(0, 3);
  const events = data.events.slice(0, 2);
  const stats = data.stats.sort((a, b) => a.sort_order - b.sort_order);
  const programs = data.programs.sort((a, b) => a.sort_order - b.sort_order);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sunrise-500" />
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sunrise-50 via-white to-trust-50 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-sunrise-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-trust-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slideUp">
              <div className="inline-flex items-center gap-2 bg-sunrise-100 text-sunrise-700 px-4 py-2 rounded-full text-sm font-medium">
                <Sun className="w-4 h-4" />
                <span>{isHi ? 'रामपुर, उत्तर प्रदेश' : 'Rampur, Uttar Pradesh'}</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {isHi ? 'नयी सुबह' : 'Nayi Subah'}<br />
                <span className="text-sunrise-500">{isHi ? 'फाउंडेशन' : 'Foundation'}</span>
              </h1>
              <p className="text-xl text-sunrise-600 font-medium">{t('hero.tagline')}</p>
              <p className="text-gray-600 text-lg leading-relaxed max-w-xl">{t('hero.mission')}</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/contact" className="inline-flex items-center gap-2 bg-sunrise-500 hover:bg-sunrise-600 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-sunrise-200">
                  {t('hero.cta.contact')}
                </Link>
                <Link to="/about" className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-200 shadow-sm">
                  {t('hero.cta.learn')} <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="relative animate-fadeIn">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <img src="https://i.ibb.co/rKdr5PDB/nsf.png?w=800" alt="Community Service" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {stats.length > 0 && (
        <section className="bg-gradient-to-r from-sunrise-500 to-sunrise-600 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map(s => (
                <div key={s.id} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-white mb-1">{s.value}</div>
                  <div className="text-sunrise-100">{pick(s.label_en, s.label_hi)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Programs */}
      {programs.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{isHi ? 'हमारे कार्यक्रम' : 'Our Programs'}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map(p => (
                <div key={p.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{pick(p.title_en, p.title_hi)}</h3>
                  <p className="text-gray-600 text-sm">{pick(p.description_en, p.description_hi)}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/work" className="inline-flex items-center gap-2 bg-sunrise-500 hover:bg-sunrise-600 text-white px-6 py-3 rounded-lg font-semibold">
                {isHi ? 'और देखें' : 'View All'} <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Events */}
      {events.length > 0 && (
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">{t('events.title')}</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {events.map(e => (
                <div key={e.id} className="bg-gradient-to-br from-sunrise-50 to-trust-50 rounded-xl p-6 border border-sunrise-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-sunrise-500 rounded-lg flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">{format(new Date(e.date), 'd')}</span>
                      <span className="text-xs uppercase">{format(new Date(e.date), 'MMM')}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{pick(e.title_en, e.title_hi)}</h3>
                      <p className="text-gray-600 text-sm mb-3">{pick(e.description_en, e.description_hi)}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{e.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{pick(e.location_en, e.location_hi)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog */}
      {blogPosts.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('blog.title')}</h2>
              <Link to="/blog" className="hidden sm:inline-flex items-center gap-2 text-sunrise-600 hover:text-sunrise-700 font-semibold">
                {isHi ? 'सभी देखें' : 'View All'} <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map(post => (
                <Link key={post.id} to={`/blog/${post.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.featured_image} alt={pick(post.title_en, post.title_hi)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-sunrise-100 text-sunrise-700 px-2 py-1 rounded-full">{post.category}</span>
                      <span className="text-xs text-gray-500">{format(new Date(post.published_at), 'dd MMM yyyy')}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-sunrise-600 transition-colors line-clamp-2">{pick(post.title_en, post.title_hi)}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{pick(post.excerpt_en, post.excerpt_hi)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-trust-600 to-trust-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{isHi ? 'हमारे साथ जुड़ें' : 'Join Our Cause'}</h2>
          <p className="text-trust-100 text-lg mb-8">{isHi ? 'आइए मिलकर समाज में सकारात्मक बदलाव लाएं।' : "Let's bring positive change in society together."}</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-white text-trust-700 px-6 py-3 rounded-lg font-semibold hover:bg-trust-50 transition-all">
            {t('nav.contact')} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
