
# Hostivo — UI/UX Structure

## 1. Purpose

This document defines the planned user experience before interface implementation.

Hostivo has two main user-facing experiences:
- Manager Dashboard
- Tenant Portal

The interface should make the real hostel processes simple, visible, and understandable.

## 2. General UX Principles

Hostivo should be:
- Simple
- Clear
- Fast to understand
- Mobile-friendly
- Accessible
- Consistent
- Responsive
- Status-driven
- Focused on real tasks

The UI should not expose unnecessary technical complexity to ordinary users.

## 3. Manager Dashboard

### Main Navigation

~~~text
Dashboard
Tenants
Buildings
Floors
Rooms
Beds
Applications
Allocations
Payments
Maintenance
Complaints
Incidents
Staff
Announcements
Reports
Settings
~~~

## 4. Manager Dashboard Overview

The first screen should give the manager a useful operational snapshot.

Possible information:

~~~text
Total Beds
Occupied Beds
Available Beds
Current Tenants
Recent Applications
Recent Payments
Outstanding Balances
Open Maintenance
Recent Incidents
Pending Staff Tasks
~~~

The values should come from authoritative data.

## 5. Hostel Structure

Manager workflow:

~~~text
Hostel
 ↓
Buildings
 ↓
Floors
 ↓
Rooms
 ↓
Beds
~~~

Each level should provide:
- View
- Create
- Update
- Archive/delete where allowed
- Search
- Filter
- Status

## 6. Tenant Management

Manager should be able to:
- Search tenants
- View tenant details
- View accommodation
- View payment information
- View application history
- View relevant maintenance/incident records
- Update permitted fields
- Perform permitted record management

Sensitive information must respect authorization.

## 7. Application Management

The dashboard should show:
- Application status
- Applicant identity
- Availability/payment state
- Application date
- Allocation state

Because ordinary available-slot applications proceed automatically, the manager's dashboard is primarily for monitoring and exception handling rather than waiting for manual approval.

## 8. Payment Management

Manager payment area should provide:
- Transactions
- Status
- Amount
- Tenant
- Application
- Reference
- Date/time
- Payment history
- Outstanding balances

Financial records should have clear status indicators and traceable references.

## 9. Automatic Allocation Visibility

The manager should be able to see automatic allocation outcomes.

Example:

~~~text
Tenant: Applicant
Payment: Verified
Room: 204
Bed: 3
Allocation: Active
~~~

The manager can manage authorized records and handle exceptions.

## 10. Tenant Portal

### Main Navigation

~~~text
Dashboard
My Profile
My Application
My Accommodation
Payments
Maintenance
Complaints / Reports
Announcements
My Records
~~~

## 11. Tenant Dashboard

The tenant should quickly understand:
- Application state
- Accommodation
- Payment status
- Outstanding balance
- Open requests
- Important announcements

## 12. Tenant Application Journey

~~~text
Start Application
      ↓
Enter Information
      ↓
System Checks Availability
      ↓
Available?
  ┌───┴────┐
 No        Yes
 ↓          ↓
No slot    Payment
              ↓
        Payment verified
              ↓
      Automatic allocation
              ↓
      Accommodation shown
~~~

## 13. Tenant Accommodation

Once allocated, the tenant should clearly see:
- Hostel
- Building
- Floor
- Room
- Bed
- Stay status
- Relevant check-in information

The interface should not require the tenant to understand database relationships.

## 14. Tenant Payments

Tenant payment area should show:
- Amount due
- Amount paid
- Current balance
- Payment history
- Transaction references where appropriate
- Receipts

Payment status must come from server-verified payment records.

## 15. Maintenance UX

Tenant:

~~~text
Report Problem
 ↓
Describe Issue
 ↓
Submit
 ↓
Track Status
~~~

Manager/staff:

~~~text
Receive Request
 ↓
Assign
 ↓
Track
 ↓
Resolve
~~~

## 16. Complaints and Incidents

Tenants should have a simple way to submit permitted reports.

Managers should have a structured workspace to:
- Review
- Record
- Track status
- Add relevant notes
- Preserve history

## 17. Announcements

Manager:

~~~text
Create Announcement
 ↓
Choose Audience
 ↓
Publish
 ↓
Notification
~~~

Tenant:

~~~text
Receive
 ↓
Read
 ↓
Keep in history
~~~

## 18. Responsive Access

Hostivo is intended to be accessible from:
- Phones
- Tablets
- Laptops
- Desktop computers

The manager dashboard may use wider layouts on larger screens while remaining usable on smaller devices.

## 19. Accessibility

The UI should support:
- Keyboard navigation
- Clear labels
- Sufficient text readability
- Form validation messages
- Meaningful status indicators
- Accessible controls
- Consistent interaction patterns

Color should not be the only way to communicate status.

## 20. Status Language

Use simple language.

Examples:
- Available
- Occupied
- Reserved
- Pending
- Paid
- Payment Failed
- Active
- In Progress
- Resolved
- Closed

Users should be able to understand system state without technical knowledge.

## 21. CRUD UX

For manager CRUD:

~~~text
View
 ↓
Create / Edit
 ↓
Validate
 ↓
Confirm
 ↓
Save
 ↓
Audit
 ↓
Refresh displayed state
~~~

Destructive operations should require appropriate confirmation and permissions.

## 22. Core UX Success Test

A new tenant should be able to understand and complete:

~~~text
Application
→ Availability
→ Payment
→ Automatic Room/Bed Assignment
→ Accommodation Confirmation
→ Check-In
~~~

A manager should be able to understand and manage:

~~~text
Hostel Status
→ Tenants
→ Rooms/Beds
→ Payments
→ Maintenance
→ Incidents
→ Staff
→ Reports
~~~

The interface is successful when these real-world tasks are easier than the manual process Hostivo replaces.
