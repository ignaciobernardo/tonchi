-- Run this once in Supabase: SQL Editor → New query → paste → Run.
-- Replace the email below with the one you'll use to log in to /admin/.

create table if not exists public.photos (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  image       text not null
              check (image like 'data:image/jpeg;base64,%' and length(image) < 400000),
  status      text not null default 'pending' check (status in ('pending', 'approved'))
);

alter table public.photos enable row level security;

-- Visitors can only ADD photos, and only as "pending".
create policy "visitors submit pending photos" on public.photos
  for insert to anon, authenticated
  with check (status = 'pending');

-- Visitors can only SEE photos you approved.
create policy "visitors see approved photos" on public.photos
  for select to anon, authenticated
  using (status = 'approved');

-- Only you (by email) can see pending ones, approve, or delete.
create policy "admin sees all" on public.photos
  for select to authenticated
  using ((auth.jwt() ->> 'email') = 'trinidadmattasch@gmail.com');

create policy "admin approves" on public.photos
  for update to authenticated
  using ((auth.jwt() ->> 'email') = 'trinidadmattasch@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'trinidadmattasch@gmail.com');

create policy "admin deletes" on public.photos
  for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'trinidadmattasch@gmail.com');
