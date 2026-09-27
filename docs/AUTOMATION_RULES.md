
# Hostivo — Automation Rules

## 1. Purpose

Automation is a core purpose of Hostivo.

The system should perform repetitive, deterministic operations automatically while leaving management decisions and exceptional situations under appropriate human control.

## 2. Core Automation Principle

~~~text
User Action
   ↓
System Validation
   ↓
Business Rule
   ↓
Automatic Operation
   ↓
Database Update
   ↓
Notification / Audit
~~~

## 3. Application and Availability

When a tenant starts an accommodation application, Hostivo checks current availability.

~~~text
Application
   ↓
Check available beds
   ↓
Available?
 ┌───────┴────────┐
 No               Yes
 ↓                 ↓
No slot           Proceed to payment
~~~

The system must not promise accommodation that is unavailable.

## 4. Payment-First Available-Slot Flow

When an available slot exists:

~~~text
Tenant applies
    ↓
Availability confirmed
    ↓
Proceed to payment
    ↓
Payment provider
    ↓
Payment received
    ↓
Server verifies payment
    ↓
Payment recorded
    ↓
Automatic allocation
~~~

Routine available-slot applications do not wait for manager approval.

## 5. Payment Verification

A payment becomes authoritative only after server-side verification.

The system must validate, as applicable:
- Internal application
- Provider transaction reference
- Expected amount
- Currency
- Transaction status
- Duplicate/replay state

Only a verified payment may trigger the protected allocation workflow.

## 6. Automatic Room/Bed Allocation

After successful payment:

~~~text
Verified payment
      ↓
Find currently available bed
      ↓
Safely claim the bed
      ↓
Create allocation
      ↓
Update occupancy state
      ↓
Activate accommodation
      ↓
Notify tenant
      ↓
Notify manager
      ↓
Write audit event
~~~

The allocation operation must be concurrency-safe.

## 7. Double-Allocation Prevention

Example:

~~~text
Bed 204-3 = last available bed

Tenant A payment ──┐
                   ├──> Allocation transaction
Tenant B payment ──┘

Result:
One tenant receives the bed.
The other cannot receive the same bed.
~~~

The database transaction is the final protection against race conditions.

## 8. Occupancy Automation

When an active allocation is created:
- Bed becomes occupied
- Room occupancy information updates
- Hostel availability changes
- Tenant accommodation becomes active

When a valid check-out occurs:
- Active stay closes
- Allocation becomes inactive when appropriate
- Bed becomes available
- Occupancy information updates

## 9. Balance Automation

Balances should be derived from trusted fee and payment records.

Conceptually:

~~~text
balance = charges - verified payments
~~~

The frontend should display the resulting value rather than allowing the tenant to set a balance.

## 10. Receipt Automation

After a verified payment:
- Create or make available the relevant receipt
- Link it to the transaction
- Make it available to the authorized tenant
- Make it visible to authorized management

## 11. Notification Automation

System events can create notifications.

| Event | Recipient |
|---|---|
| Payment verified | Tenant + Manager |
| Room assigned | Tenant + Manager |
| Maintenance request submitted | Manager/assigned staff |
| Maintenance status changed | Tenant |
| Announcement published | Target audience |
| Payment reminder due | Tenant |
| Important management event | Authorized manager/staff |

## 12. Maintenance Automation

Basic status flow:

~~~text
Submitted
   ↓
Received
   ↓
Assigned
   ↓
In Progress
   ↓
Resolved
   ↓
Closed
~~~

The system should preserve the request history.

## 13. Staff Task Automation

When a manager assigns a maintenance or operational task:

~~~text
Task created
   ↓
Staff assigned
   ↓
Staff notified
   ↓
Task in progress
   ↓
Task completed
   ↓
Manager/tenant notified where relevant
~~~

## 14. Audit Automation

Important automated and administrative events should create audit records.

Examples:
- Payment verified
- Bed allocated
- Occupancy changed
- Tenant activated
- Check-in recorded
- Check-out recorded
- Manager CRUD action
- Permission-sensitive change

## 15. Failure Handling

Automation must not silently fail.

When an automated operation fails:

1. Keep the data in a safe state.
2. Record the failure.
3. Avoid partial duplicate operations.
4. Provide a recoverable status.
5. Alert the responsible management/system process where appropriate.

Example:

~~~text
Payment verified
   ↓
Allocation fails
   ↓
Do not pretend allocation succeeded
   ↓
Record failure
   ↓
Keep payment state accurate
   ↓
Recovery process handles allocation
~~~

## 16. Idempotency

Operations triggered by external events must be safe when repeated.

Example:

~~~text
Payment webhook received
Payment webhook received again
Payment webhook received again
~~~

These repeated events must resolve to one correct payment outcome, not three payments or three allocations.

## 17. Human Oversight Rule

Automation should remove repetitive work, not remove necessary control.

Managers remain responsible for:
- Exceptional corrections
- Operational decisions
- Staff administration
- Hostel configuration
- Complaints/incidents
- Maintenance oversight
- Reports and management review

## 18. Automation Acceptance Test

The core automated journey must eventually pass:

~~~text
Application
→ Availability
→ Payment
→ Verification
→ One allocation
→ Occupancy update
→ Tenant activation
→ Notification
→ Manager dashboard update
~~~

This is one of Hostivo's most important MVP workflows.
