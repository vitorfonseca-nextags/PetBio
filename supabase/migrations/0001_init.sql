-- PetBio — Fase 1: schema inicial (orders, cards, login_codes) + storage + RLS
-- Como rodar: Supabase Dashboard → SQL Editor → colar este arquivo inteiro → Run.
-- Decisões documentadas em docs/SCHEMA.md.

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text not null unique,
  status text not null default 'draft' check (status in ('draft', 'preview_sent', 'paid')),
  plan text check (plan in ('simples', 'completo')),
  owner_whatsapp text,
  owner_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  slug text not null unique,
  is_watermarked boolean not null default true,
  qr_url text,
  -- blocos do card como JSON (decisão documentada em docs/SCHEMA.md)
  identidade jsonb not null default '{}'::jsonb,
  alimentacao jsonb not null default '{}'::jsonb,
  saude jsonb not null default '{}'::jsonb,
  personalidade_rotina jsonb not null default '{}'::jsonb,
  historico jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cards_order_id_idx on public.cards(order_id);

create table if not exists public.login_codes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  email text,
  code text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists login_codes_order_id_idx on public.login_codes(order_id);
create index if not exists login_codes_code_idx on public.login_codes(code);

-- ============================================================================
-- 2. updated_at automático
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

drop trigger if exists set_cards_updated_at on public.cards;
create trigger set_cards_updated_at
  before update on public.cards
  for each row execute function public.set_updated_at();

-- ============================================================================
-- 3. STORAGE — bucket de fotos dos pets
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

-- ============================================================================
-- 4. RLS — orders e login_codes: nenhum acesso público (só service role, que
--    ignora RLS por padrão). Toda escrita/leitura passa pelas rotas de API.
-- ============================================================================

alter table public.orders enable row level security;
alter table public.login_codes enable row level security;

-- ============================================================================
-- 5. RLS — cards: leitura pública só do card pago e sem marca d'água.
--    A prévia (is_watermarked=true) é lida no servidor com a service role,
--    identificando o card pelo order_code vindo da própria URL — não pela
--    anon key do browser. Ver docs/SCHEMA.md.
-- ============================================================================

alter table public.cards enable row level security;

drop policy if exists "public_read_paid_cards" on public.cards;
create policy "public_read_paid_cards"
  on public.cards
  for select
  to anon, authenticated
  using (is_watermarked = false);

-- ============================================================================
-- 6. RLS — storage.objects: leitura pública das fotos (bucket já é público),
--    escrita bloqueada para anon (upload passa pela service role até a Fase 3
--    decidir o fluxo definitivo de upload).
-- ============================================================================

drop policy if exists "public_read_pet_photos" on storage.objects;
create policy "public_read_pet_photos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'pet-photos');
