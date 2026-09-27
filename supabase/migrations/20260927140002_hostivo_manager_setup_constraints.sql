
create unique index if not exists buildings_hostel_name_unique
  on public.buildings (hostel_id, lower(name));

create unique index if not exists floors_building_name_unique
  on public.floors (building_id, lower(name));

create index if not exists hostel_memberships_user_status_role_idx
  on public.hostel_memberships (user_id, status, membership_role, hostel_id);
