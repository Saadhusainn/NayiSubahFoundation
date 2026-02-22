import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteData } from '@/contexts/DataContext';
import { cn } from '@/utils/cn';
import { insertContactMessage } from '@/lib/supabase';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  subject: z.string().min(3),
  message: z.string().min(10),
});
type FormData = z.infer<typeof schema>;

export function Contact() {
  const { t, isHi, pick } = useLanguage();
  const { data } = useSiteData();
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const settings = data.site_settings;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const lat = 28.811472;
  const lng = 79.029861;
  const gUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  const onSubmit = async (d: FormData) => {
    setLoading(true);
    setError('');
    try {
      await insertContactMessage({ name: d.name, email: d.email, phone: d.phone, subject: d.subject, message: d.message });
      setDone(true);
    } catch (err) {
      setError(isHi ? 'संदेश भेजने में त्रुटि। कृपया पुनः प्रयास करें।' : 'Error sending message. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const infoCards = [
    { icon: MapPin, label: t('contact.address'), value: pick(settings.address_en, settings.address_hi), link: gUrl },
    { icon: Phone, label: t('contact.phone'), value: settings.phone, link: `tel:${settings.phone}` },
    { icon: Mail, label: t('contact.email'), value: settings.email, link: `mailto:${settings.email}` },
    { icon: Clock, label: t('contact.hours'), value: t('contact.hours.val'), link: '' },
  ];

  return (
    <div className={cn("min-h-screen", isHi ? "font-hindi" : "font-english")}>
      <section className="bg-gradient-to-br from-trust-50 via-white to-sunrise-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{t('contact.title')}</h1>
          <p className="text-xl text-gray-600">{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          <div>
            {done ? (
              <div className="bg-green-50 rounded-2xl p-8 text-center animate-slideUp">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8 text-green-500" /></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{isHi ? 'संदेश भेजा गया!' : 'Message Sent!'}</h2>
                <p className="text-gray-600">{t('contact.success')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.name')} *</label>
                    <input {...register('name')} className={cn("w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sunrise-500", errors.name ? "border-red-300" : "border-gray-200")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.email')} *</label>
                    <input type="email" {...register('email')} className={cn("w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sunrise-500", errors.email ? "border-red-300" : "border-gray-200")} />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.phone')} *</label>
                    <input type="tel" {...register('phone')} className={cn("w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sunrise-500", errors.phone ? "border-red-300" : "border-gray-200")} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.subject')} *</label>
                    <input {...register('subject')} className={cn("w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sunrise-500", errors.subject ? "border-red-300" : "border-gray-200")} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.message')} *</label>
                  <textarea {...register('message')} rows={5} className={cn("w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-sunrise-500 resize-none", errors.message ? "border-red-300" : "border-gray-200")} />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full bg-sunrise-500 hover:bg-sunrise-600 disabled:bg-sunrise-300 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-5 h-5 animate-spin" />{isHi ? 'भेजा जा रहा है...' : 'Sending...'}</> : <><Send className="w-5 h-5" />{t('contact.send')}</>}
                </button>
              </form>
            )}
          </div>
          <div className="space-y-8">
            <div className="grid sm:grid-cols-2 gap-4">
              {infoCards.map((c, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-sunrise-100 rounded-xl flex items-center justify-center flex-shrink-0"><c.icon className="w-6 h-6 text-sunrise-600" /></div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{c.label}</p>
                      {c.link ? <a href={c.link} target={c.link.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-gray-900 font-medium hover:text-sunrise-600 break-words text-sm">{c.value}</a> : <p className="text-gray-900 font-medium text-sm">{c.value}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-100 rounded-2xl overflow-hidden">
              <div className="aspect-video">
                <iframe src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.005}%2C${lng + 0.01}%2C${lat + 0.005}&layer=mapnik&marker=${lat}%2C${lng}`} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Location" />
              </div>
              <div className="p-4 bg-white flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{isHi ? 'नयी सुबह फाउंडेशन' : 'Nayi Subah Foundation'}</p>
                  <p className="text-sm text-gray-500">{isHi ? 'रामपुर, उ.प्र.' : 'Rampur, UP'}</p>
                </div>
                <a href={gUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-trust-500 hover:bg-trust-600 text-white px-4 py-2 rounded-lg font-medium text-sm">
                  {t('contact.directions')} <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
