-- Hostivo database hardening after initial security review.

-- Supabase's example/optional RLS event-trigger helper is not an application RPC.
-- Keep it inaccessible through the Data API while preserving event-trigger execution.
revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

-- btree_gist is required for the exclusion constraints protecting allocation overlap.
-- Move the extension out of the exposed public schema.
alter extension btree_gist set schema app_private;

-- Cover foreign keys used by joins, deletes, and scoped lookups.
create index if not exists allocations_application_idx
  on public.allocations (application_id);

create index if not exists announcements_created_by_idx
  on public.announcements (created_by);

create index if not exists applications_tenant_idx
  on public.applications (tenant_id);

create index if not exists audit_logs_actor_idx
  on public.audit_logs (actor_user_id);

create index if not exists charges_application_idx
  on public.charges (application_id);

create index if not exists charges_fee_plan_idx
  on public.charges (fee_plan_id);

create index if not exists complaints_handled_by_idx
  on public.complaints (handled_by);

create index if not exists complaints_tenant_idx
  on public.complaints (tenant_id);

create index if not exists files_hostel_idx
  on public.files (hostel_id);

create index if not exists files_uploaded_by_idx
  on public.files (uploaded_by);

create index if not exists incidents_handled_by_idx
  on public.incidents (handled_by);

create index if not exists incidents_reported_by_idx
  on public.incidents (reported_by);

create index if not exists incidents_room_idx
  on public.incidents (room_id);

create index if not exists incidents_tenant_idx
  on public.incidents (tenant_id);

create index if not exists maintenance_bed_idx
  on public.maintenance_requests (bed_id);

create index if not exists maintenance_room_idx
  on public.maintenance_requests (room_id);

create index if not exists maintenance_tenant_idx
  on public.maintenance_requests (tenant_id);

create index if not exists notifications_hostel_idx
  on public.notifications (hostel_id);

create index if not exists staff_user_idx
  on public.staff (user_id);

create index if not exists staff_tasks_hostel_idx
  on public.staff_tasks (hostel_id);

create index if not exists staff_tasks_maintenance_idx
  on public.staff_tasks (maintenance_request_id);
