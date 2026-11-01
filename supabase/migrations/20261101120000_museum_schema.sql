-- ISM Digital Museum: schema, RLS, moderation and storage policies (M1).
-- Apply once to the dedicated museum project (SQL Editor or `supabase db push`).
-- Rollback: see docs/ARCHITECTURE.md "Migration and rollback"; never drop tables holding real data.

-- Admin role lives in app_metadata (only the service role / Dashboard can set it), never user_metadata.
create or replace function public.is_admin()
returns boolean language sql stable set search_path = ''
as $$ select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false) $$;

-- True only for requests coming through the API as an end user (not SQL Editor / service role).
create or replace function public.is_api_user()
returns boolean language sql stable set search_path = ''
as $$ select current_user in ('anon', 'authenticated') $$;

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 1000),
  -- own folder only, otherwise a user could expose someone else's private file via the read policy
  avatar_path text check (avatar_path is null or avatar_path like 'avatars/' || id::text || '/%'),
  created_at timestamptz not null default now()
);

create table public.exhibition_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) between 1 and 80),
  description text not null default ''
);

create table public.exhibits (
  id uuid primary key default gen_random_uuid(),
  -- restrict: a creator who still has works cannot be deleted silently (delete/transfer works first)
  creator_id uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  category_id uuid references public.exhibition_categories (id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 1 and 150),
  description text not null default '' check (char_length(description) <= 5000),
  image_path text,
  year_created integer check (year_created between 1990 and 2100),
  technology_stack text[] not null default '{}' check (cardinality(technology_stack) <= 20),
  demo_url text check (demo_url ~ '^https?://'),
  github_url text check (github_url ~ '^https?://'),
  status text not null default 'draft' check (status in ('draft', 'pending', 'published')),
  moderation_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index exhibits_status_year_idx on public.exhibits (status, year_created);
create index exhibits_creator_idx on public.exhibits (creator_id);
create index exhibits_category_idx on public.exhibits (category_id);
create index exhibits_tech_idx on public.exhibits using gin (technology_stack);

create table public.teachers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position text,
  courses text[] not null default '{}',
  bio text,
  photo_path text,
  source_url text,
  sort_order integer not null default 0,
  published boolean not null default false
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  description text not null default '',
  cover_image_path text,
  published boolean not null default false
);

create table public.event_photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  image_path text not null,
  caption text not null default '',
  sort_order integer not null default 0
);
create index event_photos_event_idx on public.event_photos (event_id);

create table public.history_entries (
  id uuid primary key default gen_random_uuid(),
  year integer not null check (year between 1900 and 2100),
  title text not null,
  description text not null default '',
  source_url text,
  published boolean not null default false
);

-- ---------- Profile creation on signup ----------
-- display_name from signup metadata is only a label; it never grants any permission.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(nullif(btrim(left(new.raw_user_meta_data ->> 'display_name', 80)), ''), 'Бүтээгч'))
  on conflict (id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Moderation rules (RLS cannot restrict individual columns) ----------
create or replace function public.exhibits_guard()
returns trigger language plpgsql set search_path = ''
as $$
begin
  new.updated_at := now();
  if tg_op = 'UPDATE' and new.creator_id is distinct from old.creator_id then
    raise exception 'creator_id cannot change';
  end if;
  if not public.is_api_user() or public.is_admin() then
    return new;
  end if;
  -- Ordinary creator from here on.
  if new.image_path is not null and new.image_path not like 'exhibits/' || auth.uid() || '/%' then
    raise exception 'image must be in your own folder';
  end if;
  if tg_op = 'INSERT' then
    if new.status = 'published' then raise exception 'only admin can publish'; end if;
    new.moderation_note := null;
  else
    if new.moderation_note is distinct from old.moderation_note then
      raise exception 'only admin can write moderation notes';
    end if;
    if new.status = 'published' then
      if old.status <> 'published' then raise exception 'only admin can publish'; end if;
      new.status := 'pending'; -- editing published work sends it back to review
    end if;
  end if;
  return new;
end $$;
create trigger exhibits_guard before insert or update on public.exhibits
  for each row execute function public.exhibits_guard();

-- ---------- Grants ----------
grant select on public.profiles, public.exhibition_categories, public.exhibits, public.teachers,
  public.events, public.event_photos, public.history_entries to anon, authenticated;
grant update (display_name, bio, avatar_path) on public.profiles to authenticated;
grant insert, update, delete on public.exhibits, public.exhibition_categories, public.teachers,
  public.events, public.event_photos, public.history_entries to authenticated;

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.exhibition_categories enable row level security;
alter table public.exhibits enable row level security;
alter table public.teachers enable row level security;
alter table public.events enable row level security;
alter table public.event_photos enable row level security;
alter table public.history_entries enable row level security;

create policy "profiles are public" on public.profiles for select using (true);
create policy "edit own profile" on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

create policy "read published or own or admin" on public.exhibits for select using (
  status = 'published' or creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "insert own" on public.exhibits for insert to authenticated
  with check (creator_id = (select auth.uid()));
create policy "update own or admin" on public.exhibits for update to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()))
  with check (creator_id = (select auth.uid()) or (select public.is_admin()));
