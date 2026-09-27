-- Hostivo RLS and authorization foundation.
-- Database-level access control for MVP application data.

create or replace function app_private.is_system_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = auth.uid()
      and role = 'system_admin'
  );
$$;

create or replace function app_private.is_hostel_manager(p_hostel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_system_admin()
    or exists (
      select 1
      from public.hostel_memberships
      where user_id = auth.uid()
        and hostel_id = p_hostel_id
        and membership_role = 'manager'
        and status = 'active'
    );
$$;

create or replace function app_private.is_hostel_staff(p_hostel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_hostel_manager(p_hostel_id)
    or exists (
      select 1
      from public.hostel_memberships
      where user_id = auth.uid()
        and hostel_id = p_hostel_id
        and membership_role = 'staff'
        and status = 'active'
    );
$$;

create or replace function app_private.owns_tenant(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenants
    where id = p_tenant_id
      and user_id = auth.uid()
  );
$$;

create or replace function app_private.has_active_tenant_membership(p_hostel_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.hostel_memberships
    where user_id = auth.uid()
      and hostel_id = p_hostel_id
      and membership_role = 'tenant'
      and status = 'active'
  );
$$;

create or replace function app_private.manager_can_access_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select app_private.is_system_admin()
    or exists (
      select 1
      from public.hostel_memberships target
      join public.hostel_memberships actor
        on actor.hostel_id = target.hostel_id
       and actor.user_id = auth.uid()
       and actor.membership_role = 'manager'
       and actor.status = 'active'
      where target.user_id = p_user_id
        and target.status = 'active'
    );
$$;

create or replace function app_private.is_staff_member_of_hostel(
  p_staff_id uuid,
  p_hostel_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $
  select exists (
    select 1
    from public.staff
    where id = p_staff_id
      and hostel_id = p_hostel_id
      and user_id = auth.uid()
      and status = 'active'
  );
$;

create or replace function app_private.building_hostel_id(p_building_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select hostel_id
  from public.buildings
  where id = p_building_id;
$$;

create or replace function app_private.floor_hostel_id(p_floor_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select b.hostel_id
  from public.floors f
  join public.buildings b on b.id = f.building_id
  where f.id = p_floor_id;
$$;

create or replace function app_private.room_hostel_id(p_room_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select b.hostel_id
  from public.rooms r
  join public.floors f on f.id = r.floor_id
  join public.buildings b on b.id = f.building_id
  where r.id = p_room_id;
$$;

create or replace function app_private.bed_hostel_id(p_bed_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select b.hostel_id
  from public.beds be
  join public.rooms r on r.id = be.room_id
  join public.floors f on f.id = r.floor_id
  join public.buildings b on b.id = f.building_id
  where be.id = p_bed_id;
$$;

revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;

grant execute on function app_private.is_system_admin() to authenticated;
grant execute on function app_private.is_hostel_manager(uuid) to authenticated;
grant execute on function app_private.is_hostel_staff(uuid) to authenticated;
grant execute on function app_private.owns_tenant(uuid) to authenticated;
grant execute on function app_private.has_active_tenant_membership(uuid) to authenticated;
grant execute on function app_private.manager_can_access_user(uuid) to authenticated;
grant execute on function app_private.building_hostel_id(uuid) to authenticated;
grant execute on function app_private.floor_hostel_id(uuid) to authenticated;
grant execute on function app_private.room_hostel_id(uuid) to authenticated;
grant execute on function app_private.bed_hostel_id(uuid) to authenticated;

-- Explicit application-role table privileges. Anonymous clients receive no table privileges.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.hostels enable row level security;
alter table public.hostel_memberships enable row level security;
alter table public.buildings enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.beds enable row level security;
alter table public.tenants enable row level security;
alter table public.applications enable row level security;
alter table public.fee_plans enable row level security;
alter table public.charges enable row level security;
alter table public.payments enable row level security;
alter table public.allocations enable row level security;
alter table public.stays enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.complaints enable row level security;
alter table public.incidents enable row level security;
alter table public.staff enable row level security;
alter table public.staff_tasks enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.files enable row level security;

-- Profiles
create policy profiles_select_self_or_manager
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or app_private.manager_can_access_user(id)
);

create policy profiles_insert_self
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy profiles_update_self
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Roles
create policy user_roles_select_self_or_admin
on public.user_roles for select
to authenticated
using (
  user_id = auth.uid()
  or app_private.is_system_admin()
  or app_private.manager_can_access_user(user_id)
);

create policy user_roles_admin_write
on public.user_roles for all
to authenticated
using (app_private.is_system_admin())
with check (app_private.is_system_admin());

-- Hostels
create policy hostels_select_authorized
on public.hostels for select
to authenticated
using (app_private.is_hostel_staff(id) or status = 'active');

create policy hostels_manager_update
on public.hostels for update
to authenticated
using (app_private.is_hostel_manager(id))
with check (app_private.is_hostel_manager(id));

create policy hostels_admin_insert
on public.hostels for insert
to authenticated
with check (app_private.is_system_admin());

create policy hostels_admin_delete
on public.hostels for delete
to authenticated
using (app_private.is_system_admin());

-- Memberships
create policy memberships_select_self_or_staff
on public.hostel_memberships for select
to authenticated
using (
  user_id = auth.uid()
  or app_private.is_hostel_staff(hostel_id)
);

create policy memberships_manager_insert
on public.hostel_memberships for insert
to authenticated
with check (app_private.is_hostel_manager(hostel_id));

create policy memberships_manager_update
on public.hostel_memberships for update
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

create policy memberships_manager_delete
on public.hostel_memberships for delete
to authenticated
using (app_private.is_hostel_manager(hostel_id));

-- Hostel structure
create policy buildings_select_staff
on public.buildings for select
to authenticated
using (app_private.is_hostel_staff(hostel_id));

create policy buildings_manager_insert
on public.buildings for insert
to authenticated
with check (app_private.is_hostel_manager(hostel_id));

create policy buildings_manager_update
on public.buildings for update
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

create policy buildings_manager_delete
on public.buildings for delete
to authenticated
using (app_private.is_hostel_manager(hostel_id));

create policy floors_select_staff
on public.floors for select
to authenticated
using (app_private.is_hostel_staff(app_private.floor_hostel_id(id)));

create policy floors_manager_insert
on public.floors for insert
to authenticated
with check (app_private.is_hostel_manager(app_private.building_hostel_id(building_id)));

create policy floors_manager_update
on public.floors for update
to authenticated
using (app_private.is_hostel_manager(app_private.floor_hostel_id(id)))
with check (app_private.is_hostel_manager(app_private.building_hostel_id(building_id)));

create policy floors_manager_delete
on public.floors for delete
to authenticated
using (app_private.is_hostel_manager(app_private.floor_hostel_id(id)));

create policy rooms_select_staff
on public.rooms for select
to authenticated
using (app_private.is_hostel_staff(app_private.room_hostel_id(id)));

create policy rooms_manager_insert
on public.rooms for insert
to authenticated
with check (app_private.is_hostel_manager(app_private.floor_hostel_id(floor_id)));

create policy rooms_manager_update
on public.rooms for update
to authenticated
using (app_private.is_hostel_manager(app_private.room_hostel_id(id)))
with check (app_private.is_hostel_manager(app_private.floor_hostel_id(floor_id)));

create policy rooms_manager_delete
on public.rooms for delete
to authenticated
using (app_private.is_hostel_manager(app_private.room_hostel_id(id)));

create policy beds_select_staff
on public.beds for select
to authenticated
using (app_private.is_hostel_staff(app_private.bed_hostel_id(id)));

create policy beds_manager_insert
on public.beds for insert
to authenticated
with check (app_private.is_hostel_manager(app_private.room_hostel_id(room_id)));

create policy beds_manager_update
on public.beds for update
to authenticated
using (app_private.is_hostel_manager(app_private.bed_hostel_id(id)))
with check (app_private.is_hostel_manager(app_private.room_hostel_id(room_id)));

create policy beds_manager_delete
on public.beds for delete
to authenticated
using (app_private.is_hostel_manager(app_private.bed_hostel_id(id)));

-- Tenants
create policy tenants_select_self_or_staff
on public.tenants for select
to authenticated
using (
  user_id = auth.uid()
  or app_private.is_hostel_staff(hostel_id)
);

create policy tenants_manager_insert
on public.tenants for insert
to authenticated
with check (app_private.is_hostel_manager(hostel_id));

create policy tenants_manager_update
on public.tenants for update
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

create policy tenants_manager_delete
on public.tenants for delete
to authenticated
using (app_private.is_hostel_manager(hostel_id));

-- Applications
create policy applications_select_self_or_staff
on public.applications for select
to authenticated
using (
  applicant_user_id = auth.uid()
  or app_private.is_hostel_staff(hostel_id)
);

create policy applications_insert_self
on public.applications for insert
to authenticated
with check (
  applicant_user_id = auth.uid()
  and exists (
    select 1
    from public.hostels h
    where h.id = hostel_id
      and h.status = 'active'
  )
);

create policy applications_update_draft_self
on public.applications for update
to authenticated
using (applicant_user_id = auth.uid() and status = 'draft')
with check (applicant_user_id = auth.uid() and status = 'draft');

create policy applications_staff_manage
on public.applications for all
to authenticated
using (app_private.is_hostel_staff(hostel_id))
with check (app_private.is_hostel_staff(hostel_id));

-- Fee plans
create policy fee_plans_select_authorized
on public.fee_plans for select
to authenticated
using (status = 'active' or app_private.is_hostel_staff(hostel_id));

create policy fee_plans_manager_write
on public.fee_plans for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Charges
create policy charges_select_self_or_manager
on public.charges for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_manager(hostel_id)
);

create policy charges_manager_write
on public.charges for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Payments: tenants can read their own payments; managers can manage records.
create policy payments_select_self_or_manager
on public.payments for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_manager(hostel_id)
);

create policy payments_manager_write
on public.payments for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Allocations
create policy allocations_select_self_or_staff
on public.allocations for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_staff(hostel_id)
);

create policy allocations_manager_write
on public.allocations for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Stays
create policy stays_select_self_or_staff
on public.stays for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_staff(hostel_id)
);

create policy stays_manager_write
on public.stays for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Maintenance
create policy maintenance_select_self_or_staff
on public.maintenance_requests for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_staff(hostel_id)
);

create policy maintenance_tenant_insert
on public.maintenance_requests for insert
to authenticated
with check (
  app_private.owns_tenant(tenant_id)
  and exists (
    select 1
    from public.tenants t
    where t.id = tenant_id
      and t.hostel_id = hostel_id
  )
);

create policy maintenance_tenant_update
on public.maintenance_requests for update
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  and status in ('submitted', 'received')
)
with check (
  app_private.owns_tenant(tenant_id)
  and status in ('submitted', 'received')
);

