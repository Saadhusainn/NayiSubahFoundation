import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export function Blog() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const [activeCat, setActiveCat] = useState<string | null>(null);

  const posts = data.blog_posts.filter(p => p.published).sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  const categories = [...new Set(posts.map(p => p.category))];
  const filtered = activeCat ? posts.filter(p => p.category === activeCat) : posts;

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-trust-50 via-white to-sunrise-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('blog.title')}</h1>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="sticky top-16 lg:top-20 z-40 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-2 justify-center">
            <button onClick={() => setActiveCat(null)} className={cn("px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2", !activeCat ? "bg-trust-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>
              <Tag className="w-4 h-4" />{isHi ? 'सभी' : 'All'}
            </button>
            {categories.map(c => (
              <button key={c} onClick={() => setActiveCat(c)} className={cn("px-4 py-2 rounded-full text-sm font-medium", activeCat === c ? "bg-trust-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>{c}</button>
            ))}
          </div>
        </section>
      )}

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{isHi ? 'कोई पोस्ट नहीं' : 'No posts yet'}</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(post => (
                <Link key={post.id} to={`/blog/${post.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.featured_image} alt={pick(post.title_en, post.title_hi)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs bg-sunrise-100 text-sunrise-700 px-3 py-1 rounded-full font-medium">{post.category}</span>
                      <span className="flex items-center gap-1 text-gray-500 text-sm"><Calendar className="w-4 h-4" />{format(new Date(post.published_at), 'dd MMM yyyy')}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-sunrise-600 line-clamp-2">{pick(post.title_en, post.title_hi)}</h2>
                    <p className="text-gray-600 line-clamp-3 mb-4">{pick(post.excerpt_en, post.excerpt_hi)}</p>
                    <span className="flex items-center gap-2 text-sunrise-600 font-medium">{t('blog.readMore')} <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
