-- Supabase SQL Schema for CafeCounterPro
-- Run this in your Supabase SQL Editor

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  coffee_type text not null check (coffee_type in ('Curto', 'Longo', 'Normal', 'Descafeinado', 'Outro')),
  custom_coffee text,
  person_name text not null,
  status text not null default 'pendente' check (status in ('pendente', 'pronto')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table orders enable row level security;

-- Allow public read and write (for multi-device sync without authentication).
-- NOTE: For a production deployment consider adding authentication and
-- restricting these policies to authenticated users or using Supabase Auth
-- to limit access to a specific set of users.
create policy "Allow public read" on orders for select using (true);
create policy "Allow public insert" on orders for insert with check (true);
create policy "Allow public update" on orders for update using (true);
create policy "Allow public delete" on orders for delete using (true);

-- Enable realtime
alter publication supabase_realtime add table orders;
