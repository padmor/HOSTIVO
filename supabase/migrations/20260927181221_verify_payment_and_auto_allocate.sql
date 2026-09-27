create or replace function app_private.verify_payment_and_allocate_core(
  p_payment_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_utc timestamptz := now();
  payment_row public.payments%rowtype;
  application_row public.applications%rowtype;
  charge_row public.charges%rowtype;
  selected_bed public.beds%rowtype;
  allocation_id uuid;
begin
  if p_payment_id is null then
    return jsonb_build_object('ok', false, 'code', 'invalid_payment');
  end if;

  select * into payment_row
  from public.payments
  where id = p_payment_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'payment_not_found');
  end if;

  if not app_private.is_hostel_manager(payment_row.hostel_id) then
    return jsonb_build_object('ok', false, 'code', 'not_authorized');
  end if;

  if payment_row.status = 'successful' then
    return jsonb_build_object('ok', true, 'code', 'already_verified', 'payment_id', payment_row.id, 'application_id', payment_row.application_id);
  end if;

  if payment_row.application_id is null or payment_row.tenant_id is null then
    return jsonb_build_object('ok', false, 'code', 'missing_application_context');
  end if;

  select * into application_row
  from public.applications
  where id = payment_row.application_id
    and hostel_id = payment_row.hostel_id
    and tenant_id = payment_row.tenant_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'application_not_found');
  end if;

  if payment_row.charge_id is not null then
    select * into charge_row
    from public.charges
    where id = payment_row.charge_id
      and hostel_id = payment_row.hostel_id
      and application_id = payment_row.application_id
      and tenant_id = payment_row.tenant_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'code', 'charge_not_found');
    end if;

    if payment_row.currency <> charge_row.currency
      or payment_row.amount < charge_row.amount then
      return jsonb_build_object('ok', false, 'code', 'amount_mismatch', 'required_amount', charge_row.amount, 'required_currency', charge_row.currency);
    end if;
  end if;

  select b.* into selected_bed
  from public.beds b
  join public.rooms r on r.id = b.room_id
  join public.floors f on f.id = r.floor_id
  join public.buildings bl on bl.id = f.building_id
  where bl.hostel_id = payment_row.hostel_id
    and b.status = 'available'
    and not exists (
      select 1
      from public.allocations a
      where a.bed_id = b.id
        and a.status in ('reserved', 'active')
        and a.starts_at <= now_utc
        and (a.ends_at is null or a.ends_at > now_utc)
    )
  order by bl.name, f.floor_number nulls first, r.room_number, b.bed_number
  for update of b skip locked
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'no_availability');
  end if;

  insert into public.allocations (
    hostel_id, tenant_id, application_id, bed_id, status, starts_at, allocated_at
  )
  values (
    payment_row.hostel_id, payment_row.tenant_id, payment_row.application_id,
    selected_bed.id, 'active', now_utc, now_utc
  )
  returning id into allocation_id;

  update public.beds
  set status = 'occupied', updated_at = now_utc
  where id = selected_bed.id;

  update public.tenants
  set status = 'active', updated_at = now_utc
  where id = payment_row.tenant_id
    and hostel_id = payment_row.hostel_id;

  update public.applications
  set status = 'allocated', updated_at = now_utc
  where id = payment_row.application_id
    and hostel_id = payment_row.hostel_id;

  update public.payments
  set status = 'successful',
      verified_at = now_utc,
      paid_at = coalesce(payment_row.paid_at, now_utc),
      updated_at = now_utc
  where id = payment_row.id;

  if payment_row.charge_id is not null then
    update public.charges
    set status = 'paid', updated_at = now_utc
    where id = payment_row.charge_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'code', 'allocated',
    'payment_id', payment_row.id,
    'application_id', payment_row.application_id,
    'allocation_id', allocation_id,
    'bed_id', selected_bed.id
  );
end;
$$;

revoke all on function app_private.verify_payment_and_allocate_core(uuid) from public;

create or replace function public.verify_payment_and_allocate(p_payment_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return jsonb_build_object('ok', false, 'code', 'authentication_required');
  end if;

  return app_private.verify_payment_and_allocate_core(p_payment_id);
end;
$$;

revoke all on function public.verify_payment_and_allocate(uuid) from public, anon;
grant execute on function public.verify_payment_and_allocate(uuid) to authenticated;
