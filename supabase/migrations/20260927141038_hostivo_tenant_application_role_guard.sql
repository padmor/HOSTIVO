create or replace function app_private.create_application_with_charge_core(
  p_user_id uuid,
  p_fee_plan_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_utc timestamptz := now();
  actor_role text;
  fee public.fee_plans%rowtype;
  applicant public.tenants%rowtype;
  existing_application public.applications%rowtype;
  available_beds integer;
  application_id uuid;
  application_number text;
  charge_id uuid;
  hostel_status text;
begin
  if p_user_id is null then
    raise exception 'authentication_required';
  end if;

  select role into actor_role
  from public.user_roles
  where user_id = p_user_id;

  if actor_role is distinct from 'tenant' then
    raise exception 'tenant_role_required';
  end if;

  select * into fee
  from public.fee_plans
  where id = p_fee_plan_id
    and status = 'active'
    and (starts_at is null or starts_at <= now_utc)
    and (ends_at is null or ends_at >= now_utc);

  if not found then
    raise exception 'invalid_fee_plan';
  end if;

  select status into hostel_status
  from public.hostels
  where id = fee.hostel_id;

  if hostel_status is distinct from 'active' then
    raise exception 'invalid_hostel';
  end if;

  select * into applicant
  from public.tenants
  where user_id = p_user_id
    and hostel_id = fee.hostel_id
  order by created_at desc
  limit 1;

  if not found then
    insert into public.tenants (user_id, hostel_id, status)
    values (p_user_id, fee.hostel_id, 'applicant')
    returning * into applicant;
  end if;

  select * into existing_application
  from public.applications
  where hostel_id = fee.hostel_id
    and applicant_user_id = p_user_id
    and status in ('submitted', 'payment_pending', 'paid', 'allocated')
  order by created_at desc
  limit 1;

  if found then
    return jsonb_build_object(
      'ok', false,
      'code', 'already_applied',
      'application_id', existing_application.id
    );
  end if;

  select count(*) into available_beds
  from public.beds b
  join public.rooms r on r.id = b.room_id
  join public.floors f on f.id = r.floor_id
  join public.buildings bl on bl.id = f.building_id
  where bl.hostel_id = fee.hostel_id
    and b.status = 'available'
    and not exists (
      select 1
      from public.allocations a
      where a.bed_id = b.id
        and a.status in ('reserved', 'active')
        and a.starts_at <= now_utc
        and (a.ends_at is null or a.ends_at > now_utc)
    );

  if available_beds <= 0 then
    return jsonb_build_object('ok', false, 'code', 'no_availability');
  end if;

  application_number :=
    'APP-' || to_char(now_utc, 'YYYYMMDD') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.applications (
    hostel_id, applicant_user_id, tenant_id,
    application_number, status, submitted_at
  )
  values (
    fee.hostel_id, p_user_id, applicant.id,
    application_number, 'payment_pending', now_utc
  )
  returning id into application_id;

  insert into public.charges (
    hostel_id, tenant_id, application_id, fee_plan_id,
    description, amount, currency, status
  )
  values (
    fee.hostel_id, applicant.id, application_id, fee.id,
    fee.name, fee.amount, fee.currency, 'pending'
  )
  returning id into charge_id;

  return jsonb_build_object(
    'ok', true,
    'application_id', application_id,
    'charge_id', charge_id,
    'available_beds', available_beds
  );
end;
$$;