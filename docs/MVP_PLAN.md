# Hostivo MVP Plan

## 1. Purpose

Build a complete hostel-management MVP that centralizes hostel information, automates repetitive operations, reduces manual effort, and improves the tenant experience.

## 2. Users

### Manager
Central hostel operator with authorized CRUD and operational oversight.

### Staff
Operational users with access limited to assigned responsibilities.

### Tenant / Resident
Hostel user who applies, pays, receives accommodation, uses hostel services, and manages permitted personal information.

### System Administrator
Platform-level administrator separate from ordinary hostel management.

## 3. Core Functions

1. Tenant and resident management
2. Room and bed management
3. Accommodation applications and allocation
4. Payment management
5. Check-in and check-out
6. Maintenance management
7. Communication and announcements
8. Complaints, incidents, and hostel records
9. Staff management
10. Reports and management information

## 4. Core Automation

- Availability checking
- Payment processing/confirmation
- Server-side payment verification
- Payment recording
- Receipt generation
- Automatic room/bed allocation
- Occupancy updates
- Tenant status updates
- Balance calculations
- Notifications
- Audit/history records

## 5. Core Application Flow

When a slot is available:

**Tenant starts application**
→ **System checks availability**
→ **Payment**
→ **Payment verification**
→ **Automatic room/bed assignment**
→ **Occupancy update**
→ **Tenant activation**
→ **Manager dashboard update**
→ **Check-in**

When no slot is available, the system must not promise an unavailable bed.

## 6. Manager Experience

The manager dashboard is the central control point for:

- Hostel overview
- Tenants
- Buildings
- Floors
- Rooms
- Beds
- Applications
- Allocations
- Payments
- Maintenance
- Complaints/incidents
- Staff
- Announcements
- Reports

Authorized CRUD operations are available from the dashboard.

## 7. Tenant Experience

The tenant portal covers:

- Profile
- Application
- Availability
- Payment
- Accommodation
- Check-in/check-out
- Maintenance
- Complaints/reports
- Announcements
- Personal records

## 8. MVP Outcome

A real hostel should be able to configure Hostivo, onboard existing tenants, accept applications, collect and verify payments, automatically assign available accommodation, manage active stays, handle hostel services, and view operational information from one system.

## 9. Scope Rule

The MVP plan is the source of truth. Features outside these agreed capabilities are treated as post-MVP unless deliberately added to the plan.
