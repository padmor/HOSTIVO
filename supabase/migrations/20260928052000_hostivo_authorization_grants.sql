-- Hostivo authorization grant synchronization
-- Keep internal transaction cores private and expose only the RLS helper
-- required by the staff task update policy.

revoke execute on function app_private.create_application_with_charge_core(uuid, uuid)
  from public, anon, authenticated;

grant execute on function app_private.is_staff_member_of_hostel(uuid, uuid)
  to authenticated;
