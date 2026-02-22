# नयी सुबह फाउंडेशन — Complete Setup Guide

## 🔒 SECURITY MODEL

**There is NO demo mode. There are NO hardcoded credentials anywhere in the code.**

Admin authentication works ONLY through Supabase Auth:
- Only users you manually add in Supabase Dashboard can login
- The website code contains zero passwords, zero credentials
- Row Level Security (RLS) ensures public visitors can only READ data
- Only authenticated users (admins) can INSERT/UPDATE/DELETE data

---

## 🗄️ Step 1: Supabase Database Setup

### Create Supabase Project
1. Go to https://supabase.com → Sign up (free)
2. Create a new project (choose a region close to India for speed)
3. Note your **Project URL** and **anon/public key** from Settings → API

### Run SQL Schema
Go to **SQL Editor** in Supabase and run this ENTIRE script:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════ TABLES ═══════════

-- Gallery Categories
CREATE TABLE gallery_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gallery Images
CREATE TABLE gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES gallery_categories(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title_en TEXT DEFAULT '',
  title_hi TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  description_hi TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  excerpt_en TEXT DEFAULT '',
  excerpt_hi TEXT DEFAULT '',
  content_en TEXT DEFAULT '',
  content_hi TEXT DEFAULT '',
  featured_image TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  published BOOLEAN DEFAULT false,
  published_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  role_en TEXT DEFAULT '',
  role_hi TEXT DEFAULT '',
  bio_en TEXT DEFAULT '',
  bio_hi TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  expertise_en TEXT[] DEFAULT '{}',
  expertise_hi TEXT[] DEFAULT '{}',
  social JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT DEFAULT '',
  description_hi TEXT DEFAULT '',
  date DATE NOT NULL,
  time TEXT DEFAULT '',
  location_en TEXT DEFAULT '',
  location_hi TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Site Settings (key-value pairs)
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT DEFAULT ''
);

-- Journey / Timeline
CREATE TABLE journey_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  year TEXT NOT NULL,
  event_en TEXT NOT NULL,
  event_hi TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Stats (homepage numbers)
CREATE TABLE stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  value TEXT NOT NULL,
  label_en TEXT NOT NULL,
  label_hi TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Programs
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_en TEXT NOT NULL,
  title_hi TEXT NOT NULL,
  description_en TEXT DEFAULT '',
  description_hi TEXT DEFAULT '',
  icon TEXT DEFAULT 'Heart',
  color TEXT DEFAULT 'blue',
  sort_order INTEGER DEFAULT 0
);

-- ═══════════ ROW LEVEL SECURITY (RLS) ═══════════
-- 
-- HOW IT WORKS:
-- RLS is like a security guard on every table.
-- Each table has POLICIES that say WHO can do WHAT.
-- 
-- We set up 2 types of policies:
-- 1. PUBLIC READ: Anyone can view the data (your website visitors)
-- 2. ADMIN WRITE: Only logged-in users (admins) can add/edit/delete
--
-- This means:
-- ✅ Anyone visiting your website can see photos, blogs, team, etc.
-- ❌ Nobody can modify data unless they login through Supabase Auth
-- ✅ Anyone can submit a contact form message
-- ❌ But only admins can read/delete those messages

-- Enable RLS on ALL tables
ALTER TABLE gallery_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

-- ═══ PUBLIC READ POLICIES ═══
-- These let anyone (even without login) READ the data

CREATE POLICY "Anyone can view categories"
  ON gallery_categories FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view images"
  ON gallery_images FOR SELECT
  USING (true);

-- Blog: only show PUBLISHED posts to public
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (published = true);

CREATE POLICY "Anyone can view team"
  ON team_members FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view journey"
  ON journey_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view stats"
  ON stats FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view programs"
  ON programs FOR SELECT
  USING (true);

-- ═══ PUBLIC INSERT POLICY (Contact Form) ═══
-- Anyone can SUBMIT a contact message, but NOT read others' messages

CREATE POLICY "Anyone can submit contact form"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

-- ═══ ADMIN FULL ACCESS POLICIES ═══
-- Only authenticated users (admins) can do everything

CREATE POLICY "Admins manage categories"
  ON gallery_categories FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage images"
  ON gallery_images FOR ALL
  USING (auth.role() = 'authenticated');

