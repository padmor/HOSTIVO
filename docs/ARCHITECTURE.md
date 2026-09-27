
# Hostivo — System Architecture

## 1. Purpose

This document defines the structural design of Hostivo before application implementation begins.

Hostivo is a centralized hostel-management platform with two primary experiences:

- Manager Dashboard — hostel administration and operational control
- Tenant Portal — accommodation and hostel-service access

The architecture is designed around security, reliability, automation, maintainability, and the approved MVP workflows.

## 2. High-Level Architecture

~~~text
 Tenant Device ────────┐
                       │
 Manager Device ───────┼──> Web Application ──> Server Logic/API
                       │                              │
 Staff Device ─────────┘                              │
                                                      ▼
                                                Authentication
                                                      │
                                                      ▼
                                                Business Rules
                                                      │
                           ┌──────────────────────────┼─────────────────────────┐
                           │                          │                         │
                           ▼                          ▼                         ▼
                     PostgreSQL                 File Storage              Notifications
                           │
                           ▼
                     Audit / Events
                           │
                           ▼
                    Backup / Recovery

 External Payment Provider
          │
          └────────> Secure Payment Webhook ───────> Server Logic
~~~

## 3. Application Layers

### Presentation Layer

Responsible for what users see and interact with.

- Tenant Portal
- Manager Dashboard
- Staff interfaces
- Authentication screens
- Forms
- Tables
- Dashboards
- Notifications
- Reports

### Application Layer

Responsible for executing approved business operations.

Examples:

- Application processing
- Availability checking
- Payment handling
- Allocation
- Check-in/check-out
- Maintenance workflows
- Notifications
- Reporting

### Data Layer

Responsible for persistent hostel information.

Primary storage:

- PostgreSQL

Supporting storage:

- File/object storage for approved documents and attachments

### Integration Layer

Connects Hostivo to external services.

Initial integration:

- Payment provider

Future integrations may be added without changing the core data model.

## 4. Main Domains

~~~text
Identity & Access
Hostel Configuration
Accommodation
Tenants
Applications
Payments
Allocation
Stays
Maintenance
Complaints & Incidents
Communication
Staff
Reports
Audit
Notifications
~~~

Each domain should have clear responsibilities and should avoid duplicating business rules.

## 5. Primary Users

### Manager
Owns day-to-day hostel management and can perform authorized CRUD and operational activities.

### Staff
Performs assigned hostel operations according to granted permissions.

### Tenant
Uses hostel services and can access only permitted personal/hostel information.

### System Administrator
Performs platform-level administration separate from normal hostel operations.

## 6. Core Data Flow

~~~text
Tenant
  ↓
Application
  ↓
Availability
  ↓
Payment
  ↓
Payment Verification
  ↓
Automatic Allocation
  ↓
Occupancy Update
  ↓
Tenant Activation
  ↓
Check-In
  ↓
Stay
  ↓
Hostel Services
  ↓
Check-Out
  ↓
Historical Record
~~~

## 7. Manager Data Flow

~~~text
Manager Login
     ↓
Authorization
     ↓
Dashboard
     ↓
View / Create / Update / Archive Authorized Records
     ↓
Business Rules
     ↓
Database
     ↓
Reports / Notifications / Audit
~~~

The manager should manage the system through trusted server-side operations rather than directly manipulating the database.

## 8. Tenant Data Flow

~~~text
Tenant Login
     ↓
Authorization
     ↓
Tenant Portal
     ↓
Application / Payment / Services
     ↓
Server-side validation
     ↓
Database
     ↓
Tenant receives permitted result
~~~

## 9. Automation Boundary

### Automatic

- Availability checks
- Payment status updates after verified events
- Receipt creation
- Room/bed allocation
- Occupancy updates
- Balance calculations
- Status transitions
- Notifications
- Audit-event creation

### Manager-controlled

- Hostel configuration
- Record correction
- Exception handling
- Staff administration
- Maintenance management
- Complaint/incident management
- Operational decisions
- Reporting and review

## 10. Reliability Principles

### Single source of truth
Operational information must come from the central database.

### Transaction integrity
Connected actions that must succeed together should be treated as one logical transaction.

### Idempotency
Repeated external events, especially payment webhooks, must not create duplicate payments or duplicate allocations.

### Concurrency safety
Two simultaneous applicants must not receive the same bed.

### Auditability
Important actions must be traceable.

### Recovery
Production data must have a documented backup and recovery strategy.

## 11. Deployment Model

The intended model is a hosted web application.

~~~text
GitHub
  ↓
CI / Build / Tests
  ↓
Production Deployment
  ↓
Hostivo Web Application
  ↓
Central Database + Services
~~~

Users access Hostivo from authorized devices through a browser or installable web-app experience where supported.

## 12. Architecture Rule

The architecture must remain aligned with the approved MVP. New capabilities are not to be introduced during implementation merely because the technology makes them possible.
