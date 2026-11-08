-- English versions of teacher profile text. Shown in EN mode; an empty value falls back to the Mongolian column.
-- Table-level grants and RLS policies on public.teachers already cover new columns.
alter table public.teachers
  add column if not exists name_en text,
  add column if not exists position_en text,
  add column if not exists courses_en text[] not null default '{}',
  add column if not exists bio_en text;
