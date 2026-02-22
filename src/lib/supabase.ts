import { createClient, SupabaseClient, Session } from '@supabase/supabase-js';

// ─── Supabase Client ────────────────────────────────────────────────────────
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const isSupabaseConfigured = (): boolean => Boolean(supabase);

// ─── Types ──────────────────────────────────────────────────────────────────
export interface GalleryCategory {
  id: string;
  name_en: string;
  name_hi: string;
  sort_order: number;
  created_at: string;
}

export interface GalleryImage {
  id: string;
  category_id: string;
  url: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  sort_order: number;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title_en: string;
  title_hi: string;
  excerpt_en: string;
  excerpt_hi: string;
  content_en: string;
  content_hi: string;
  featured_image: string;
  category: string;
  published: boolean;
  published_at: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  name_en: string;
  name_hi: string;
  role_en: string;
  role_hi: string;
  bio_en: string;
  bio_hi: string;
  phone: string;
  email: string;
  image_url: string;
  expertise_en: string[];
  expertise_hi: string[];
  social: { facebook?: string; twitter?: string; linkedin?: string; instagram?: string };
  sort_order: number;
}

export interface AppEvent {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  date: string;
  time: string;
  location_en: string;
  location_hi: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  created_at: string;
}

export interface SiteSettings {
  org_name_en: string;
  org_name_hi: string;
  email: string;
  phone: string;
  phone2: string;
  address_en: string;
  address_hi: string;
  facebook: string;
  twitter: string;
  instagram: string;
  youtube: string;
}

export interface JourneyItem {
  id: string;
  year: string;
  event_en: string;
  event_hi: string;
  sort_order: number;
}

export interface StatItem {
  id: string;
  value: string;
  label_en: string;
  label_hi: string;
  sort_order: number;
}

export interface Program {
  id: string;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  icon: string;
  color: string;
  sort_order: number;
}

export interface SiteData {
  gallery_categories: GalleryCategory[];
  gallery_images: GalleryImage[];
  blog_posts: BlogPost[];
  team_members: TeamMember[];
  events: AppEvent[];
  contact_messages: ContactMessage[];
  site_settings: SiteSettings;
  journey_items: JourneyItem[];
  stats: StatItem[];
  programs: Program[];
}

