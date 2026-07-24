-- Grant service_role full CRUD on app tables. RLS remains enabled with no
-- policies, so anon/authenticated still get nothing (see 0001_init.sql); this
-- only restores the table-level privileges service_role needs to bypass RLS
-- and read/write, which newer Supabase projects no longer auto-expose.

grant select, insert, update, delete on public.concepts     to service_role;
grant select, insert, update, delete on public.rooms        to service_role;
grant select, insert, update, delete on public.participants to service_role;
grant select, insert, update, delete on public.votes        to service_role;
