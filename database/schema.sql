// banco de dados inicial 
  

create extension if not exists pgcrypto;

create table if not exists public.collection_points (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  category varchar(60) not null default 'Ecoponto',
  address varchar(220) not null,
  latitude double precision not null,
  longitude double precision not null,
  materials text[] not null default '{}',
  opening_hours varchar(150),
  contact varchar(120),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.recycling_events (
  id uuid primary key default gen_random_uuid(),
  name varchar(120) not null,
  organizer varchar(120),
  address varchar(220) not null,
  latitude double precision not null,
  longitude double precision not null,
  materials text[] not null default '{}',
  start_at timestamptz not null,
  end_at timestamptz not null,
  description text,
  created_at timestamptz not null default now(),
  constraint event_dates_ok check (end_at >= start_at)
);

alter table public.collection_points enable row level security;
alter table public.recycling_events enable row level security;

-- Políticas abertas apenas para demonstração acadêmica.
-- Em produção, use autenticação e políticas restritas.
drop policy if exists "public read collection_points" on public.collection_points;
create policy "public read collection_points"
on public.collection_points for select
to anon, authenticated
using (true);

drop policy if exists "public insert collection_points" on public.collection_points;
create policy "public insert collection_points"
on public.collection_points for insert
to anon, authenticated
with check (true);

drop policy if exists "public update collection_points" on public.collection_points;
create policy "public update collection_points"
on public.collection_points for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public delete collection_points" on public.collection_points;
create policy "public delete collection_points"
on public.collection_points for delete
to anon, authenticated
using (true);

drop policy if exists "public read recycling_events" on public.recycling_events;
create policy "public read recycling_events"
on public.recycling_events for select
to anon, authenticated
using (true);

drop policy if exists "public insert recycling_events" on public.recycling_events;
create policy "public insert recycling_events"
on public.recycling_events for insert
to anon, authenticated
with check (true);

drop policy if exists "public update recycling_events" on public.recycling_events;
create policy "public update recycling_events"
on public.recycling_events for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public delete recycling_events" on public.recycling_events;
create policy "public delete recycling_events"
on public.recycling_events for delete
to anon, authenticated
using (true);

-- Dados de exemplo (Maringá/PR - coordenadas aproximadas e dados fictícios)
insert into public.collection_points
(name, category, address, latitude, longitude, materials, opening_hours, contact, notes)
values
('Ecoponto Central - Exemplo', 'Ecoponto', 'Maringá - PR', -23.4205, -51.9333,
 array['Papel','Plástico','Vidro','Metal'], 'Seg a Sex, 08h às 17h', '(44) 3000-0001',
 'Registro fictício para demonstração acadêmica.'),
('Coleta Eletrônica - Exemplo', 'Logística reversa', 'Maringá - PR', -23.4270, -51.9380,
 array['Eletrônicos','Pilhas','Baterias','Cabos'], 'Seg a Sáb, 09h às 18h', '(44) 3000-0002',
 'Registro fictício para demonstração acadêmica.');

insert into public.recycling_events
(name, organizer, address, latitude, longitude, materials, start_at, end_at, description)
values
('Dia do Descarte Consciente - Exemplo', 'EcoPerto',
 'Maringá - PR', -23.4140, -51.9280,
 array['Eletrônicos','Roupas','Óleo de cozinha'],
 now() + interval '7 days',
 now() + interval '7 days 6 hours',
 'Evento fictício para demonstração acadêmica.');
