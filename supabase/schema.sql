-- 自分の「新規の学習用」Supabaseプロジェクトで一度実行してください。
-- 同名の既存テーブルがある場合は停止します。実データのあるDBでは実行しません。
begin;

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 80),
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create index tasks_user_created_idx on public.tasks (user_id, created_at desc);
alter table public.tasks enable row level security;

-- ログイン前は読み書き不可。所有者やIDの書き換えも許可しません。
revoke all on public.tasks from anon, authenticated;
grant select, delete on public.tasks to authenticated;
grant insert (title, done) on public.tasks to authenticated;
grant update (title, done) on public.tasks to authenticated;

create policy "read own tasks" on public.tasks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "create own tasks" on public.tasks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "update own tasks" on public.tasks
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "delete own tasks" on public.tasks
  for delete to authenticated using ((select auth.uid()) = user_id);

commit;
