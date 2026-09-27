
# Hostivo — Database Schema Specification

## 1. Purpose

This document converts the approved Hostivo database design into an implementation-ready schema specification.

It defines:

- Tables
- Columns
- Data types
- Primary keys
- Foreign keys
- Status values
- Constraints
- Relationships
- Indexing direction
- Audit fields
- Security boundaries
- Core integrity rules

This document is a specification only. It does not create or modify the production database.

---

# 2. Database Principles

Hostivo's database must be:

- Relational
- Consistent
- Secure
- Transaction-safe
- Auditable
- Recoverable
- Suitable for reporting
- Able to support automatic room/bed allocation

The PostgreSQL database is the authoritative source of truth for hostel operations.

---

# 3. Common Conventions

## Primary Keys

Use UUID primary keys for application entities unless there is a specific reason to use another identifier.

Conceptually:

~~~text
id UUID PRIMARY KEY
~~~

## Timestamps

Application tables should normally include:

~~~text
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
~~~

## Soft Deletion / Archiving

Important business records should prefer archival or soft deletion where historical preservation is required.

Where used:

~~~text
deleted_at TIMESTAMPTZ NULL
~~~

## Naming

- Lowercase snake_case
- Plural table names
- Foreign keys use entity_id naming
- Status columns use explicit controlled values

---

# 4. Identity and Access Tables

## 4.1 profiles

Purpose: application-level profile connected to the authentication identity.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK; matches authenticated user identity |
| full_name | TEXT | No | Required |
| phone | TEXT | Yes | |
| email | TEXT | Yes | |
| avatar_path | TEXT | Yes | Storage path |
| created_at | TIMESTAMPTZ | No | Default current time |
| updated_at | TIMESTAMPTZ | No | Updated on change |

Authentication credentials remain managed by the authentication system; they are not duplicated in application tables.

## 4.2 user_roles

Purpose: application authorization role.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| user_id | UUID | No | PK/FK to authenticated identity |
| role | TEXT | No | Controlled role |
| created_at | TIMESTAMPTZ | No | Default current time |

Allowed initial roles:

~~~text
system_admin
manager
staff
tenant
~~~

A user's role must be stored in an authorization-controlled location and must not depend on user-editable profile metadata.

## 4.3 hostel_memberships

Purpose: associates a user with a hostel and defines operational scope.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| user_id | UUID | No | FK |
| membership_role | TEXT | No | Controlled role |
| status | TEXT | No | Controlled status |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested membership statuses:

~~~text
active
inactive
suspended
~~~

---

# 5. Hostel Structure

## 5.1 hostels

Purpose: top-level hostel organization.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| name | TEXT | No | Required |
| location | TEXT | No | Required |
| contact_phone | TEXT | Yes | |
| contact_email | TEXT | Yes | |
| status | TEXT | No | Controlled |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested statuses:

~~~text
active
inactive
~~~

## 5.2 buildings

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK to hostels.id |
| name | TEXT | No | Required |
| code | TEXT | Yes | Unique within hostel |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Rule: a building belongs to exactly one hostel.

## 5.3 floors

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| building_id | UUID | No | FK to buildings.id |
| name | TEXT | No | Required |
| floor_number | INTEGER | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Rule: a floor belongs to exactly one building.

## 5.4 rooms

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| floor_id | UUID | No | FK to floors.id |
| room_number | TEXT | No | Required |
| capacity | INTEGER | No | Must be greater than 0 |
| status | TEXT | No | Controlled |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested room statuses:

~~~text
available
occupied
maintenance
inactive
~~~

Room occupancy should be derived from bed/allocation state rather than becoming an independent conflicting source of truth.

## 5.5 beds

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| room_id | UUID | No | FK to rooms.id |
| bed_number | TEXT | No | Required; unique within room |
| status | TEXT | No | Controlled |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested bed statuses:

~~~text
available
occupied
reserved
maintenance
inactive
~~~

A bed is the smallest allocation unit in the MVP.

---

# 6. Tenant Tables

## 6.1 tenants

Purpose: hostel-specific tenant record.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| user_id | UUID | No | FK to identity |
| hostel_id | UUID | No | FK to hostels.id |
| tenant_number | TEXT | Yes | Unique within hostel |
| emergency_contact_name | TEXT | Yes | |
| emergency_contact_phone | TEXT | Yes | |
| status | TEXT | No | Controlled |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested tenant statuses:

~~~text
applicant
active
checked_out
inactive
suspended
~~~

---

# 7. Applications

## 7.1 applications