create policy "delete own or admin" on public.exhibits for delete to authenticated
  using (creator_id = (select auth.uid()) or (select public.is_admin()));

create policy "categories are public" on public.exhibition_categories for select using (true);
create policy "admin writes categories" on public.exhibition_categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "read published teachers" on public.teachers for select
  using (published or (select public.is_admin()));
create policy "admin writes teachers" on public.teachers for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "read published events" on public.events for select
  using (published or (select public.is_admin()));
create policy "admin writes events" on public.events for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Album visibility follows the parent event (the subquery itself is filtered by events RLS).
create policy "read photos of visible events" on public.event_photos for select
  using (exists (select 1 from public.events e where e.id = event_id));
create policy "admin writes event photos" on public.event_photos for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "read published history" on public.history_entries for select
  using (published or (select public.is_admin()));
create policy "admin writes history" on public.history_entries for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------- Storage: one private bucket, 5 MB, JPEG/PNG/WebP ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('museum-media', 'museum-media', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- A file is readable when its row is readable (row RLS applies inside these subqueries) or it is your own.
create policy "museum media read" on storage.objects for select using (
  bucket_id = 'museum-media' and (
    (select public.is_admin())
    or ((storage.foldername(name))[1] in ('exhibits', 'avatars')
        and (storage.foldername(name))[2] = (select auth.uid())::text)
    or exists (select 1 from public.exhibits e where e.image_path = name and e.status = 'published')
    or exists (select 1 from public.profiles p where p.avatar_path = name)
    or exists (select 1 from public.teachers t where t.photo_path = name)
    or exists (select 1 from public.events ev where ev.cover_image_path = name)
    or exists (select 1 from public.event_photos ph where ph.image_path = name)
  ));

-- No UPDATE policy: overwriting an existing object is denied for everyone except the service role.
create policy "museum media insert" on storage.objects for insert to authenticated with check (
  bucket_id = 'museum-media' and (
    ((storage.foldername(name))[1] in ('exhibits', 'avatars')
      and (storage.foldername(name))[2] = (select auth.uid())::text)
    or ((select public.is_admin()) and (storage.foldername(name))[1] in ('teachers', 'events', 'history'))
  ));
create policy "museum media delete" on storage.objects for delete to authenticated using (
  bucket_id = 'museum-media' and (
    ((storage.foldername(name))[1] in ('exhibits', 'avatars')
      and (storage.foldername(name))[2] = (select auth.uid())::text)
    or (select public.is_admin())
  ));

-- Generic categories (not faculty facts).
insert into public.exhibition_categories (name, description) values
  ('Веб аппликейшн', 'Вэб сайт ба вэб систем'),
  ('Мобайл аппликейшн', 'Гар утасны аппликейшн'),
  ('Өгөгдлийн сан ба анализ', 'Өгөгдлийн загвар, дүн шинжилгээ, тайлан'),
  ('Судалгаа', 'Судалгааны ажил ба илтгэл'),
  ('Бусад', 'Бусад технологийн төсөл');
