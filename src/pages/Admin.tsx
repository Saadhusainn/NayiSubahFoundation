import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Image, FileText, Users, MessageSquare,
  Calendar, Settings, LogOut, Menu, X, Trash2, Plus, Save,
  Lock, Eye, EyeOff, Milestone, BarChart3, Briefcase,
  Loader2, AlertTriangle, Upload
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  supabase, signIn, signOut, getSession,
  fetchSiteData, uploadImage,
  upsertCategory, deleteCategory, upsertImage, deleteImage,
  upsertBlogPost, deleteBlogPost,
  upsertTeamMember, deleteTeamMember,
  upsertEvent, deleteEvent,
  upsertJourneyItem, deleteJourneyItem,
  upsertStat, deleteStat,
  upsertProgram, deleteProgram,
  updateMessageStatus, deleteContactMessage,
  saveSiteSettings,
  type SiteData, type GalleryCategory, type GalleryImage,
  type BlogPost, type TeamMember, type AppEvent,
  type JourneyItem, type StatItem, type Program
} from '@/lib/supabase';

type Section = 'overview' | 'gallery' | 'blog' | 'team' | 'messages' | 'events' | 'journey' | 'stats' | 'programs' | 'settings';

export function Admin() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [section, setSection] = useState<Section>('overview');
  const [sidebar, setSidebar] = useState(false);

  // Check existing session on mount
  useEffect(() => {
    (async () => {
      const session = await getSession();
      if (session) setAuthed(true);
      setChecking(false);
    })();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    if (!supabase) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut();
    setAuthed(false);
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 className="w-8 h-8 animate-spin text-sunrise-500" />
      </div>
    );
  }

  if (!authed) {
    return <LoginScreen onSuccess={() => setAuthed(true)} />;
  }

  const menus: { id: Section; icon: typeof LayoutDashboard; label: string }[] = [
    { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { id: 'gallery', icon: Image, label: 'Gallery' },
    { id: 'blog', icon: FileText, label: 'Blog' },
    { id: 'team', icon: Users, label: 'Team' },
    { id: 'events', icon: Calendar, label: 'Events' },
    { id: 'journey', icon: Milestone, label: 'Journey' },
    { id: 'stats', icon: BarChart3, label: 'Stats' },
    { id: 'programs', icon: Briefcase, label: 'Programs' },
    { id: 'messages', icon: MessageSquare, label: 'Messages' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="lg:hidden bg-white border-b p-4 flex items-center justify-between">
        <button onClick={() => setSidebar(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Menu className="w-6 h-6" /></button>
        <h1 className="font-semibold">Admin Panel</h1>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg text-red-600"><LogOut className="w-5 h-5" /></button>
      </div>
      <div className="flex">
        <aside className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:translate-x-0 lg:static", sidebar ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex flex-col h-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <button onClick={() => setSidebar(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menus.map(m => (
                <button key={m.id} onClick={() => { setSection(m.id); setSidebar(false); }} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left", section === m.id ? "bg-sunrise-100 text-sunrise-700" : "text-gray-600 hover:bg-gray-100")}>
                  <m.icon className="w-5 h-5" /><span className="font-medium text-sm">{m.label}</span>
                </button>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg"><LogOut className="w-5 h-5" /><span className="font-medium">Logout</span></button>
            </div>
          </div>
        </aside>
        {sidebar && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebar(false)} />}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto min-h-screen">
          {section === 'overview' && <OverviewPanel />}
          {section === 'gallery' && <GalleryPanel />}
          {section === 'blog' && <BlogPanel />}
          {section === 'team' && <TeamPanel />}
          {section === 'events' && <EventsPanel />}
          {section === 'journey' && <JourneyPanel />}
          {section === 'stats' && <StatsPanel />}
          {section === 'programs' && <ProgramsPanel />}
          {section === 'messages' && <MessagesPanel />}
          {section === 'settings' && <SettingsPanel />}
        </main>
      </div>
    </div>
  );
}

/* ────────── LOGIN SCREEN ────────── */
function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
      setLoading(false);
      return;
    }

    const { error: err } = await signIn(email, pw);
    if (err) {
      setError(err === 'Invalid login credentials'
        ? 'Invalid email or password. Only authorized admins can login.'
        : err
      );
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-sunrise-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-sunrise-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-2">Only authorized administrators can access this panel</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sunrise-500 focus:border-sunrise-500"
              placeholder="admin@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sunrise-500 focus:border-sunrise-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sunrise-500 hover:bg-sunrise-600 disabled:bg-sunrise-300 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-6 text-center">
          Admin users are managed in Supabase → Authentication → Users
        </p>
      </div>
    </div>
  );
}

