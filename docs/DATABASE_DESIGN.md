
# Hostivo — Database Design

## 1. Purpose

The database is the central source of truth for Hostivo.

It must accurately represent the real hostel while supporting tenant services, management operations, automation, security, reporting, and historical records.

## 2. Core Relationship Model

~~~text
Hostel
  ↓
Building
  ↓
Floor
  ↓
Room
  ↓
Bed

User
  ↓
Tenant
  ↓
Application
  ↓
Payment
  ↓
Allocation
  ↓
Stay
~~~

## 3. Core Entities

### Users / Profiles
Identity and profile information associated with authenticated users.

### Roles
Initial roles:
- manager
- staff
- tenant
- system_admin

### Hostels
Represents the managed hostel.

### Buildings
A physical building belonging to a hostel.

Relationship:

~~~text
hostel → buildings
~~~

### Floors
A floor belonging to a building.

### Rooms
A room belonging to a floor.

Important information includes:
- Room identifier
- Capacity
- Status
- Floor
- Hostel relationship

### Beds
An allocatable accommodation slot.

Important information includes:
- Bed identifier
- Room
- Status
- Occupancy state
- Timestamps

A bed is the smallest allocation unit in the MVP.

### Tenants
Represents a hostel resident and links the resident account to hostel-specific information.

### Applications
Represents an accommodation application.

Suggested lifecycle:

~~~text
draft
↓
submitted
↓
available / eligible
↓
payment_pending
↓
paid
↓
allocated
↓
completed / cancelled
~~~

Exact statuses must be finalized before implementation.

### Payments
Represents financial transactions related to accommodation.

Important information:
- Tenant/application relationship
- Amount
- Currency
- Provider
- Provider reference
- Internal transaction reference
- Status
- Verification information
- Timestamps

### Allocations
Represents the relationship between a tenant and an assigned bed.

Important information:
- Tenant
- Bed
- Application
- Allocation status
- Start/end information
- Allocation timestamps

Allocation must prevent conflicting active assignments.

### Stays
Represents the tenant's actual period of residence.

~~~text
scheduled
↓
checked_in
↓
active
↓
checked_out
~~~

### Maintenance Requests
Represents problems reported by tenants or authorized users.

Typical information:
- Reporter
- Relevant room/bed/location
- Description
- Priority
- Status
- Assigned staff
- Resolution
- Timestamps

### Complaints
Represents tenant complaints or service issues.

### Incidents
Represents notable hostel events such as damages, disputes, rule violations, security events, or other approved incident records.

### Staff
Represents staff information and operational assignment data.

### Staff Tasks
Represents work assigned to staff.

~~~text
pending
↓
assigned
↓
in_progress
↓
completed
~~~

### Announcements
Represents hostel communication published by authorized management.

### Notifications
Represents notifications delivered to users.

Important information:
- Recipient
- Type
- Related record
- Read/unread status
- Timestamp

### Audit Logs
Represents important system actions.

An audit event should capture, where appropriate:
- Actor
- Action
- Target entity
- Target identifier
- Timestamp
- Relevant context
- Result

## 4. Key Relationships

~~~text
Hostel 1 ──── * Buildings
Building 1 ── * Floors
Floor 1 ───── * Rooms
Room 1 ────── * Beds

User 1 ────── 1 Profile
Profile 1 ─── * Applications
Tenant 1 ──── * Payments
Application 1 * Payments
Tenant 1 ──── * Allocations
Bed 1 ─────── * Historical Allocations
Tenant 1 ──── * Stays
Tenant 1 ──── * Maintenance Requests
Tenant 1 ──── * Complaints
Tenant 1 ──── * Incidents
User 1 ────── * Notifications
User 1 ────── * Audit Logs
~~~

Exact cardinality and required/optional relationships will be finalized during implementation.

## 5. Data Integrity Rules

The database should enforce important rules wherever possible.

Examples:
- A room belongs to one floor.
- A bed belongs to one room.
- A room/bed cannot reference a nonexistent parent.
- A payment must have a valid transaction reference.
- An active bed allocation cannot conflict with another active allocation.
- A tenant cannot have two conflicting active stays.
- Important financial records should not be casually hard-deleted.

## 6. Allocation Integrity

Automatic allocation is a critical transaction.

~~~text
Find available bed
      ↓
Securely claim/reserve bed
      ↓
Create allocation
      ↓
Update occupancy-related state
~~~

Two concurrent payments must not result in the same bed being allocated twice.

## 7. Historical Records

Hostivo should preserve history needed for accountability and reporting:

- Previous allocations
- Previous stays
- Payment history
- Maintenance history
- Incident history
- Audit history

Where records should not disappear permanently, archiving/soft deletion should be preferred over destructive deletion.

## 8. Indexing

Indexes should be based on actual access patterns.

Likely fields:
- Tenant identifiers
- Application status
- Payment status
- Provider transaction references
- Bed status
- Room identifiers
- Allocation status
- Maintenance status
- Notification recipient
- Audit timestamps

Indexes should be validated during performance testing.

## 9. Data Security

Every exposed data table must have an appropriate access-control policy.

Tenant-facing records should be restricted to authorized tenant data.

Manager/staff access should respect role and hostel boundaries.

Privileged database credentials must never be exposed to the browser.

## 10. Data Lifecycle

~~~text
Create
  ↓
Validate
  ↓
Store
  ↓
Use
  ↓
Update
  ↓
Archive / Retain
  ↓
Recover when required
~~~

Retention rules for each record category will be finalized before production.

## 11. Source-of-Truth Rule

The database is authoritative for:
- Occupancy
- Allocations
- Payment records
- Tenant status
- Applications
- Stays
- Operational records

The frontend must not independently invent or permanently store authoritative business state.
