-- Schema do astro-neon-cms. Rode uma vez no seu Postgres (ex.: Neon).
--   psql "$DATABASE_URL" -f schema.sql
-- (ou cole no SQL editor do Neon)

create extension if not exists pgcrypto;

-- Editores do painel (login e-mail/senha; hash via pgcrypto/bcrypt).
create table if not exists editors (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  name          text not null,
  role          text not null default 'editor',         -- admin | editor
  password_hash text not null,
  must_reset    boolean not null default true,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz
);

-- Entradas de qualquer coleção. Campos do modelo vivem em `data` (JSONB);
-- draft/featured/ord são colunas porque a UI filtra/ordena por elas.
create table if not exists entries (
  id          uuid primary key default gen_random_uuid(),
  collection  text not null,
  slug        text not null,
  data        jsonb not null default '{}'::jsonb,
  draft       boolean not null default true,
  featured    boolean not null default false,
  ord         integer not null default 0,
  created_by  uuid references editors(id),
  updated_by  uuid references editors(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (collection, slug)
);
create index if not exists entries_collection_draft_idx on entries (collection, draft);

-- Páginas de campos fixos (singletons), guardadas como JSON chave→valor.
create table if not exists singletons (
  key        text primary key,
  data       jsonb not null default '{}'::jsonb,
  updated_by uuid references editors(id),
  updated_at timestamptz not null default now()
);

-- Histórico/autoria das edições.
create table if not exists revisions (
  id          uuid primary key default gen_random_uuid(),
  collection  text not null,
  entry_id    uuid,
  editor_id   uuid,
  editor_name text,
  action      text not null,                              -- create | update | delete
  snapshot    jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists revisions_entry_idx on revisions (collection, entry_id);