Purpose: accommodation application.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| applicant_user_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK; populated when appropriate |
| application_number | TEXT | No | Unique within hostel |
| status | TEXT | No | Controlled |
| submitted_at | TIMESTAMPTZ | Yes | |
| expires_at | TIMESTAMPTZ | Yes | Optional payment/application expiry |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested lifecycle:

~~~text
draft
submitted
payment_pending
paid
allocated
completed
cancelled
expired
~~~

The system should enforce valid status transitions.

---

# 8. Payments

## 8.1 payments

Purpose: financial transaction record.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK |
| application_id | UUID | Yes | FK |
| provider | TEXT | No | Initial provider may be Paystack |
| provider_reference | TEXT | No | Unique per provider where applicable |
| internal_reference | TEXT | No | Unique |
| amount | NUMERIC(12,2) | No | Must be greater than 0 |
| currency | CHAR(3) | No | Validated |
| status | TEXT | No | Controlled |
| verified_at | TIMESTAMPTZ | Yes | |
| paid_at | TIMESTAMPTZ | Yes | |
| metadata | JSONB | Yes | Restricted use |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested payment statuses:

~~~text
initiated
pending
successful
failed
cancelled
refunded
reversed
~~~

## Payment Rules

1. Client-side payment status is never authoritative.
2. Successful status requires server-side verification.
3. Provider references must be processed idempotently.
4. Duplicate provider events must not create duplicate payments.
5. A payment must not trigger allocation until it reaches the verified-success state.

---


---

# 8A. Accommodation Fees and Charges

## 8A.1 fee_plans

Purpose: defines the accommodation pricing configured by hostel management.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| name | TEXT | No | Required |
| description | TEXT | Yes | |
| amount | NUMERIC(12,2) | No | Must be greater than 0 |
| currency | CHAR(3) | No | Validated |
| status | TEXT | No | Controlled |
| starts_at | TIMESTAMPTZ | Yes | |
| ends_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested fee-plan statuses:

~~~text
active
inactive
expired
~~~

## 8A.2 charges

Purpose: records the amount actually charged to an applicant/tenant. This provides the source needed for accurate balance calculation.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK |
| application_id | UUID | Yes | FK |
| fee_plan_id | UUID | Yes | FK |
| description | TEXT | No | Required |
| amount | NUMERIC(12,2) | No | Must be greater than 0 |
| currency | CHAR(3) | No | Validated |
| status | TEXT | No | Controlled |
| due_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested charge statuses:

~~~text
pending
partially_paid
paid
void
refunded
~~~

## Balance Rule

The tenant's balance is derived from authoritative financial records:

~~~text
Outstanding Balance = Valid Charges - Verified Payments
~~~

A frontend client must never be able to directly set the authoritative balance.

# 9. Allocations

## 9.1 allocations

Purpose: authoritative tenant-to-bed assignment.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | No | FK |
| application_id | UUID | Yes | FK |
| bed_id | UUID | No | FK |
| status | TEXT | No | Controlled |
| starts_at | TIMESTAMPTZ | No | |
| ends_at | TIMESTAMPTZ | Yes | |
| allocated_at | TIMESTAMPTZ | No | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested allocation statuses:

~~~text
reserved
active
ended
cancelled
~~~

## Critical Allocation Rule

There must never be two overlapping active allocations for the same bed.

The database must enforce this as strongly as PostgreSQL permits, using appropriate constraints and transaction-safe allocation logic.

---

# 10. Stays

## 10.1 stays

Purpose: actual period of residence.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | No | FK |
| allocation_id | UUID | No | FK |
| status | TEXT | No | Controlled |
| scheduled_check_in_at | TIMESTAMPTZ | Yes | |
| checked_in_at | TIMESTAMPTZ | Yes | |
| checked_out_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested statuses:

~~~text
scheduled
checked_in
active
checked_out
cancelled
~~~

A tenant should not have conflicting active stays.

---

# 11. Maintenance

## 11.1 maintenance_requests

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK |
| room_id | UUID | Yes | FK |
| bed_id | UUID | Yes | FK |
| title | TEXT | No | Required |
| description | TEXT | No | Required |
| priority | TEXT | No | Controlled |
| status | TEXT | No | Controlled |
| assigned_staff_id | UUID | Yes | FK |
| resolved_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested priority values:

~~~text
low
normal
high
urgent
~~~

Suggested statuses:

~~~text
submitted
received
assigned
in_progress
resolved
closed
cancelled
~~~

---

# 12. Complaints

## 12.1 complaints

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK |
| subject | TEXT | No | Required |
| description | TEXT | No | Required |
| status | TEXT | No | Controlled |
| handled_by | UUID | Yes | FK |
| resolved_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested statuses:

