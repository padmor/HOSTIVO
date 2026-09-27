create unique index if not exists tenants_user_hostel_unique
  on public.tenants (user_id, hostel_id);

create unique index if not exists applications_one_active_per_user_hostel
  on public.applications (hostel_id, applicant_user_id)
  where status in ('submitted', 'payment_pending', 'paid', 'allocated');

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
  fee public.fee_plans%rowtype;
  applicant public.tenants%rowtype;
  existing_application public.applications%rowtype;
  available_beds integer;
  application_id uuid;
  application_number text;
  charge_id uuid;
begin
  if p_user_id is null then
    raise exception 'authentication_required';
  end if;

  select *
    into fee
  from public.fee_plans
  where id = p_fee_plan_id
    and status = 'active'
    and (starts_at is null or starts_at <= now_utc)
    and (ends_at is null or ends_at >= now_utc);

  if not found then
    raise exception 'invalid_fee_plan';
  end if;

  select *
    into applicant
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

  select *
    into existing_application
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

  select count(*)
    into available_beds
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

revoke all on function app_private.create_application_with_charge_core(uuid, uuid)
  from public;

grant execute on function app_private.create_application_with_charge_core(uuid, uuid)
  to authenticated;

create or replace function public.create_application_with_charge(p_fee_plan_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  return app_private.create_application_with_charge_core(auth.uid(), p_fee_plan_id);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'already_applied');
end;
$$;

revoke all on function public.create_application_with_charge(uuid)
  from public, anon;

grant execute on function public.create_application_with_charge(uuid)
  to authenticated;