/* ────────── useAdminData hook ────────── */
function useAdminData() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchSiteData();
      setData(d);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, refresh };
}

/* ────────── Toast / Status indicator ────────── */
function StatusBanner({ status }: { status: 'saving' | 'saved' | 'error' | null }) {
  if (!status) return null;
  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium",
      status === 'saving' && "bg-blue-100 text-blue-700",
      status === 'saved' && "bg-green-100 text-green-700",
      status === 'error' && "bg-red-100 text-red-700",
    )}>
      {status === 'saving' && <><Loader2 className="w-4 h-4 animate-spin" />Saving to database...</>}
      {status === 'saved' && <><Save className="w-4 h-4" />Changes applied successfully!</>}
      {status === 'error' && <><AlertTriangle className="w-4 h-4" />Error saving changes</>}
    </div>
  );
}

/* ────────── Image Upload Helper ────────── */
function ImageUpload({ onUpload, folder }: { onUpload: (url: string) => void; folder: string }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const path = `${folder}/${Date.now()}_${file.name}`;
    const url = await uploadImage(file, path);
    if (url) onUpload(url);
    setUploading(false);
  };

  return (
    <label className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 cursor-pointer hover:border-sunrise-400 text-sm", uploading && "opacity-50 pointer-events-none")}>
      {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
      <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
      <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
    </label>
  );
}