~~~text
submitted
under_review
in_progress
resolved
closed
withdrawn
~~~

---

# 13. Incidents

## 13.1 incidents

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| tenant_id | UUID | Yes | FK |
| room_id | UUID | Yes | FK |
| incident_type | TEXT | No | Controlled |
| description | TEXT | No | Required |
| status | TEXT | No | Controlled |
| reported_by | UUID | No | FK |
| handled_by | UUID | Yes | FK |
| occurred_at | TIMESTAMPTZ | Yes | |
| resolved_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested incident types:

~~~text
damage
dispute
rule_violation
security
lost_property
other
~~~

---

# 14. Staff

## 14.1 staff

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| user_id | UUID | No | FK |
| staff_number | TEXT | Yes | Unique within hostel |
| department | TEXT | Yes | |
| status | TEXT | No | Controlled |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested statuses:

~~~text
active
inactive
suspended
~~~

## 14.2 staff_tasks

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| assigned_staff_id | UUID | No | FK |
| maintenance_request_id | UUID | Yes | FK |
| title | TEXT | No | Required |
| description | TEXT | Yes | |
| status | TEXT | No | Controlled |
| due_at | TIMESTAMPTZ | Yes | |
| completed_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested statuses:

~~~text
pending
assigned
in_progress
completed
cancelled
~~~

---

# 15. Communication

## 15.1 announcements

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| created_by | UUID | No | FK |
| title | TEXT | No | Required |
| body | TEXT | No | Required |
| audience_type | TEXT | No | Controlled |
| status | TEXT | No | Controlled |
| published_at | TIMESTAMPTZ | Yes | |
| expires_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |
| updated_at | TIMESTAMPTZ | No | |

Suggested audience types:

~~~text
all_tenants
building
room
staff
custom
~~~

## 15.2 notifications

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| user_id | UUID | No | FK |
| hostel_id | UUID | No | FK |
| type | TEXT | No | Controlled |
| title | TEXT | No | |
| body | TEXT | No | |
| related_entity | TEXT | Yes | |
| related_id | UUID | Yes | |
| read_at | TIMESTAMPTZ | Yes | |
| created_at | TIMESTAMPTZ | No | |

Notifications are delivery records. The originating business table remains authoritative.

---

# 16. Audit

## 16.1 audit_logs

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | Yes | FK |
| actor_user_id | UUID | Yes | FK |
| action | TEXT | No | Required |
| entity_type | TEXT | No | Required |
| entity_id | UUID | Yes | Target |
| result | TEXT | No | success/failure |
| metadata | JSONB | Yes | Restricted and sanitized |
| created_at | TIMESTAMPTZ | No | |

Audit logs should be append-oriented and not editable by ordinary users.

---

# 17. File Metadata

## 17.1 files

Purpose: metadata for files stored in object storage.

| Column | Type | Null | Key / Rule |
|---|---|---:|---|
| id | UUID | No | PK |
| hostel_id | UUID | No | FK |
| uploaded_by | UUID | No | FK |
| storage_path | TEXT | No | Controlled path |
| file_name | TEXT | No | |
| mime_type | TEXT | No | Validated |
| size_bytes | BIGINT | No | Greater than 0 |
| related_entity | TEXT | Yes | |
| related_id | UUID | Yes | |
| created_at | TIMESTAMPTZ | No | |

Actual file access is controlled by storage policies; the database row does not itself make a private file public.

---

# 18. Foreign-Key Map

~~~text
hostels
 ├── buildings
 │    └── floors
 │         └── rooms
 │              └── beds
 │
 ├── hostel_memberships
 ├── tenants
 │    ├── applications
 │    ├── payments
 │    ├── allocations
 │    ├── stays
 │    ├── maintenance_requests
 │    ├── complaints
 │    └── incidents
 │
 ├── staff
 │    └── staff_tasks
 │
 ├── announcements
 ├── notifications
 ├── audit_logs
 └── files
~~~

---

# 19. Core Constraints

## Accommodation

- Room belongs to one floor.
- Floor belongs to one building.
- Building belongs to one hostel.
- Bed belongs to one room.
- Bed number is unique within a room.
- Capacity must be positive.

## Tenant

- Tenant belongs to a hostel.
- Tenant identity maps to an authenticated identity.
- Tenant records must not cross hostel boundaries.

## Payments

- Amount must be positive.
- Provider reference must be unique where provider rules permit.
- Internal transaction reference must be unique.
- Verified payment must be associated with the correct internal application/tenant.

