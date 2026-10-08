create table public.tracker_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  ts bigint not null default 0,
  json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.tracker_state enable row level security;
create policy "own row select" on public.tracker_state for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row insert" on public.tracker_state for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row update" on public.tracker_state for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own row delete" on public.tracker_state for delete to authenticated using ((select auth.uid()) = user_id);
