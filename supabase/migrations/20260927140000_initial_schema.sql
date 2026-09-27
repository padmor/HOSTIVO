-- Hostivo initial database schema
-- Scope: MVP data model only.
-- This migration creates database structures; it does not create application code.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create schema if not exists app_private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('system_admin', 'manager', 'staff', 'tenant')),
  created_at timestamptz not null default now()
);

create table public.hostels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  contact_phone text,
  contact_email text,
  status text not null default 'active'
    check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.hostel_memberships (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null
    check (membership_role in ('manager', 'staff', 'tenant')),
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, user_id)
);

create table public.buildings (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete cascade,
  name text not null,
  code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, name),
  unique (hostel_id, code)
);

create table public.floors (
  id uuid primary key default gen_random_uuid(),
  building_id uuid not null references public.buildings(id) on delete cascade,
  name text not null,
  floor_number integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (building_id, name)
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  floor_id uuid not null references public.floors(id) on delete cascade,
  room_number text not null,
  capacity integer not null check (capacity > 0),
  status text not null default 'available'
    check (status in ('available', 'occupied', 'maintenance', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (floor_id, room_number)
);

create table public.beds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  bed_number text not null,
  status text not null default 'available'
    check (status in ('available', 'occupied', 'reserved', 'maintenance', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (room_id, bed_number)
);

create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  status text not null default 'applicant'
    check (status in ('applicant', 'active', 'checked_out', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, tenant_number)
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  applicant_user_id uuid not null references auth.users(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete set null,
  application_number text not null,
  status text not null default 'draft'
    check (status in (
      'draft',
      'submitted',
      'payment_pending',
      'paid',
      'allocated',
      'completed',
      'cancelled',
      'expired'
    )),
  submitted_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, application_number)
);

create table public.fee_plans (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  name text not null,
  description text,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'expired')),
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, name)
);

create table public.charges (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete restrict,
  application_id uuid references public.applications(id) on delete restrict,
  fee_plan_id uuid references public.fee_plans(id) on delete set null,
  description text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null,
  status text not null default 'pending'
    check (status in ('pending', 'partially_paid', 'paid', 'void', 'refunded')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete restrict,
  application_id uuid references public.applications(id) on delete restrict,
  charge_id uuid references public.charges(id) on delete restrict,
  provider text not null,
  provider_reference text not null,
  internal_reference text not null,
  amount numeric(12,2) not null check (amount > 0),
  currency char(3) not null,
  status text not null default 'initiated'
    check (status in (
      'initiated',
      'pending',
      'successful',
      'failed',
      'cancelled',
      'refunded',
      'reversed'
    )),
  verified_at timestamptz,
  paid_at timestamptz,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_reference),
  unique (internal_reference)
);

create table public.allocations (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  application_id uuid references public.applications(id) on delete set null,
  bed_id uuid not null references public.beds(id) on delete restrict,
  status text not null default 'reserved'
    check (status in ('reserved', 'active', 'ended', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  allocated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);

alter table public.allocations
  add constraint allocations_no_bed_overlap
  exclude using gist (
    bed_id with =,
    tstzrange(starts_at, coalesce(ends_at, 'infinity'::timestamptz), '[)') with &&
  )
  where (status in ('reserved', 'active'));

alter table public.allocations
  add constraint allocations_no_tenant_overlap
  exclude using gist (
    tenant_id with =,
    tstzrange(starts_at, coalesce(ends_at, 'infinity'::timestamptz), '[)') with &&
  )
  where (status in ('reserved', 'active'));

create table public.stays (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid not null references public.tenants(id) on delete restrict,
  allocation_id uuid not null references public.allocations(id) on delete restrict,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'checked_in', 'active', 'checked_out', 'cancelled')),
  scheduled_check_in_at timestamptz,
  checked_in_at timestamptz,
  checked_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    checked_out_at is null
    or checked_in_at is null
    or checked_out_at >= checked_in_at
  )
);

create unique index stays_one_current_per_tenant
  on public.stays (tenant_id)
  where status in ('scheduled', 'checked_in', 'active');

create unique index stays_one_non_cancelled_per_allocation
  on public.stays (allocation_id)
  where status <> 'cancelled';

create table public.maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  bed_id uuid references public.beds(id) on delete set null,
  title text not null,
  description text not null,
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'submitted'
    check (status in (
      'submitted',
      'received',
      'assigned',
      'in_progress',
      'resolved',
      'closed',
      'cancelled'
    )),
  assigned_staff_id uuid references public.staff(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete set null,
  subject text not null,
  description text not null,
  status text not null default 'submitted'
    check (status in (
      'submitted',
      'under_review',
      'in_progress',
      'resolved',
      'closed',
      'withdrawn'
    )),
  handled_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  tenant_id uuid references public.tenants(id) on delete set null,
  room_id uuid references public.rooms(id) on delete set null,
  incident_type text not null
    check (incident_type in (
      'damage',
      'dispute',
      'rule_violation',
      'security',
      'lost_property',
      'other'
    )),
  description text not null,
  status text not null default 'submitted'
    check (status in ('submitted', 'under_review', 'in_progress', 'resolved', 'closed')),
  reported_by uuid not null references auth.users(id) on delete restrict,
  handled_by uuid references auth.users(id) on delete set null,
  occurred_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.staff (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  staff_number text,
  department text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hostel_id, user_id),
  unique (hostel_id, staff_number)
);

