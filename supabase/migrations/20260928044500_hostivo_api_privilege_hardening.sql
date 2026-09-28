-- Hostivo API privilege hardening
-- Keep anonymous access limited to public accommodation discovery.
revoke all privileges on all tables in schema public from anon;
grant select on table public.hostels, public.fee_plans to anon;

drop policy if exists hostels_anon_select_active on public.hostels;
create policy hostels_anon_select_active
on public.hostels
for select
to anon
using (status = 'active');

drop policy if exists fee_plans_anon_select_active on public.fee_plans;
create policy fee_plans_anon_select_active
on public.fee_plans
for select
to anon
using (
  status = 'active'
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

revoke truncate, references, trigger on all tables in schema public from authenticated;

alter default privileges for role postgres in schema public
  revoke all on tables from anon;

alter default privileges for role postgres in schema public
  revoke truncate, references, trigger on tables from authenticated;