/* ────────── Overview ────────── */
function OverviewPanel() {
  const { data, loading } = useAdminData();

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const stats = [
    { label: 'Photos', val: data.gallery_images.length, color: 'bg-blue-100 text-blue-700' },
    { label: 'Blog Posts', val: data.blog_posts.length, color: 'bg-green-100 text-green-700' },
    { label: 'Team Members', val: data.team_members.length, color: 'bg-purple-100 text-purple-700' },
    { label: 'Messages', val: data.contact_messages.length, color: 'bg-orange-100 text-orange-700' },
  ];

  const newMsgs = data.contact_messages.filter(m => m.status === 'new');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-3 text-xl font-bold", s.color)}>{s.val}</div>
            <p className="text-gray-600 font-medium">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">New Messages ({newMsgs.length})</h2>
        {newMsgs.length === 0 ? <p className="text-gray-500 text-sm">No new messages</p> : (
          <ul className="space-y-3">
            {newMsgs.slice(0, 5).map(m => (
              <li key={m.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div><p className="font-medium text-gray-900">{m.name}</p><p className="text-sm text-gray-500 truncate max-w-[200px]">{m.subject}</p></div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">new</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ────────── Gallery Manager ────────── */
function GalleryPanel() {
  const { data, loading, refresh } = useAdminData();
  const [editCat, setEditCat] = useState<GalleryCategory | null>(null);
  const [editImg, setEditImg] = useState<GalleryImage | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveCat = async (cat: GalleryCategory) => {
    setStatus('saving');
    try { await upsertCategory(cat); await refresh(); setStatus('saved'); setEditCat(null); setIsNew(false); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const delCat = async (id: string) => {
    if (!confirm('Delete this category and all its photos?')) return;
    setStatus('saving');
    try { await deleteCategory(id); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const saveImg = async (img: GalleryImage) => {
    setStatus('saving');
    try { await upsertImage(img); await refresh(); setStatus('saved'); setEditImg(null); setIsNew(false); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const delImg = async (id: string) => {
    if (!confirm('Delete this photo?')) return;
    setStatus('saving');
    try { await deleteImage(id); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gallery Manager</h1>

      {/* Categories */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Categories</h2>
          <button onClick={() => { setIsNew(true); setEditCat({ id: crypto.randomUUID(), name_en: '', name_hi: '', sort_order: data.gallery_categories.length + 1, created_at: new Date().toISOString() }); }} className="flex items-center gap-2 bg-sunrise-500 text-white px-3 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" />Add Category</button>
        </div>
        <div className="space-y-2">
          {data.gallery_categories.sort((a, b) => a.sort_order - b.sort_order).map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><span className="font-medium">{cat.name_en}</span> / <span className="text-gray-500">{cat.name_hi}</span></div>
              <div className="flex gap-2">
                <button onClick={() => { setIsNew(false); setEditCat(cat); }} className="text-trust-600 text-sm font-medium">Edit</button>
                <button onClick={() => delCat(cat.id)} className="text-red-500 text-sm font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editCat && (
        <Modal onClose={() => { setEditCat(null); setIsNew(false); }}>
          <h3 className="text-lg font-semibold mb-4">{isNew ? 'New Category' : 'Edit Category'}</h3>
          <div className="space-y-4">
            <Input label="Name (EN)" value={editCat.name_en} onChange={v => setEditCat({ ...editCat, name_en: v })} />
            <Input label="Name (HI)" value={editCat.name_hi} onChange={v => setEditCat({ ...editCat, name_hi: v })} />
            <Input label="Sort Order" type="number" value={String(editCat.sort_order)} onChange={v => setEditCat({ ...editCat, sort_order: Number(v) })} />
            <button onClick={() => saveCat(editCat)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}

      {/* Images */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Photos ({data.gallery_images.length})</h2>
          <button onClick={() => { setIsNew(true); setEditImg({ id: crypto.randomUUID(), category_id: data.gallery_categories[0]?.id || '', url: '', title_en: '', title_hi: '', description_en: '', description_hi: '', sort_order: data.gallery_images.length + 1, created_at: new Date().toISOString() }); }} className="flex items-center gap-2 bg-sunrise-500 text-white px-3 py-2 rounded-lg text-sm font-medium"><Plus className="w-4 h-4" />Add Photo</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {data.gallery_images.sort((a, b) => a.sort_order - b.sort_order).map(img => (
            <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={img.url} alt={img.title_en} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => { setIsNew(false); setEditImg(img); }} className="p-2 bg-white rounded-full hover:bg-gray-100"><Eye className="w-4 h-4" /></button>
                <button onClick={() => delImg(img.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {editImg && (
        <Modal onClose={() => { setEditImg(null); setIsNew(false); }}>
          <h3 className="text-lg font-semibold mb-4">{isNew ? 'New Photo' : 'Edit Photo'}</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select value={editImg.category_id} onChange={e => setEditImg({ ...editImg, category_id: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-200">
                {data.gallery_categories.map(c => <option key={c.id} value={c.id}>{c.name_en}</option>)}
              </select>
            </div>
            <Input label="Image URL" value={editImg.url} onChange={v => setEditImg({ ...editImg, url: v })} placeholder="https://..." />
            <ImageUpload folder="gallery" onUpload={url => setEditImg({ ...editImg, url })} />
            {editImg.url && <img src={editImg.url} alt="preview" className="w-full h-32 object-cover rounded-lg" />}
            <Input label="Title (EN)" value={editImg.title_en} onChange={v => setEditImg({ ...editImg, title_en: v })} />
            <Input label="Title (HI)" value={editImg.title_hi} onChange={v => setEditImg({ ...editImg, title_hi: v })} />
            <Input label="Description (EN)" value={editImg.description_en} onChange={v => setEditImg({ ...editImg, description_en: v })} />
            <Input label="Description (HI)" value={editImg.description_hi} onChange={v => setEditImg({ ...editImg, description_hi: v })} />
            <Input label="Sort Order" type="number" value={String(editImg.sort_order)} onChange={v => setEditImg({ ...editImg, sort_order: Number(v) })} />
            <button onClick={() => saveImg(editImg)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}

      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Blog Manager ────────── */
function BlogPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const savePost = async (p: BlogPost) => {
    setStatus('saving');
    try { await upsertBlogPost(p); await refresh(); setStatus('saved'); setEdit(null); setIsNew(false); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const delPost = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    setStatus('saving');
    try { await deleteBlogPost(id); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const blank: BlogPost = { id: crypto.randomUUID(), title_en: '', title_hi: '', excerpt_en: '', excerpt_hi: '', content_en: '', content_hi: '', featured_image: '', category: 'General', published: false, published_at: new Date().toISOString().split('T')[0], created_at: new Date().toISOString() };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Manager</h1>
        <button onClick={() => { setIsNew(true); setEdit(blank); }} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />New Post</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Title</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Category</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {data.blog_posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-[200px]">{post.title_en || post.title_hi}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{post.category}</td>
                  <td className="px-6 py-4"><span className={cn("text-xs px-2 py-1 rounded-full", post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>{post.published ? 'Published' : 'Draft'}</span></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => { setIsNew(false); setEdit(post); }} className="text-trust-600 text-sm font-medium">Edit</button>
                    <button onClick={() => delPost(post.id)} className="text-red-500 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <Modal onClose={() => { setEdit(null); setIsNew(false); }} wide>
          <h3 className="text-lg font-semibold mb-4">{isNew ? 'New Post' : 'Edit Post'}</h3>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Title (EN)" value={edit.title_en} onChange={v => setEdit({ ...edit, title_en: v })} />
              <Input label="Title (HI)" value={edit.title_hi} onChange={v => setEdit({ ...edit, title_hi: v })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Excerpt (EN)" value={edit.excerpt_en} onChange={v => setEdit({ ...edit, excerpt_en: v })} />
              <Input label="Excerpt (HI)" value={edit.excerpt_hi} onChange={v => setEdit({ ...edit, excerpt_hi: v })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (EN) — HTML supported</label>
              <textarea value={edit.content_en} onChange={e => setEdit({ ...edit, content_en: e.target.value })} rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sunrise-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content (HI) — HTML supported</label>
              <textarea value={edit.content_hi} onChange={e => setEdit({ ...edit, content_hi: e.target.value })} rows={6} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sunrise-500 font-mono text-sm" />
            </div>
            <Input label="Featured Image URL" value={edit.featured_image} onChange={v => setEdit({ ...edit, featured_image: v })} />
            <ImageUpload folder="blog" onUpload={url => setEdit({ ...edit, featured_image: url })} />
            {edit.featured_image && <img src={edit.featured_image} alt="" className="w-full h-32 object-cover rounded-lg" />}
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Category" value={edit.category} onChange={v => setEdit({ ...edit, category: v })} />
              <Input label="Publish Date" type="date" value={edit.published_at} onChange={v => setEdit({ ...edit, published_at: v })} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={edit.published} onChange={e => setEdit({ ...edit, published: e.target.checked })} className="w-5 h-5 rounded text-sunrise-500" />
              <span className="font-medium">{edit.published ? <><Eye className="w-4 h-4 inline" /> Published</> : <><EyeOff className="w-4 h-4 inline" /> Draft</>}</span>
            </label>
            <button onClick={() => savePost(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Team Manager ────────── */
function TeamPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<TeamMember | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveMember = async (m: TeamMember) => {
    setStatus('saving');
    try { await upsertTeamMember(m); await refresh(); setStatus('saved'); setEdit(null); setIsNew(false); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const delMember = async (id: string) => {
    if (!confirm('Delete?')) return;
    setStatus('saving');
    try { await deleteTeamMember(id); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  const blank: TeamMember = { id: crypto.randomUUID(), name_en: '', name_hi: '', role_en: '', role_hi: '', bio_en: '', bio_hi: '', phone: '', email: '', image_url: '', expertise_en: [], expertise_hi: [], social: {}, sort_order: data.team_members.length + 1 };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Manager</h1>
        <button onClick={() => { setIsNew(true); setEdit(blank); }} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />Add Member</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {data.team_members.sort((a, b) => a.sort_order - b.sort_order).map(m => (
          <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm flex gap-4">
            {m.image_url ? (
              <img src={m.image_url} alt={m.name_en} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-sunrise-100 flex items-center justify-center flex-shrink-0"><Users className="w-8 h-8 text-sunrise-400" /></div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{m.name_en}</h3>
              <p className="text-sm text-sunrise-600">{m.role_en}</p>
              <p className="text-sm text-gray-500">{m.phone}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => { setIsNew(false); setEdit(m); }} className="text-sm text-trust-600 font-medium">Edit</button>
                <button onClick={() => delMember(m.id)} className="text-sm text-red-500 font-medium">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {edit && (
        <Modal onClose={() => { setEdit(null); setIsNew(false); }} wide>
          <h3 className="text-lg font-semibold mb-4">{isNew ? 'Add Team Member' : 'Edit Team Member'}</h3>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Name (EN)" value={edit.name_en} onChange={v => setEdit({ ...edit, name_en: v })} />
              <Input label="Name (HI)" value={edit.name_hi} onChange={v => setEdit({ ...edit, name_hi: v })} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Role (EN)" value={edit.role_en} onChange={v => setEdit({ ...edit, role_en: v })} />
              <Input label="Role (HI)" value={edit.role_hi} onChange={v => setEdit({ ...edit, role_hi: v })} />
            </div>
            <Input label="Photo URL" value={edit.image_url} onChange={v => setEdit({ ...edit, image_url: v })} />
            <ImageUpload folder="team" onUpload={url => setEdit({ ...edit, image_url: url })} />
            {edit.image_url && <img src={edit.image_url} alt="" className="w-24 h-24 object-cover rounded-xl" />}
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Phone" value={edit.phone} onChange={v => setEdit({ ...edit, phone: v })} />
              <Input label="Email" value={edit.email} onChange={v => setEdit({ ...edit, email: v })} />
            </div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio (EN)</label><textarea value={edit.bio_en} onChange={e => setEdit({ ...edit, bio_en: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio (HI)</label><textarea value={edit.bio_hi} onChange={e => setEdit({ ...edit, bio_hi: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-lg border border-gray-200" /></div>
            <Input label="Expertise EN (comma separated)" value={edit.expertise_en.join(', ')} onChange={v => setEdit({ ...edit, expertise_en: v.split(',').map(s => s.trim()).filter(Boolean) })} />
            <Input label="Expertise HI (comma separated)" value={edit.expertise_hi.join(', ')} onChange={v => setEdit({ ...edit, expertise_hi: v.split(',').map(s => s.trim()).filter(Boolean) })} />
            <Input label="Facebook URL" value={edit.social?.facebook || ''} onChange={v => setEdit({ ...edit, social: { ...edit.social, facebook: v } })} />
            <Input label="Instagram URL" value={edit.social?.instagram || ''} onChange={v => setEdit({ ...edit, social: { ...edit.social, instagram: v } })} />
            <Input label="Twitter URL" value={edit.social?.twitter || ''} onChange={v => setEdit({ ...edit, social: { ...edit.social, twitter: v } })} />
            <Input label="LinkedIn URL" value={edit.social?.linkedin || ''} onChange={v => setEdit({ ...edit, social: { ...edit.social, linkedin: v } })} />
            <Input label="Sort Order" type="number" value={String(edit.sort_order)} onChange={v => setEdit({ ...edit, sort_order: Number(v) })} />
            <button onClick={() => saveMember(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Events Manager ────────── */
function EventsPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<AppEvent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveEv = async (e: AppEvent) => {
    setStatus('saving');
    try { await upsertEvent(e); await refresh(); setStatus('saved'); setEdit(null); setIsNew(false); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };
  const delEv = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteEvent(id); await refresh(); } catch { /* */ }
  };
  const blank: AppEvent = { id: crypto.randomUUID(), title_en: '', title_hi: '', description_en: '', description_hi: '', date: new Date().toISOString().split('T')[0], time: '', location_en: '', location_hi: '' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events Manager</h1>
        <button onClick={() => { setIsNew(true); setEdit(blank); }} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />New Event</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {data.events.map(e => (
          <div key={e.id} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">{e.title_en}</h3>
            <p className="text-sm text-gray-500 mt-1">{e.date} • {e.time}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setIsNew(false); setEdit(e); }} className="text-sm text-trust-600 font-medium">Edit</button>
              <button onClick={() => delEv(e.id)} className="text-sm text-red-500 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal onClose={() => { setEdit(null); setIsNew(false); }}>
          <h3 className="text-lg font-semibold mb-4">{isNew ? 'New Event' : 'Edit Event'}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><Input label="Title (EN)" value={edit.title_en} onChange={v => setEdit({ ...edit, title_en: v })} /><Input label="Title (HI)" value={edit.title_hi} onChange={v => setEdit({ ...edit, title_hi: v })} /></div>
            <div className="grid grid-cols-2 gap-4"><Input label="Description (EN)" value={edit.description_en} onChange={v => setEdit({ ...edit, description_en: v })} /><Input label="Description (HI)" value={edit.description_hi} onChange={v => setEdit({ ...edit, description_hi: v })} /></div>
            <div className="grid grid-cols-2 gap-4"><Input label="Date" type="date" value={edit.date} onChange={v => setEdit({ ...edit, date: v })} /><Input label="Time" value={edit.time} onChange={v => setEdit({ ...edit, time: v })} /></div>
            <div className="grid grid-cols-2 gap-4"><Input label="Location (EN)" value={edit.location_en} onChange={v => setEdit({ ...edit, location_en: v })} /><Input label="Location (HI)" value={edit.location_hi} onChange={v => setEdit({ ...edit, location_hi: v })} /></div>
            <button onClick={() => saveEv(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Journey Manager ────────── */
function JourneyPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<JourneyItem | null>(null);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveItem = async (item: JourneyItem) => {
    setStatus('saving');
    try { await upsertJourneyItem(item); await refresh(); setStatus('saved'); setEdit(null); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };
  const delItem = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteJourneyItem(id); await refresh(); } catch { /* */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Journey / Timeline</h1>
        <button onClick={() => setEdit({ id: crypto.randomUUID(), year: new Date().getFullYear().toString(), event_en: '', event_hi: '', sort_order: data.journey_items.length + 1 })} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />Add Milestone</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {data.journey_items.sort((a, b) => a.sort_order - b.sort_order).map(j => (
          <div key={j.id} className="p-4 flex items-center justify-between">
            <div><span className="font-bold text-sunrise-600 mr-3">{j.year}</span><span className="text-gray-900">{j.event_en}</span> / <span className="text-gray-500">{j.event_hi}</span></div>
            <div className="flex gap-2"><button onClick={() => setEdit(j)} className="text-trust-600 text-sm font-medium">Edit</button><button onClick={() => delItem(j.id)} className="text-red-500 text-sm font-medium">Delete</button></div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h3 className="text-lg font-semibold mb-4">Milestone</h3>
          <div className="space-y-4">
            <Input label="Year" value={edit.year} onChange={v => setEdit({ ...edit, year: v })} />
            <Input label="Event (EN)" value={edit.event_en} onChange={v => setEdit({ ...edit, event_en: v })} />
            <Input label="Event (HI)" value={edit.event_hi} onChange={v => setEdit({ ...edit, event_hi: v })} />
            <Input label="Sort Order" type="number" value={String(edit.sort_order)} onChange={v => setEdit({ ...edit, sort_order: Number(v) })} />
            <button onClick={() => saveItem(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Stats Manager ────────── */
function StatsPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<StatItem | null>(null);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveItem = async (item: StatItem) => {
    setStatus('saving');
    try { await upsertStat(item); await refresh(); setStatus('saved'); setEdit(null); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };
  const delItem = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteStat(id); await refresh(); } catch { /* */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Stats (Homepage)</h1>
        <button onClick={() => setEdit({ id: crypto.randomUUID(), value: '', label_en: '', label_hi: '', sort_order: data.stats.length + 1 })} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />Add Stat</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm divide-y">
        {data.stats.sort((a, b) => a.sort_order - b.sort_order).map(s => (
          <div key={s.id} className="p-4 flex items-center justify-between">
            <div><span className="font-bold text-sunrise-600 mr-3">{s.value}</span><span className="text-gray-900">{s.label_en}</span> / <span className="text-gray-500">{s.label_hi}</span></div>
            <div className="flex gap-2"><button onClick={() => setEdit(s)} className="text-trust-600 text-sm font-medium">Edit</button><button onClick={() => delItem(s.id)} className="text-red-500 text-sm font-medium">Delete</button></div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h3 className="text-lg font-semibold mb-4">Stat</h3>
          <div className="space-y-4">
            <Input label="Value (e.g. 100+)" value={edit.value} onChange={v => setEdit({ ...edit, value: v })} />
            <Input label="Label (EN)" value={edit.label_en} onChange={v => setEdit({ ...edit, label_en: v })} />
            <Input label="Label (HI)" value={edit.label_hi} onChange={v => setEdit({ ...edit, label_hi: v })} />
            <Input label="Sort Order" type="number" value={String(edit.sort_order)} onChange={v => setEdit({ ...edit, sort_order: Number(v) })} />
            <button onClick={() => saveItem(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Programs Manager ────────── */
function ProgramsPanel() {
  const { data, loading, refresh } = useAdminData();
  const [edit, setEdit] = useState<Program | null>(null);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const saveItem = async (item: Program) => {
    setStatus('saving');
    try { await upsertProgram(item); await refresh(); setStatus('saved'); setEdit(null); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };
  const delItem = async (id: string) => {
    if (!confirm('Delete?')) return;
    try { await deleteProgram(id); await refresh(); } catch { /* */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Programs Manager</h1>
        <button onClick={() => setEdit({ id: crypto.randomUUID(), title_en: '', title_hi: '', description_en: '', description_hi: '', icon: 'Heart', color: 'blue', sort_order: data.programs.length + 1 })} className="flex items-center gap-2 bg-sunrise-500 text-white px-4 py-2 rounded-lg font-medium"><Plus className="w-4 h-4" />Add Program</button>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {data.programs.sort((a, b) => a.sort_order - b.sort_order).map(p => (
          <div key={p.id} className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">{p.title_en}</h3>
            <p className="text-sm text-gray-500 mt-1">{p.title_hi}</p>
            <div className="flex gap-2 mt-3"><button onClick={() => setEdit(p)} className="text-trust-600 text-sm font-medium">Edit</button><button onClick={() => delItem(p.id)} className="text-red-500 text-sm font-medium">Delete</button></div>
          </div>
        ))}
      </div>
      {edit && (
        <Modal onClose={() => setEdit(null)}>
          <h3 className="text-lg font-semibold mb-4">Program</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><Input label="Title (EN)" value={edit.title_en} onChange={v => setEdit({ ...edit, title_en: v })} /><Input label="Title (HI)" value={edit.title_hi} onChange={v => setEdit({ ...edit, title_hi: v })} /></div>
            <Input label="Description (EN)" value={edit.description_en} onChange={v => setEdit({ ...edit, description_en: v })} />
            <Input label="Description (HI)" value={edit.description_hi} onChange={v => setEdit({ ...edit, description_hi: v })} />
            <Input label="Sort Order" type="number" value={String(edit.sort_order)} onChange={v => setEdit({ ...edit, sort_order: Number(v) })} />
            <button onClick={() => saveItem(edit)} className="w-full bg-sunrise-500 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"><Save className="w-4 h-4" />Apply Changes</button>
          </div>
        </Modal>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Messages ────────── */
function MessagesPanel() {
  const { data, loading, refresh } = useAdminData();
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const markRead = async (id: string) => {
    try { await updateMessageStatus(id, 'read'); await refresh(); } catch { /* */ }
  };
  const delMsg = async (id: string) => {
    if (!confirm('Delete?')) return;
    setStatus('saving');
    try { await deleteContactMessage(id); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages ({data.contact_messages.length})</h1>
      {data.contact_messages.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm"><MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">No messages yet</p></div>
      ) : (
        <div className="space-y-4">
          {data.contact_messages.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-semibold text-gray-900">{m.name}</h3><p className="text-sm text-gray-500">{m.email} • {m.phone}</p></div>
                <span className={cn("text-xs px-2 py-1 rounded-full", m.status === 'new' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600")}>{m.status}</span>
              </div>
              <p className="font-medium text-gray-800 mb-1">{m.subject}</p>
              <p className="text-gray-600 text-sm">{m.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
              <div className="flex gap-3 mt-3">
                {m.status === 'new' && <button onClick={() => markRead(m.id)} className="text-sm text-trust-600 font-medium">Mark Read</button>}
                <a href={`mailto:${m.email}?subject=Re: ${m.subject}`} className="text-sm text-green-600 font-medium">Reply via Email</a>
                <button onClick={() => delMsg(m.id)} className="text-sm text-red-500 font-medium">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Settings ────────── */
function SettingsPanel() {
  const { data, loading, refresh } = useAdminData();
  const [s, setS] = useState(data?.site_settings || {} as typeof data extends null ? never : NonNullable<typeof data>['site_settings']);
  const [status, setStatus] = useState<'saving' | 'saved' | 'error' | null>(null);

  useEffect(() => {
    if (data) setS(data.site_settings);
  }, [data]);

  if (loading || !data) return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-sunrise-500" /></div>;

  const handleSave = async () => {
    setStatus('saving');
    try { await saveSiteSettings(s); await refresh(); setStatus('saved'); }
    catch { setStatus('error'); }
    setTimeout(() => setStatus(null), 2000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Site Settings</h1>
      <div className="bg-white rounded-xl p-6 shadow-sm space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Org Name (EN)" value={s.org_name_en} onChange={v => setS({ ...s, org_name_en: v })} />
          <Input label="Org Name (HI)" value={s.org_name_hi} onChange={v => setS({ ...s, org_name_hi: v })} />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Email" value={s.email} onChange={v => setS({ ...s, email: v })} />
          <Input label="Phone" value={s.phone} onChange={v => setS({ ...s, phone: v })} />
        </div>
        <Input label="Phone 2" value={s.phone2} onChange={v => setS({ ...s, phone2: v })} />
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Address (EN)" value={s.address_en} onChange={v => setS({ ...s, address_en: v })} />
          <Input label="Address (HI)" value={s.address_hi} onChange={v => setS({ ...s, address_hi: v })} />
        </div>
        <Input label="Facebook URL" value={s.facebook} onChange={v => setS({ ...s, facebook: v })} />
        <Input label="Instagram URL" value={s.instagram} onChange={v => setS({ ...s, instagram: v })} />
        <Input label="Twitter URL" value={s.twitter} onChange={v => setS({ ...s, twitter: v })} />
        <Input label="YouTube URL" value={s.youtube} onChange={v => setS({ ...s, youtube: v })} />
        <button onClick={handleSave} className="bg-sunrise-500 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2">
          <Save className="w-4 h-4" />Apply Changes
        </button>
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">👤 Admin User Management</h2>
        <p className="text-yellow-700 text-sm mb-3">
          Admin users are managed directly in Supabase. No credentials are stored in this website's code.
        </p>
        <ol className="list-decimal list-inside text-yellow-700 text-sm space-y-1">
          <li>Go to your Supabase Dashboard → Authentication → Users</li>
          <li>Click "Add User" to add a new admin</li>
          <li>To change password: Delete & recreate the user, or use "Send password reset"</li>
          <li>Only users added here can login to this admin panel</li>
        </ol>
      </div>

      <StatusBanner status={status} />
    </div>
  );
}

/* ────────── Shared UI Components ────────── */
function Modal({ children, onClose, wide }: { children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={cn("bg-white rounded-2xl p-6 shadow-2xl w-full", wide ? "max-w-3xl" : "max-w-lg")} onClick={e => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-sunrise-500 focus:border-sunrise-500" />
    </div>
  );
}
