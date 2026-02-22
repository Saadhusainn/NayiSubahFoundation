import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  isHi: boolean;
  pick: <T>(en: T, hi: T) => T;
}

const tr: Record<string, Record<Language, string>> = {
  // Nav
  'nav.home': { en: 'Home', hi: 'होम' },
  'nav.about': { en: 'About Us', hi: 'हमारे बारे में' },
  'nav.work': { en: 'Our Work', hi: 'हमारा कार्य' },
  'nav.gallery': { en: 'Photo Gallery', hi: 'फोटो गैलरी' },
  'nav.blog': { en: 'Blog / News', hi: 'ब्लॉग / समाचार' },
  'nav.contact': { en: 'Contact Us', hi: 'संपर्क करें' },
  'nav.team': { en: 'Our Team', hi: 'हमारी टीम' },
  'nav.admin': { en: 'Admin', hi: 'एडमिन' },

  // Hero
  'hero.tagline': { en: 'A New Dawn of Hope & Service', hi: 'आशा और सेवा की एक नयी सुबह' },
  'hero.mission': { en: 'Dedicated to serving humanity through education, healthcare, and community development in Rampur, Uttar Pradesh.', hi: 'रामपुर, उत्तर प्रदेश में शिक्षा, स्वास्थ्य सेवा और सामुदायिक विकास के माध्यम से मानवता की सेवा के लिए समर्पित।' },
  'hero.cta.learn': { en: 'Learn More', hi: 'और जानें' },
  'hero.cta.contact': { en: 'Contact Us', hi: 'संपर्क करें' },

  // About
  'about.title': { en: 'About Nayi Subah Foundation', hi: 'नयी सुबह फाउंडेशन के बारे में' },
  'about.desc': { en: 'Nayi Subah Foundation is a non-profit social welfare organization based in Rampur, Uttar Pradesh. Our mission is to bring positive change in the lives of underprivileged communities.', hi: 'नयी सुबह फाउंडेशन रामपुर, उत्तर प्रदेश में स्थित एक गैर-लाभकारी सामाजिक कल्याण संगठन है। हमारा मिशन वंचित समुदायों के जीवन में सकारात्मक बदलाव लाना है।' },
  'about.vision': { en: 'Our Vision', hi: 'हमारा दृष्टिकोण' },
  'about.vision.text': { en: 'To create a society where every individual has access to quality education, healthcare, and opportunities for a dignified life.', hi: 'एक ऐसा समाज बनाना जहां हर व्यक्ति को गुणवत्तापूर्ण शिक्षा, स्वास्थ्य सेवा और सम्मानजनक जीवन के अवसर मिलें।' },
  'about.mission': { en: 'Our Mission', hi: 'हमारा मिशन' },
  'about.mission.text': { en: 'To empower communities through education, healthcare initiatives, and social welfare programs.', hi: 'शिक्षा, स्वास्थ्य पहल और सामाजिक कल्याण कार्यक्रमों के माध्यम से समुदायों को सशक्त बनाना।' },
  'about.journey': { en: 'Our Journey', hi: 'हमारी यात्रा' },

  // Gallery
  'gallery.title': { en: 'Photo Gallery', hi: 'फोटो गैलरी' },
  'gallery.all': { en: 'All Photos', hi: 'सभी फोटो' },

  // Blog
  'blog.title': { en: 'Latest News & Updates', hi: 'ताज़ा समाचार और अपडेट' },
  'blog.readMore': { en: 'Read More', hi: 'और पढ़ें' },
  'blog.share': { en: 'Share this article', hi: 'इस लेख को साझा करें' },
  'blog.back': { en: 'Back to Blog', hi: 'ब्लॉग पर वापस जाएं' },

  // Events
  'events.title': { en: 'Upcoming Events', hi: 'आगामी कार्यक्रम' },

  // Team
  'team.title': { en: 'Our Team', hi: 'हमारी टीम' },
  'team.expertise': { en: 'Areas of Expertise', hi: 'विशेषज्ञता के क्षेत्र' },
  'team.contact': { en: 'Contact Information', hi: 'संपर्क जानकारी' },

  // Contact
  'contact.title': { en: 'Contact Us', hi: 'संपर्क करें' },
  'contact.subtitle': { en: 'Get in touch with us.', hi: 'हमसे संपर्क करें।' },
  'contact.send': { en: 'Send Message', hi: 'संदेश भेजें' },
  'contact.success': { en: 'Thank you! We will get back to you soon.', hi: 'धन्यवाद! हम जल्द ही आपसे संपर्क करेंगे।' },
  'contact.directions': { en: 'Get Directions', hi: 'दिशा-निर्देश प्राप्त करें' },
  'contact.address': { en: 'Address', hi: 'पता' },
  'contact.phone': { en: 'Phone', hi: 'फोन' },
  'contact.email': { en: 'Email', hi: 'ईमेल' },
  'contact.hours': { en: 'Office Hours', hi: 'कार्यालय समय' },
  'contact.hours.val': { en: 'Mon - Sat: 10 AM - 6 PM', hi: 'सोम - शनि: सुबह 10 - शाम 6' },

  // Footer
  'footer.about.text': { en: 'Nayi Subah Foundation is committed to serving the community through social welfare initiatives in Rampur, UP.', hi: 'नयी सुबह फाउंडेशन रामपुर, उ.प्र. में सामाजिक कल्याण पहलों के माध्यम से समुदाय की सेवा के लिए प्रतिबद्ध है।' },
  'footer.quickLinks': { en: 'Quick Links', hi: 'त्वरित लिंक' },
  'footer.contactInfo': { en: 'Contact Info', hi: 'संपर्क जानकारी' },
  'footer.followUs': { en: 'Follow Us', hi: 'हमें फॉलो करें' },
  'footer.copyright': { en: '© 2024 Nayi Subah Foundation. All rights reserved.', hi: '© 2024 नयी सुबह फाउंडेशन। सर्वाधिकार सुरक्षित।' },

  // Common
  'common.name': { en: 'Name', hi: 'नाम' },
  'common.email': { en: 'Email', hi: 'ईमेल' },
  'common.phone': { en: 'Phone', hi: 'फोन' },
  'common.subject': { en: 'Subject', hi: 'विषय' },
  'common.message': { en: 'Message', hi: 'संदेश' },
  'common.save': { en: 'Save Changes', hi: 'सेव करें' },
  'common.cancel': { en: 'Cancel', hi: 'रद्द करें' },
  'common.delete': { en: 'Delete', hi: 'हटाएं' },
  'common.edit': { en: 'Edit', hi: 'संपादित करें' },
  'common.add': { en: 'Add', hi: 'जोड़ें' },
  'common.loading': { en: 'Loading...', hi: 'लोड हो रहा है...' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const s = localStorage.getItem('nayi_subah_lang');
    return (s === 'en' || s === 'hi') ? s : 'hi';
  });

  useEffect(() => {
    localStorage.setItem('nayi_subah_lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Language) => setLangState(l);

  const t = (key: string): string => {
    const entry = tr[key];
    if (!entry) return key;
    return entry[lang] || entry['en'] || key;
  };

  const pick = <T,>(en: T, hi: T): T => lang === 'hi' ? hi : en;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isHi: lang === 'hi', pick }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
