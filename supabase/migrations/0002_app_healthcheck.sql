-- Healthcheck row touched by Vercel Cron and GitHub Actions.

create table if not exists public.app_healthcheck (
  id int primary key,
  touched_at timestamptz not null default now(),
  source text,
  last_status text
);

alter table public.app_healthcheck enable row level security;

grant select, insert, update on public.app_healthcheck to service_role;

insert into public.app_healthcheck (id, source, last_status)
values (1, 'migration', 'initialized')
on conflict (id) do nothing;
