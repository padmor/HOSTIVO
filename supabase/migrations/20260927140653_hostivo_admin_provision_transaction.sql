create or replace function public.admin_provision_user(
  p_actor_user_id uuid,
  p_target_user_id uuid,
  p_hostel_id uuid,
  p_role text,
  p_full_name text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_role text;
  target_role text;
  hostel_status text;
begin
  select role into actor_role
  from public.user_roles
  where user_id = p_actor_user_id;

  if actor_role <> 'system_admin' then
    raise exception 'forbidden';
  end if;

  if p_role not in ('manager', 'staff') then
    raise exception 'invalid_role';
  end if;

  select status into hostel_status
  from public.hostels
  where id = p_hostel_id;

  if hostel_status is distinct from 'active' then
    raise exception 'invalid_hostel';
  end if;

  select role into target_role
  from public.user_roles
  where user_id = p_target_user_id;

  if target_role = 'system_admin' then
    raise exception 'protected_account';
  end if;

  insert into public.user_roles (user_id, role)
  values (p_target_user_id, p_role)
  on conflict (user_id)
  do update set role = excluded.role;

  insert into public.hostel_memberships (
    hostel_id,
    user_id,
    membership_role,
    status
  )
  values (
    p_hostel_id,
    p_target_user_id,
    p_role,
    'active'
  )
  on conflict (hostel_id, user_id)
  do update set
    membership_role = excluded.membership_role,
    status = 'active';

  update public.profiles
  set
    full_name = p_full_name,
    email = p_email,
    updated_at = now()
  where id = p_target_user_id;

  insert into public.audit_logs (
    actor_user_id,
    hostel_id,
    action,
    entity_type,
    entity_id,
    result,
    metadata
  )
  values (
    p_actor_user_id,
    p_hostel_id,
    'provision_user',
    'user_provisioning',
    p_target_user_id,
    'success',
    jsonb_build_object(
      'email', p_email,
      'role', p_role
    )
  );

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.admin_provision_user(uuid, uuid, uuid, text, text, text)
  from public, anon, authenticated;

grant execute on function public.admin_provision_user(uuid, uuid, uuid, text, text, text)
  to service_role;
