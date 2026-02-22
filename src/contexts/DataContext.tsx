import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { fetchPublicData, type SiteData } from '@/lib/supabase';

interface DataContextType {
  data: SiteData;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultSettings = {
  org_name_en: 'Nayi Subah Foundation',
  org_name_hi: 'नयी सुबह फाउंडेशन',
  email: 'nayisubahfoundation@gmail.com',
  phone: '+917310748827',
  phone2: '+918218129845',
  address_en: 'Rampur, Uttar Pradesh, India - 244901',
  address_hi: 'रामपुर, उत्तर प्रदेश, भारत - 244901',
  facebook: '', twitter: '', instagram: '', youtube: '',
};

const emptyData: SiteData = {
  gallery_categories: [],
  gallery_images: [],
  blog_posts: [],
  team_members: [],
  events: [],
  contact_messages: [],
  site_settings: defaultSettings,
  journey_items: [],
  stats: [],
  programs: [],
};

const DataContext = createContext<DataContextType>({
  data: emptyData,
  loading: true,
  refresh: async () => {},
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<SiteData>(emptyData);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const d = await fetchPublicData();
      setData(d);
    } catch (err) {
      console.error('Failed to fetch site data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DataContext.Provider value={{ data, loading, refresh }}>
      {children}
    </DataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(DataContext);
}
