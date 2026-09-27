create or replace function app_private.submit_payment_reference_core(
  p_charge_id uuid,
  p_provider text,
  p_provider_reference text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_utc timestamptz := now();
  charge_row public.charges%rowtype;
  application_row public.applications%rowtype;
  payment_id uuid;
  provider_value text := lower(trim(coalesce(p_provider, '')));
  reference_value text := trim(coalesce(p_provider_reference, ''));
begin
  if (select auth.uid()) is null then
    return jsonb_build_object('ok', false, 'code', 'authentication_required');
  end if;

  if p_charge_id is null
     or char_length(provider_value) < 2
     or char_length(provider_value) > 50
     or char_length(reference_value) < 3
     or char_length(reference_value) > 120 then
    return jsonb_build_object('ok', false, 'code', 'invalid_payment_details');
  end if;

  select c.*
    into charge_row
  from public.charges c
  where c.id = p_charge_id
    and c.tenant_id is not null
    and c.tenant_id in (
      select t.id
      from public.tenants t
      where t.user_id = (select auth.uid())
    )
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'charge_not_found');
  end if;

  if charge_row.status <> 'pending' then
    if charge_row.status = 'paid' then
      return jsonb_build_object('ok', true, 'code', 'already_paid', 'charge_id', charge_row.id);
    end if;
    return jsonb_build_object('ok', false, 'code', 'charge_not_payable');
  end if;

  if charge_row.application_id is null then
    return jsonb_build_object('ok', false, 'code', 'missing_application_context');
  end if;

  select a.*
    into application_row
  from public.applications a
  where a.id = charge_row.application_id
    and a.hostel_id = charge_row.hostel_id
    and a.tenant_id = charge_row.tenant_id
    and a.applicant_user_id = (select auth.uid())
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'code', 'application_not_found');
  end if;

  if exists (
    select 1
    from public.payments p
    where p.charge_id = charge_row.id
      and p.status = 'successful'
  ) then
    return jsonb_build_object('ok', true, 'code', 'already_paid', 'charge_id', charge_row.id);
  end if;

  if exists (
    select 1
    from public.payments p
    where p.provider = provider_value
      and p.provider_reference = reference_value
  ) then
    return jsonb_build_object('ok', false, 'code', 'duplicate_reference');
  end if;

  insert into public.payments (
    hostel_id,
    tenant_id,
    application_id,
    charge_id,
    provider,
    provider_reference,
    internal_reference,
    amount,
    currency,
    status,
    metadata,
    created_at,
    updated_at
  )
  values (
    charge_row.hostel_id,
    charge_row.tenant_id,
    charge_row.application_id,
    charge_row.id,
    provider_value,
    reference_value,
    'PAY-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)),
    charge_row.amount,
    charge_row.currency,
    'pending',
    jsonb_build_object(
      'source', 'tenant_portal',
      'submitted_by', (select auth.uid()),
      'submitted_at', now_utc
    ),
    now_utc,
    now_utc
  )
  returning id into payment_id;

  update public.applications
  set status = 'payment_pending',
      updated_at = now_utc
  where id = application_row.id;

  return jsonb_build_object(
    'ok', true,
    'code', 'submitted',
    'payment_id', payment_id,
    'charge_id', charge_row.id,
    'application_id', application_row.id
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'code', 'duplicate_reference');
end;
$$;

revoke all on function app_private.submit_payment_reference_core(uuid, text, text) from public;

create or replace function public.submit_payment_reference(
  p_charge_id uuid,
  p_provider text,
  p_provider_reference text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null then
    return jsonb_build_object('ok', false, 'code', 'authentication_required');
  end if;

  return app_private.submit_payment_reference_core(
    p_charge_id,
    p_provider,
    p_provider_reference
  );
end;
$$;

revoke all on function public.submit_payment_reference(uuid, text, text) from public, anon;
grant execute on function public.submit_payment_reference(uuid, text, text) to authenticated;
