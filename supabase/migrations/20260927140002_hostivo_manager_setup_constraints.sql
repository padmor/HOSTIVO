
create unique index if not exists buildings_hostel_name_unique
  on public.buildings (hostel_id, lower(name));

create unique index if not exists floors_building_name_unique
  on public.floors (building_id, lower(name));

create unique index if not exists rooms_floor_room_number_unique
  on public.rooms (floor_id, room_number);

create unique index if not exists beds_room_bed_number_unique
  on public.beds (room_id, bed_number);

create index if not exists hostel_memberships_user_status_role_idx
  on public.hostel_memberships (user_id, status, membership_role, hostel_id);