create policy maintenance_staff_manage
on public.maintenance_requests for all
to authenticated
using (app_private.is_hostel_staff(hostel_id))
with check (app_private.is_hostel_staff(hostel_id));

-- Complaints
create policy complaints_select_self_or_staff
on public.complaints for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_staff(hostel_id)
);

create policy complaints_tenant_insert
on public.complaints for insert
to authenticated
with check (
  app_private.owns_tenant(tenant_id)
  and exists (
    select 1 from public.tenants t
    where t.id = tenant_id
      and t.hostel_id = hostel_id
  )
);

create policy complaints_tenant_update
on public.complaints for update
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  and status in ('submitted', 'under_review')
)
with check (
  app_private.owns_tenant(tenant_id)
  and status in ('submitted', 'under_review')
);

create policy complaints_staff_manage
on public.complaints for all
to authenticated
using (app_private.is_hostel_staff(hostel_id))
with check (app_private.is_hostel_staff(hostel_id));

-- Incidents
create policy incidents_select_self_or_staff
on public.incidents for select
to authenticated
using (
  app_private.owns_tenant(tenant_id)
  or app_private.is_hostel_staff(hostel_id)
);

create policy incidents_tenant_insert
on public.incidents for insert
to authenticated
with check (
  reported_by = auth.uid()
  and app_private.has_active_tenant_membership(hostel_id)
);

