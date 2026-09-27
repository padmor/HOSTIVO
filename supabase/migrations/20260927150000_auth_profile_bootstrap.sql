-- Hostivo authentication profile bootstrap
-- Creates application profile records and a default tenant role
-- whenever a new Supabase Auth user is created.

create or replace function app_private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'tenant')
  on conflict (user_id) do nothing;

  return new;
end;
$function$;

revoke all on function app_private.handle_new_auth_user() from public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function app_private.handle_new_auth_user();
