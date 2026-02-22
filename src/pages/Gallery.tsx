import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';
import type { GalleryImage } from '@/lib/supabase';

export function Gallery() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);
  const [lbIdx, setLbIdx] = useState(0);

  const cats = data.gallery_categories.sort((a, b) => a.sort_order - b.sort_order);
  const imgs = activeCat ? data.gallery_images.filter(i => i.category_id === activeCat) : data.gallery_images;
  const sorted = imgs.sort((a, b) => a.sort_order - b.sort_order);

  const openLb = (img: GalleryImage) => { const idx = sorted.findIndex(i => i.id === img.id); setLbIdx(idx); setLightbox(img); document.body.style.overflow = 'hidden'; };
  const closeLb = () => { setLightbox(null); document.body.style.overflow = ''; };
  const navLb = (dir: 'p' | 'n') => { const ni = dir === 'n' ? (lbIdx + 1) % sorted.length : (lbIdx - 1 + sorted.length) % sorted.length; setLbIdx(ni); setLightbox(sorted[ni]); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (!lightbox) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') navLb('p'); if (e.key === 'ArrowRight') navLb('n'); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-sunrise-50 via-white to-trust-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('gallery.title')}</h1>
        </div>
      </section>

      {cats.length > 0 && (
        <section className="sticky top-16 lg:top-20 z-40 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-2 justify-center">
            <button onClick={() => setActiveCat(null)} className={cn("px-4 py-2 rounded-full text-sm font-medium", !activeCat ? "bg-sunrise-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>{t('gallery.all')}</button>
            {cats.map(c => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn("px-4 py-2 rounded-full text-sm font-medium", activeCat === c.id ? "bg-sunrise-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200")}>{pick(c.name_en, c.name_hi)}</button>
            ))}
          </div>
        </section>
      )}

      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          {sorted.length === 0 ? (
            <p className="text-center text-gray-500 py-16">{isHi ? 'कोई फोटो नहीं' : 'No photos yet'}</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sorted.map(img => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 cursor-pointer" onClick={() => openLb(img)}>
                  <img src={img.url} alt={pick(img.title_en, img.title_hi)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center"><div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"><ZoomIn className="w-6 h-6 text-white" /></div></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4"><h3 className="text-white font-medium text-sm truncate">{pick(img.title_en, img.title_hi)}</h3></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLb}>
          <button onClick={closeLb} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"><X className="w-6 h-6" /></button>
          {sorted.length > 1 && (<>
            <button onClick={e => { e.stopPropagation(); navLb('p'); }} className="absolute left-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"><ChevronLeft className="w-6 h-6" /></button>
            <button onClick={e => { e.stopPropagation(); navLb('n'); }} className="absolute right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white"><ChevronRight className="w-6 h-6" /></button>
          </>)}
          <div className="max-w-4xl max-h-[80vh] mx-4" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={pick(lightbox.title_en, lightbox.title_hi)} className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto" />
            <div className="mt-4 text-center text-white">
              <h3 className="text-lg font-medium">{pick(lightbox.title_en, lightbox.title_hi)}</h3>
              {pick(lightbox.description_en, lightbox.description_hi) && <p className="text-gray-300 mt-1">{pick(lightbox.description_en, lightbox.description_hi)}</p>}
              <p className="text-gray-500 text-sm mt-2">{lbIdx + 1} / {sorted.length}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