-- Admins can see ALL posts (including drafts)
CREATE POLICY "Admins manage posts"
  ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage team"
  ON team_members FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage events"
  ON events FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage messages"
  ON contact_messages FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage settings"
  ON site_settings FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage journey"
  ON journey_items FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage stats"
  ON stats FOR ALL
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage programs"
  ON programs FOR ALL
  USING (auth.role() = 'authenticated');

-- ═══ PERFORMANCE INDEXES ═══
CREATE INDEX idx_blog_published ON blog_posts(published, published_at DESC);
CREATE INDEX idx_gallery_cat ON gallery_images(category_id, sort_order);
CREATE INDEX idx_messages_status ON contact_messages(status, created_at DESC);

-- ═══ INSERT DEFAULT SETTINGS ═══
INSERT INTO site_settings (key, value) VALUES
  ('org_name_en', 'Nayi Subah Foundation'),
  ('org_name_hi', 'नयी सुबह फाउंडेशन'),
  ('email', 'nayisubahfoundation@gmail.com'),
  ('phone', '+917310748827'),
  ('phone2', '+918218129845'),
  ('address_en', 'Rampur, Uttar Pradesh, India - 244901'),
  ('address_hi', 'रामपुर, उत्तर प्रदेश, भारत - 244901'),
  ('facebook', ''),
  ('twitter', ''),
  ('instagram', ''),
  ('youtube', '');
```

---

## 📦 Step 2: Create Storage Bucket (for image uploads)

1. Go to Supabase → **Storage** (left sidebar)
2. Click **"New Bucket"**
3. Name it: `media`
4. **Check "Public bucket"** ← Important!
5. Click Create

Now add storage policies:
Go to **Storage → media → Policies** and add:

**Policy 1 — Public can view:**
- Name: `Public can view media`
- Allowed operation: `SELECT`
- Target roles: leave empty (public)
- Policy: `true`

**Policy 2 — Admins can upload:**
- Name: `Admins can upload`  
- Allowed operation: `INSERT`
- Target roles: `authenticated`
- Policy: `true`

**Policy 3 — Admins can delete:**
- Name: `Admins can delete`
- Allowed operation: `DELETE`
- Target roles: `authenticated`  
- Policy: `true`

---

## 👤 Step 3: Create Admin User

This is the ONLY way someone can login to the admin panel:

1. Go to Supabase → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - Email: `nayisubahfoundation@gmail.com`
   - Password: Choose a strong password
   - Check "Auto Confirm User"
4. Click **"Create User"**

**That's it!** This user can now login at `yoursite.com/admin`

To add more admins: Repeat step 3 with a different email.
To change password: Click on the user → "Send password recovery email"
To remove admin access: Delete the user.

---

## 🌐 Step 4: Deploy to Cloudflare Pages

### Environment Variables
In Cloudflare Pages → Settings → Environment Variables, add:

```
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUz....your-anon-key
```

### Build Settings
- **Framework preset**: None
- **Build command**: `npm run build`
- **Build output directory**: `dist`

### After Deploy
1. Go to `yoursite.com/admin`
2. Login with the email & password you set in Step 3
3. Start adding content!

---

## 📋 How the Admin Panel Works

### What happens when you click "Apply Changes"?
1. Your data is sent to Supabase database
2. Supabase checks: "Is this user logged in?" (via the auth token)
3. If yes → Data is saved to the database
4. If no → Request is REJECTED (403 Forbidden)
5. The website immediately shows the new data to all visitors

### Quick Reference:

| Section | What it controls | Affects |
|---------|-----------------|---------|
| **Stats** | Homepage numbers | Homepage stats bar |
| **Programs** | Program cards | Homepage + Our Work page |
| **Gallery** | Photos & categories | Photo Gallery page |
| **Blog** | Blog posts | Blog page + Homepage latest |
| **Team** | Team member profiles | Our Team page |
| **Events** | Upcoming events | Homepage events section |
| **Journey** | Timeline milestones | About Us page |
| **Messages** | Contact form submissions | Admin only |
| **Settings** | Org info, social links | Footer, Contact page |

---

## 🔐 Security Summary

| What | Where | Who can access |
|------|-------|----------------|
| Admin credentials | Supabase Auth (NOT in code) | Only Supabase dashboard owner |
| Website data | Supabase Database | Everyone can READ, only admins can WRITE |
| Uploaded images | Supabase Storage | Everyone can VIEW, only admins can UPLOAD |
| Contact messages | Supabase Database | Anyone can SUBMIT, only admins can READ |

**Zero credentials in the website code. Zero backdoors. Zero demo modes.**

---

## 📧 Email: nayisubahfoundation@gmail.com