create policy incidents_staff_manage
on public.incidents for all
to authenticated
using (app_private.is_hostel_staff(hostel_id))
with check (app_private.is_hostel_staff(hostel_id));

-- Staff
create policy staff_select_self_or_manager
on public.staff for select
to authenticated
using (
  user_id = auth.uid()
  or app_private.is_hostel_manager(hostel_id)
);

create policy staff_manager_insert
on public.staff for insert
to authenticated
with check (app_private.is_hostel_manager(hostel_id));

create policy staff_manager_update
on public.staff for update
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

create policy staff_manager_delete
on public.staff for delete
to authenticated
using (app_private.is_hostel_manager(hostel_id));

-- Staff tasks
create policy staff_tasks_select
on public.staff_tasks for select
to authenticated
using (
  app_private.is_hostel_staff(hostel_id)
);

create policy staff_tasks_manager_insert
on public.staff_tasks for insert
to authenticated
with check (app_private.is_hostel_manager(hostel_id));

create policy staff_tasks_manager_update
on public.staff_tasks for update
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

create policy staff_tasks_staff_update_own
on public.staff_tasks for update
to authenticated
using (
  app_private.is_staff_member_of_hostel(assigned_staff_id, hostel_id)
)
with check (
  app_private.is_staff_member_of_hostel(assigned_staff_id, hostel_id)
);

