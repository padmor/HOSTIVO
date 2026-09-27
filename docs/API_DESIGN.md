
# Hostivo — API and Service Design

## 1. Purpose

This document defines how Hostivo's frontend, server-side logic, database, and external services communicate.

The API design must keep sensitive business logic on the server.

## 2. Design Principles

- Validate requests on the server.
- Authenticate protected requests.
- Authorize every protected resource.
- Keep business rules out of untrusted client code.
- Return predictable responses.
- Do not expose secrets.
- Make payment processing idempotent.
- Use transactions for coupled data changes.
- Log important failures and sensitive operations.

## 3. Service Areas

Initial service boundaries:

~~~text
Authentication
Hostel Management
Tenant Management
Applications
Availability
Payments
Allocations
Stays
Maintenance
Complaints
Incidents
Staff
Announcements
Notifications
Reports
Audit
~~~

## 4. Endpoint Organization

The exact route naming will be finalized during implementation, but the application should be organized around domains.

Example:

~~~text
/api/applications
/api/availability
/api/payments
/api/payment-webhooks
/api/allocations
/api/stays
/api/maintenance
/api/complaints
/api/incidents
/api/notifications
/api/reports
~~~

Manager CRUD routes should be protected by role and hostel-scope authorization.

## 5. Application Service

Responsibilities:
- Create application
- Validate application data
- Determine application state
- Check availability
- Initiate payment when eligible

The client must not directly decide that a slot is available.

## 6. Availability Service

Responsibilities:
- Find valid available beds
- Return availability information appropriate to the user
- Prevent stale assumptions from becoming authoritative allocations

Availability shown to the frontend is informational until the protected allocation transaction completes.

## 7. Payment Service

Responsibilities:
- Create payment transaction
- Connect to payment provider
- Receive provider confirmation
- Verify transaction server-side
- Record payment
- Enforce idempotency
- Trigger approved post-payment automation

The payment service must never trust a client-provided amount as the final authority.

## 8. Payment Webhook

The webhook is a high-security server endpoint.

Expected flow:

~~~text
Provider event
   ↓
Authenticate/validate event
   ↓
Identify internal transaction
   ↓
Verify transaction with provider where required
   ↓
Check amount/currency/status
   ↓
Check idempotency
   ↓
Record verified payment
   ↓
Trigger allocation workflow
~~~

Webhook processing must be safe when the same event is received more than once.

## 9. Allocation Service

Responsibilities:
- Find an eligible available bed
- Safely claim the bed
- Create allocation
- Update related occupancy state
- Activate accommodation
- Create audit event
- Trigger notifications

Allocation must run inside a transaction or equivalent consistency mechanism.

## 10. Check-In / Check-Out Service

### Check-In

Validate the tenant's allocation and current stay state before creating an active stay.

### Check-Out

Validate the active stay and close it while returning accommodation to the correct available state.

## 11. Maintenance Service

Responsibilities:
- Create request
- View permitted requests
- Assign staff
- Update status
- Record resolution
- Notify relevant users
- Preserve history

## 12. Communication Service

Responsibilities:
- Publish announcements
- Target appropriate audiences
- Create notifications
- Track notification state
- Support email delivery where configured

## 13. Reporting Service

Reports should read from authoritative records.

Examples:
- Occupancy
- Bed availability
- Tenant count
- Payment totals
- Outstanding balances
- Applications
- Maintenance
- Incidents
- Staff tasks

Reports should not alter source records.

## 14. Error Handling

API errors should be:
- Safe
- Predictable
- Useful to the client
- Non-revealing of sensitive internals

The server should distinguish between:
- Validation errors
- Authentication errors
- Authorization errors
- Not-found cases
- Business-rule conflicts
- Payment failures
- Infrastructure failures

## 15. API Authorization

Each protected operation should answer:

1. Is the user authenticated?
2. What is the user's role?
3. Which hostel does the user belong to?
4. Does the user have access to this resource?
5. Is this action permitted?

## 16. Data Validation

All mutation requests should validate:
- Required fields
- Data types
- Amounts
- IDs
- Allowed status transitions
- Resource ownership/scope
- Business rules

Validation schemas should be reusable.

## 17. CRUD Service Model

Manager CRUD operations should follow:

~~~text
Request
 ↓
Authentication
 ↓
Authorization
 ↓
Validation
 ↓
Business Rules
 ↓
Database Transaction
 ↓
Audit
 ↓
Response
~~~

CRUD must not bypass business rules.

Example: a manager updating a bed status should not create a state that conflicts with an active allocation.

## 18. API and Database Boundary

Frontend components should not contain authoritative business logic.

Preferred pattern:

~~~text
UI
 ↓
Server/API
 ↓
Business Logic
 ↓
Database
~~~

This makes the rules reusable across web pages, automated events, and future clients.

## 19. Future Integration Rule

External services should be wrapped behind internal service interfaces.

Example:

~~~text
Hostivo Payment Service
        ↓
Payment Provider Adapter
        ↓
Paystack initially
~~~

This allows a future payment provider to be added without rewriting the entire application.
