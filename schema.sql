-- ============================================================
-- INDZENO — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ---------- 1. CATEGORIES ----------
create table if not exists categories (
  id          serial primary key,
  name        text unique not null,
  slug        text unique not null,
  created_at  timestamptz default now()
);

insert into categories (name, slug) values
  ('AI','ai'), ('Politics','politics'), ('Movies','movies'),
  ('History','history'), ('Biography','biography'),
  ('Technology','technology'), ('Influencers','influencers')
on conflict (name) do nothing;

-- ---------- 2. AUTHORS / PROFILES ----------
create table if not exists profiles (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete cascade,
  full_name   text not null,
  avatar_url  text,
  role        text not null default 'author' check (role in ('admin','editor','author')),
  bio         text,
  created_at  timestamptz default now()
);

-- ---------- 3. NEWS ARTICLES (core table requested in brief) ----------
create table if not exists news_articles (
  id            bigserial primary key,
  title         text not null,
  slug          text unique,
  content       text not null,
  excerpt       text,
  image         text,
  category      text not null references categories(name),
  author        text not null,
  author_id     uuid references profiles(id) on delete set null,
  status        text not null default 'published' check (status in ('draft','published','archived')),
  featured      boolean default false,
  trending      boolean default false,
  views         integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_news_category   on news_articles (category);
create index if not exists idx_news_created_at on news_articles (created_at desc);
create index if not exists idx_news_status     on news_articles (status);
create index if not exists idx_news_featured   on news_articles (featured) where featured = true;

-- Auto-slug + updated_at trigger
create or replace function slugify(v text) returns text as $$
  select trim(both '-' from regexp_replace(lower(v), '[^a-z0-9]+', '-', 'g'));
$$ language sql immutable;

create or replace function news_articles_before_write() returns trigger as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := slugify(new.title) || '-' || substr(md5(random()::text),1,6);
  end if;
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_news_articles_before_write on news_articles;
create trigger trg_news_articles_before_write
  before insert or update on news_articles
  for each row execute function news_articles_before_write();

-- ---------- 4. COMMENTS ----------
create table if not exists comments (
  id          bigserial primary key,
  article_id  bigint references news_articles(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  author_name text not null,
  body        text not null,
  status      text not null default 'approved' check (status in ('pending','approved','rejected')),
  created_at  timestamptz default now()
);
create index if not exists idx_comments_article on comments (article_id);

-- ---------- 5. BOOKMARKS ----------
create table if not exists bookmarks (
  id          bigserial primary key,
  user_id     uuid references auth.users(id) on delete cascade,
  article_id  bigint references news_articles(id) on delete cascade,
  created_at  timestamptz default now(),
  unique (user_id, article_id)
);

-- ---------- 6. NEWSLETTER SUBSCRIBERS ----------
create table if not exists newsletter_subscribers (
  id          bigserial primary key,
  email       text unique not null,
  subscribed_at timestamptz default now(),
  confirmed   boolean default false
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table news_articles          enable row level security;
alter table comments               enable row level security;
alter table bookmarks              enable row level security;
alter table newsletter_subscribers enable row level security;
alter table profiles               enable row level security;

-- Public can read published articles
create policy "Public read published articles"
  on news_articles for select
  using (status = 'published');

-- Authenticated admins/editors can do everything (checked via profiles.role)
create policy "Admins manage articles"
  on news_articles for all
  using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
  )
  with check (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
  );

-- Comments: public can read approved, anyone signed in can insert their own
create policy "Public read approved comments"
  on comments for select using (status = 'approved');
create policy "Users insert own comments"
  on comments for insert with check (auth.uid() = user_id or user_id is null);
create policy "Admins manage comments"
  on comments for all using (
    exists (select 1 from profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
  );

-- Bookmarks: users manage only their own
create policy "Users manage own bookmarks"
  on bookmarks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Newsletter: anyone can insert (subscribe), nobody can read others' emails
create policy "Anyone can subscribe"
  on newsletter_subscribers for insert with check (true);

-- Profiles: users read/update their own; admins read all
create policy "Users manage own profile"
  on profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table news_articles;

-- ============================================================
-- SEED DATA (sample articles matching the front-end fallback set)
-- ============================================================
insert into news_articles (title, content, excerpt, image, category, author, status, featured, trending) values
('India''s AI Mission Enters Phase Two With ₹10,000 Cr Compute Push',
 'The government''s expanded AI mission moves from policy paper to procurement this week, with the first tranche of GPU clusters going live across four regional data hubs. Officials say the goal is to cut the cost of training mid-sized models for public research teams by more than half.',
 'A new national compute grid aims to put sovereign GPU capacity within reach of every public university by 2027.',
 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop&q=80',
 'AI','Ritika Sharma','published', true, true),

('Parliament Passes Landmark Data Protection Amendment',
 'After eleven hours of debate, the amendment passed with cross-party support, marking the most significant change to the country''s data law since it was first enacted. The bill introduces a 30-day fast-track grievance redress mechanism.',
 'The amendment tightens consent rules for cross-border data transfers and creates a fast-track grievance body.',
 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=500&fit=crop&q=80',
 'Politics','Arjun Mehta','published', true, false),

('Festival Season Box Office: Three Big Releases, One Surprise Hit',
 'Weekend collections show an unusual pattern: the smaller release is filling shows at a higher rate than either of its bigger-budget rivals, even with a fraction of the screen count.',
 'A modestly budgeted indie drama has quietly outperformed two star-studded tentpoles on a per-screen basis.',
 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop&q=80',
 'Movies','Neha Kapoor','published', false, true)
on conflict do nothing;

