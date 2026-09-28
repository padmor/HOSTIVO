revoke execute on function
  app_private.bed_hostel_id(uuid),
  app_private.building_hostel_id(uuid),
  app_private.floor_hostel_id(uuid),
  app_private.has_active_tenant_membership(uuid),
  app_private.is_hostel_manager(uuid),
  app_private.is_hostel_staff(uuid),
  app_private.is_staff_member_of_hostel(uuid, uuid),
  app_private.is_system_admin(),
  app_private.manager_can_access_user(uuid),
  app_private.owns_tenant(uuid),
  app_private.room_hostel_id(uuid)
from public;

alter default privileges for role postgres in schema app_private
  revoke execute on functions from public;