## Allocation

- A bed cannot have conflicting active allocations.
- A tenant cannot have conflicting active allocations.
- Allocation must reference a valid bed.
- Allocation must belong to the same hostel as the tenant and bed.

## Stay

- Stay must reference a valid allocation.
- Active stays must not conflict for the same tenant.
- Check-out cannot precede check-in.

---

# 20. Transaction Boundaries

The following operations require strong transaction handling.

## Payment-to-Allocation Transaction

Conceptually:

~~~text
Verified Payment
      ↓
Find Eligible Available Bed
      ↓
Claim Bed Safely
      ↓
Create Allocation
      ↓
Update Occupancy State
      ↓
Activate Tenant Accommodation
      ↓
Commit
~~~

If a critical step fails, the system must not leave a false completed state.

## Check-Out Transaction

~~~text
Validate Active Stay
      ↓
Close Stay
      ↓
End Allocation
      ↓
Release Bed
      ↓
Update Occupancy
      ↓
Commit
~~~

---

# 21. Indexing Requirements

Initial indexes should support common access patterns.

Expected index areas:

~~~text
hostel_id
user_id
tenant_number
application_number
application.status
payment.provider_reference
payment.internal_reference
payment.status
bed.room_id
bed.status
allocation.bed_id
allocation.tenant_id
allocation.status
stay.tenant_id
maintenance.status
maintenance.assigned_staff_id
notifications.user_id
audit_logs.created_at
~~~

Actual indexes will be reviewed with query plans during performance testing.

---

# 22. Row-Level Security Requirements

Every exposed application-data table must have an explicit access policy.

## Tenant

A tenant may read/update only records they are authorized to manage.

Examples:

- Own profile
- Own application
- Own payments
- Own allocation
- Own stay
- Own maintenance requests
- Own complaints
- Own permitted records
- Notifications addressed to them

## Staff

Staff access depends on:

- Their hostel
- Their role
- Assigned responsibilities
- Allowed operation

## Manager

Manager access is scoped to their authorized hostel(s) and role.

## System Administrator

Platform-level operations are separated from ordinary hostel management.

RLS must provide database-level enforcement and must not rely only on frontend route protection.

---

# 23. Data Ownership Rules

Authorization decisions should be based on trusted relational data.

Do not use user-editable profile fields as the authority for:

- Role
- Hostel ownership
- Tenant ownership
- Staff permissions
- Manager permissions

The database relationships establish scope.

---

# 24. Deletion and Retention

### Strong historical records

Prefer archive/soft-delete or restricted deletion for:

- Payments
- Allocations
- Stays
- Audit logs
- Important incidents

### Operational records

Deletion may be permitted only when it does not violate business or historical requirements.

### Authentication identities

Identity deletion is security-sensitive and must be coordinated with application records and active sessions.

---

# 25. Reporting Source of Truth

Reports should be derived from authoritative tables.

Examples:

### Occupancy

Derived from current bed/allocation/stay state.

### Revenue

Derived from verified payment records.

### Outstanding Balance

Derived from charges and verified payments.

### Applications

Derived from application states.

### Maintenance

Derived from maintenance request status.

### Incidents

Derived from incident records.

Reporting queries must not modify source data.

---

# 26. Schema Implementation Order

When implementation begins, migrations should follow dependency order:

~~~text
1. Identity / profiles
2. Roles / memberships
3. Hostels
4. Buildings
5. Floors
6. Rooms
7. Beds
8. Tenants
9. Applications
10. Payments
11. Charges / Allocation
12. Stays
13. Maintenance
14. Complaints
15. Incidents
16. Staff
17. Staff Tasks
18. Announcements
19. Notifications
20. Audit Logs
21. File Metadata
~~~

Each migration should be version-controlled and reviewed.

---

# 27. Schema Acceptance Criteria

Before database implementation is considered ready:

- All MVP entities have defined ownership.
- All required foreign-key relationships are defined.
- Important statuses are controlled.
- Important financial fields are protected.
- Double allocation is prevented by database/application transaction design.
- Tenant data isolation is defined.
- Manager/staff scope is defined.
- Audit coverage is defined.
- Historical records have retention/deletion rules.
- Indexing requirements are documented.
- Backup/recovery requirements are compatible with the schema.
- RLS policies can be written from the defined relationships.

---

# 28. Implementation Boundary

This specification defines what the database must represent.

It does not yet create:

- SQL migrations
- Production tables
- RLS policies
- Triggers
- Functions
- Seed data
- Application code

Those belong to the implementation stage after this specification is reviewed and accepted.
