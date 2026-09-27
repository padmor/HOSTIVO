create index if not exists hostel_memberships_user_status_role_idx
  on public.hostel_memberships (user_id, status, membership_role, hostel_id);
