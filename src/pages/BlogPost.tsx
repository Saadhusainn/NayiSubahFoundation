import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Share2, Facebook, Twitter, Linkedin, Copy, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';

export function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const [copied, setCopied] = useState(false);
  const post = data.blog_posts.find((p: { id: string }) => p.id === id) || null;

  const shareUrl = window.location.href;
  const handleCopy = async () => { try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch (_e) { /* */ } };

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!post) return (
    <div className={cn("min-h-screen flex items-center justify-center", isHi ? "font-hindi" : "font-english")}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{isHi ? 'पोस्ट नहीं मिली' : 'Post not found'}</h1>
        <Link to="/blog" className="text-sunrise-600 font-medium inline-flex items-center gap-2"><ArrowLeft className="w-4 h-4" />{t('blog.back')}</Link>
      </div>
    </div>
  );

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      {post.featured_image && (
        <section className="relative h-[50vh] min-h-[400px]">
          <img src={post.featured_image} alt={pick(post.title_en, post.title_hi)} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4"><ArrowLeft className="w-4 h-4" />{t('blog.back')}</Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-sm bg-sunrise-500 text-white px-3 py-1 rounded-full">{post.category}</span>
                <span className="flex items-center gap-1 text-white/80 text-sm"><Calendar className="w-4 h-4" />{format(new Date(post.published_at), 'dd MMMM yyyy')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">{pick(post.title_en, post.title_hi)}</h1>
            </div>
          </div>
        </section>
      )}

      <section className="py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 grid lg:grid-cols-[1fr_200px] gap-8">
          <article>
            {!post.featured_image && (
              <div className="mb-8">
                <Link to="/blog" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4"><ArrowLeft className="w-4 h-4" />{t('blog.back')}</Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{pick(post.title_en, post.title_hi)}</h1>
                <div className="flex items-center gap-3"><span className="text-sm bg-sunrise-100 text-sunrise-700 px-3 py-1 rounded-full">{post.category}</span><span className="text-sm text-gray-500">{format(new Date(post.published_at), 'dd MMM yyyy')}</span></div>
              </div>
            )}
            <div className="prose-content text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: pick(post.content_en, post.content_hi) }} />
          </article>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium"><Share2 className="w-4 h-4" />{t('blog.share')}</div>
              <div className="flex flex-col gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-blue-600"><Facebook className="w-5 h-5" /><span className="text-sm">Facebook</span></a>
                <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-sky-50 text-sky-500"><Twitter className="w-5 h-5" /><span className="text-sm">Twitter</span></a>
                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 text-blue-700"><Linkedin className="w-5 h-5" /><span className="text-sm">LinkedIn</span></a>
                <button onClick={handleCopy} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                  <span className="text-sm">{copied ? (isHi ? 'कॉपी हो गया!' : 'Copied!') : (isHi ? 'लिंक कॉपी करें' : 'Copy Link')}</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