// ─── Auth helpers (Supabase Auth only — no localStorage tricks) ─────────────
export async function signIn(email: string, password: string): Promise<{ session: Session | null; error: string | null }> {
  if (!supabase) return { session: null, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.' };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { session: null, error: error.message };
  return { session: data.session, error: null };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── Database helpers (all go through Supabase — no localStorage DB) ────────

const DEFAULT_SETTINGS: SiteSettings = {
  org_name_en: 'Nayi Subah Foundation',
  org_name_hi: 'नयी सुबह फाउंडेशन',
  email: 'nayisubahfoundation@gmail.com',
  phone: '+917310748827',
  phone2: '+918218129845',
  address_en: 'Rampur, Uttar Pradesh, India - 244901',
  address_hi: 'रामपुर, उत्तर प्रदेश, भारत - 244901',
  facebook: '',
  twitter: '',
  instagram: '',
  youtube: '',
};

// Fetch all site data from Supabase
export async function fetchSiteData(): Promise<SiteData> {
  if (!supabase) {
    return getEmptyData();
  }

  const [
    { data: cats },
    { data: imgs },
    { data: posts },
    { data: members },
    { data: events },
    { data: messages },
    { data: settings },
    { data: journey },
    { data: stats },
    { data: programs },
  ] = await Promise.all([
    supabase.from('gallery_categories').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
    supabase.from('blog_posts').select('*').order('published_at', { ascending: false }),
    supabase.from('team_members').select('*').order('sort_order'),
    supabase.from('events').select('*').order('date'),
    supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
    supabase.from('site_settings').select('*'),
    supabase.from('journey_items').select('*').order('sort_order'),
    supabase.from('stats').select('*').order('sort_order'),
    supabase.from('programs').select('*').order('sort_order'),
  ]);

  // Convert site_settings rows into object
  const settingsObj = { ...DEFAULT_SETTINGS };
  if (settings) {
    for (const row of settings) {
      if (row.key in settingsObj) {
        (settingsObj as Record<string, string>)[row.key] = row.value || '';
      }
    }
  }

  return {
    gallery_categories: cats || [],
    gallery_images: imgs || [],
    blog_posts: posts || [],
    team_members: (members || []).map(m => ({
      ...m,
      expertise_en: m.expertise_en || [],
      expertise_hi: m.expertise_hi || [],
      social: m.social || {},
    })),
    events: events || [],
    contact_messages: messages || [],
    site_settings: settingsObj,
    journey_items: journey || [],
    stats: stats || [],
    programs: programs || [],
  };
}

// Fetch ONLY published data (for public pages — respects RLS)
export async function fetchPublicData(): Promise<SiteData> {
  if (!supabase) return getEmptyData();

  const [
    { data: cats },
    { data: imgs },
    { data: posts },
    { data: members },
    { data: events },
    { data: settings },
    { data: journey },
    { data: stats },
    { data: programs },
  ] = await Promise.all([
    supabase.from('gallery_categories').select('*').order('sort_order'),
    supabase.from('gallery_images').select('*').order('sort_order'),
    supabase.from('blog_posts').select('*').eq('published', true).order('published_at', { ascending: false }),
    supabase.from('team_members').select('*').order('sort_order'),
    supabase.from('events').select('*').order('date'),
    supabase.from('site_settings').select('*'),
    supabase.from('journey_items').select('*').order('sort_order'),
    supabase.from('stats').select('*').order('sort_order'),
    supabase.from('programs').select('*').order('sort_order'),
  ]);

  const settingsObj = { ...DEFAULT_SETTINGS };
  if (settings) {
    for (const row of settings) {
      if (row.key in settingsObj) {
        (settingsObj as Record<string, string>)[row.key] = row.value || '';
      }
    }
  }

  return {
    gallery_categories: cats || [],
    gallery_images: imgs || [],
    blog_posts: posts || [],
    team_members: (members || []).map(m => ({
      ...m,
      expertise_en: m.expertise_en || [],
      expertise_hi: m.expertise_hi || [],
      social: m.social || {},
    })),
    events: events || [],
    contact_messages: [],
    site_settings: settingsObj,
    journey_items: journey || [],
    stats: stats || [],
    programs: programs || [],
  };
}

// ─── CRUD operations (requires authenticated session) ───────────────────────

// GALLERY
export async function upsertCategory(cat: GalleryCategory) {
  if (!supabase) return;
  await supabase.from('gallery_categories').upsert(cat);
}
export async function deleteCategory(id: string) {
  if (!supabase) return;
  await supabase.from('gallery_images').delete().eq('category_id', id);
  await supabase.from('gallery_categories').delete().eq('id', id);
}
export async function upsertImage(img: GalleryImage) {
  if (!supabase) return;
  await supabase.from('gallery_images').upsert(img);
}
export async function deleteImage(id: string) {
  if (!supabase) return;
  await supabase.from('gallery_images').delete().eq('id', id);
}

// BLOG
export async function upsertBlogPost(post: BlogPost) {
  if (!supabase) return;
  await supabase.from('blog_posts').upsert(post);
}
export async function deleteBlogPost(id: string) {
  if (!supabase) return;
  await supabase.from('blog_posts').delete().eq('id', id);
}

// TEAM
export async function upsertTeamMember(member: TeamMember) {
  if (!supabase) return;
  await supabase.from('team_members').upsert(member);
}
export async function deleteTeamMember(id: string) {
  if (!supabase) return;
  await supabase.from('team_members').delete().eq('id', id);
}

// EVENTS
export async function upsertEvent(event: AppEvent) {
  if (!supabase) return;
  await supabase.from('events').upsert(event);
}
export async function deleteEvent(id: string) {
  if (!supabase) return;
  await supabase.from('events').delete().eq('id', id);
}

// JOURNEY
export async function upsertJourneyItem(item: JourneyItem) {
  if (!supabase) return;
  await supabase.from('journey_items').upsert(item);
}
export async function deleteJourneyItem(id: string) {
  if (!supabase) return;
  await supabase.from('journey_items').delete().eq('id', id);
}

// STATS
export async function upsertStat(stat: StatItem) {
  if (!supabase) return;
  await supabase.from('stats').upsert(stat);
}
export async function deleteStat(id: string) {
  if (!supabase) return;
  await supabase.from('stats').delete().eq('id', id);
}

// PROGRAMS
export async function upsertProgram(program: Program) {
  if (!supabase) return;
  await supabase.from('programs').upsert(program);
}
export async function deleteProgram(id: string) {
  if (!supabase) return;
  await supabase.from('programs').delete().eq('id', id);
}

// CONTACT MESSAGES
export async function insertContactMessage(msg: { name: string; email: string; phone: string; subject: string; message: string }) {
  if (!supabase) return;
  await supabase.from('contact_messages').insert({ ...msg, status: 'new' });
}
export async function updateMessageStatus(id: string, status: 'new' | 'read' | 'replied') {
  if (!supabase) return;
  await supabase.from('contact_messages').update({ status }).eq('id', id);
}
export async function deleteContactMessage(id: string) {
  if (!supabase) return;
  await supabase.from('contact_messages').delete().eq('id', id);
}

// SETTINGS
export async function saveSiteSettings(settings: SiteSettings) {
  if (!supabase) return;
  const rows = Object.entries(settings).map(([key, value]) => ({ key, value: String(value) }));
  await supabase.from('site_settings').upsert(rows);
}

// STORAGE — upload image to Supabase Storage bucket "media"
export async function uploadImage(file: File, path: string): Promise<string | null> {
  if (!supabase) return null;
  const { error } = await supabase.storage.from('media').upload(path, file, { upsert: true });
  if (error) { console.error('Upload error:', error); return null; }
  const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Empty data (fallback when Supabase is not configured) ──────────────────
function getEmptyData(): SiteData {
  return {
    gallery_categories: [],
    gallery_images: [],
    blog_posts: [],
    team_members: [],
    events: [],
    contact_messages: [],
    site_settings: DEFAULT_SETTINGS,
    journey_items: [],
    stats: [],
    programs: [],
  };
}
