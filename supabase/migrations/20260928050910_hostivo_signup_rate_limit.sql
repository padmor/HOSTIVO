-- Hostivo direct signup rate limiting
-- Keeps public signup resilient without relying on Supabase email delivery.
-- Identifiers are hashed before they are stored.

create table if not exists app_private.signup_rate_limits (
  rate_key text primary key,
  window_started_at timestamptz not null default now(),
  attempts integer not null default 0 check (attempts >= 0)
);

revoke all on table app_private.signup_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table app_private.signup_rate_limits to service_role;

create or replace function public.consume_signup_rate_limit(
  p_key text,
  p_max_attempts integer default 5,
  p_window_seconds integer default 900
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, app_private
as $function$
declare
  v_attempts integer;
begin
  if p_key is null or length(p_key) < 8 or length(p_key) > 128 then
    return false;
  end if;

  if p_max_attempts < 1 or p_max_attempts > 100 then
    raise exception 'Invalid rate limit maximum';
  end if;

  if p_window_seconds < 60 or p_window_seconds > 86400 then
    raise exception 'Invalid rate limit window';
  end if;

  insert into app_private.signup_rate_limits as r (
    rate_key,
    window_started_at,
    attempts
  )
  values (p_key, now(), 1)
  on conflict (rate_key) do update
  set
    window_started_at = case
      when extract(epoch from (now() - r.window_started_at)) >= p_window_seconds
        then excluded.window_started_at
      else r.window_started_at
    end,
    attempts = case
      when extract(epoch from (now() - r.window_started_at)) >= p_window_seconds
        then 1
      else r.attempts + 1
    end
  returning attempts into v_attempts;

  return v_attempts <= p_max_attempts;
end;
$function$;

revoke all on function public.consume_signup_rate_limit(text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_signup_rate_limit(text, integer, integer)
  to service_role;
