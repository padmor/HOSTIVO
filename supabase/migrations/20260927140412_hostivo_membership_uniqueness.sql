
create unique index if not exists hostel_memberships_hostel_user_unique
  on public.hostel_memberships (hostel_id, user_id);
