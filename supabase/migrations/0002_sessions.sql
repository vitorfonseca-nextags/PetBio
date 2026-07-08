-- PetBio — Fase 7: sessões da área do cliente (login por código, sem senha)
-- Como rodar: Supabase Dashboard → SQL Editor → colar este arquivo inteiro → Run.
-- Decisões documentadas em docs/FASE7.md.

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists sessions_email_idx on public.sessions(email);

-- Igual a orders/login_codes: nenhum acesso público. Só a service role (usada
-- em /lib/session.ts, sempre no servidor) lê/escreve essa tabela.
alter table public.sessions enable row level security;
