
# Hostivo Manager Setup

The manager setup milestone prepares a hostel for tenant operations.

## Manager access

A signed-in account reaches the manager dashboard only when its authoritative `user_roles.role` is `manager` (or `system_admin`). Hostel-level manager access is additionally constrained by an active `hostel_memberships` row with `membership_role = 'manager'`.

Open signup cannot self-select the manager role.

## Setup sequence

1. Confirm the manager is assigned to a hostel.
2. Save the hostel name, location, and contact details.
3. Create buildings.
4. Create floors under each building.
5. Create rooms under each floor and set capacity.
6. Create beds under each room.
7. Create fee plans used later to create authoritative tenant charges.

All writes pass through authenticated Server Actions and are also enforced by Supabase Row Level Security.

## Data integrity

The database enforces uniqueness for:

- building names within a hostel
- floor names within a building
- room numbers within a floor
- bed numbers within a room

These constraints prevent duplicate accommodation identifiers during concurrent management activity.

## Deliberate scope boundary

This milestone does not yet implement manager/staff provisioning, tenant applications, payment verification, automatic allocation, tenant activation, or check-in/check-out. Those flows remain subsequent milestones.