create table public.staff_tasks (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  assigned_staff_id uuid not null references public.staff(id) on delete restrict,
  maintenance_request_id uuid references public.maintenance_requests(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'pending'
    check (status in ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null,
  body text not null,
  audience_type text not null
    check (audience_type in ('all_tenants', 'building', 'room', 'staff', 'custom')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  type text not null,
  title text not null,
  body text not null,
  related_entity text,
  related_id uuid,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid references public.hostels(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  result text not null check (result in ('success', 'failure')),
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  hostel_id uuid not null references public.hostels(id) on delete restrict,
  uploaded_by uuid not null references auth.users(id) on delete restrict,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  related_entity text,
  related_id uuid,
  created_at timestamptz not null default now(),
  unique (storage_path)
);

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function app_private.set_updated_at();

create trigger hostels_set_updated_at before update on public.hostels
for each row execute function app_private.set_updated_at();

create trigger hostel_memberships_set_updated_at before update on public.hostel_memberships
for each row execute function app_private.set_updated_at();

create trigger buildings_set_updated_at before update on public.buildings
for each row execute function app_private.set_updated_at();

create trigger floors_set_updated_at before update on public.floors
for each row execute function app_private.set_updated_at();

create trigger rooms_set_updated_at before update on public.rooms
for each row execute function app_private.set_updated_at();

create trigger beds_set_updated_at before update on public.beds
for each row execute function app_private.set_updated_at();

create trigger tenants_set_updated_at before update on public.tenants
for each row execute function app_private.set_updated_at();

create trigger applications_set_updated_at before update on public.applications
for each row execute function app_private.set_updated_at();

create trigger fee_plans_set_updated_at before update on public.fee_plans
for each row execute function app_private.set_updated_at();

create trigger charges_set_updated_at before update on public.charges
for each row execute function app_private.set_updated_at();

create trigger payments_set_updated_at before update on public.payments
for each row execute function app_private.set_updated_at();

create trigger allocations_set_updated_at before update on public.allocations
for each row execute function app_private.set_updated_at();

create trigger stays_set_updated_at before update on public.stays
for each row execute function app_private.set_updated_at();

create trigger maintenance_requests_set_updated_at before update on public.maintenance_requests
for each row execute function app_private.set_updated_at();

create trigger complaints_set_updated_at before update on public.complaints
for each row execute function app_private.set_updated_at();

create trigger incidents_set_updated_at before update on public.incidents
for each row execute function app_private.set_updated_at();

create trigger staff_set_updated_at before update on public.staff
for each row execute function app_private.set_updated_at();

create trigger staff_tasks_set_updated_at before update on public.staff_tasks
for each row execute function app_private.set_updated_at();

create trigger announcements_set_updated_at before update on public.announcements
for each row execute function app_private.set_updated_at();

-- Helpful indexes for expected access patterns.
create index hostel_memberships_user_idx on public.hostel_memberships (user_id);
create index hostel_memberships_hostel_role_idx on public.hostel_memberships (hostel_id, membership_role, status);

create index buildings_hostel_idx on public.buildings (hostel_id);
create index floors_building_idx on public.floors (building_id);
create index rooms_floor_idx on public.rooms (floor_id);
create index beds_room_status_idx on public.beds (room_id, status);

create index tenants_user_idx on public.tenants (user_id);
create index tenants_hostel_status_idx on public.tenants (hostel_id, status);

create index applications_hostel_status_idx on public.applications (hostel_id, status);
create index applications_applicant_idx on public.applications (applicant_user_id);

create index fee_plans_hostel_status_idx on public.fee_plans (hostel_id, status);
create index charges_hostel_status_idx on public.charges (hostel_id, status);
create index charges_tenant_idx on public.charges (tenant_id);

create index payments_hostel_status_idx on public.payments (hostel_id, status);
create index payments_tenant_idx on public.payments (tenant_id);
create index payments_application_idx on public.payments (application_id);
create index payments_charge_idx on public.payments (charge_id);

create index allocations_hostel_status_idx on public.allocations (hostel_id, status);
create index allocations_tenant_idx on public.allocations (tenant_id);
create index allocations_bed_idx on public.allocations (bed_id);

create index stays_hostel_status_idx on public.stays (hostel_id, status);
create index stays_tenant_idx on public.stays (tenant_id);

create index maintenance_hostel_status_idx on public.maintenance_requests (hostel_id, status);
create index maintenance_assigned_staff_idx on public.maintenance_requests (assigned_staff_id);

create index complaints_hostel_status_idx on public.complaints (hostel_id, status);
create index incidents_hostel_status_idx on public.incidents (hostel_id, status);

create index staff_hostel_status_idx on public.staff (hostel_id, status);
create index staff_tasks_assigned_status_idx on public.staff_tasks (assigned_staff_id, status);

create index announcements_hostel_status_idx on public.announcements (hostel_id, status);
create index notifications_user_read_idx on public.notifications (user_id, read_at);
create index audit_logs_hostel_created_idx on public.audit_logs (hostel_id, created_at desc);