create policy staff_tasks_manager_delete
on public.staff_tasks for delete
to authenticated
using (app_private.is_hostel_manager(hostel_id));

-- Announcements
create policy announcements_select_staff_or_tenant
on public.announcements for select
to authenticated
using (
  app_private.is_hostel_staff(hostel_id)
  or (
    audience_type = 'all_tenants'
    and app_private.has_active_tenant_membership(hostel_id)
  )
);

create policy announcements_manager_write
on public.announcements for all
to authenticated
using (app_private.is_hostel_manager(hostel_id))
with check (app_private.is_hostel_manager(hostel_id));

-- Notifications
create policy notifications_select_self
on public.notifications for select
to authenticated
using (user_id = auth.uid());

create policy notifications_update_self
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Audit logs
create policy audit_logs_select_manager
on public.audit_logs for select
to authenticated
using (
  app_private.is_hostel_manager(hostel_id)
  or app_private.is_system_admin()
);

-- No normal user INSERT/UPDATE/DELETE policies on audit_logs.
-- Trusted server-side processes should write audit events.

-- Files
create policy files_select_owner_or_staff
on public.files for select
to authenticated
using (
  uploaded_by = auth.uid()
  or app_private.is_hostel_staff(hostel_id)
);

create policy files_insert_authenticated
on public.files for insert
to authenticated
with check (uploaded_by = auth.uid());

create policy files_update_owner_or_manager
on public.files for update
to authenticated
using (
  uploaded_by = auth.uid()
  or app_private.is_hostel_manager(hostel_id)
)
with check (
  uploaded_by = auth.uid()
  or app_private.is_hostel_manager(hostel_id)
);

create policy files_delete_owner_or_manager
on public.files for delete
to authenticated
using (
  uploaded_by = auth.uid()
  or app_private.is_hostel_manager(hostel_id)
);
