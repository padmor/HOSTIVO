# Hostivo Technology Stack

## Proposed MVP Stack

| Area | Technology | Role |
|---|---|---|
| Frontend | Next.js + React | Tenant portal and manager dashboard |
| Language | TypeScript | Application language and type safety |
| UI | Tailwind CSS + component system | Consistent interface |
| Database | PostgreSQL | Central system data |
| Backend platform | Supabase | Database, Auth, Storage, Realtime, backend services |
| Authentication | Supabase Auth | Accounts, identity, sessions |
| Authorization | PostgreSQL RLS | Database-level access control |
| Server logic | Next.js server-side code + Supabase Edge Functions | Secure business logic and automation |
| Payments | Paystack initially | Accommodation payment processing |
| File storage | Supabase Storage | Documents, receipts, photos, attachments |
| Realtime | Supabase Realtime | Live status/dashboard updates |
| Hosting | Vercel | Production web deployment |
| Source control | GitHub | Source, migrations, tests, documentation |
| Unit/integration tests | Vitest | Automated tests |
| End-to-end tests | Playwright | Complete browser workflows |
| Validation | TypeScript + schema validation | Input and data validation |
| Monitoring | Structured logging + application/database monitoring | Reliability and diagnosis |
| Backup | Managed PostgreSQL backups + recovery strategy | Data protection |

## Core Architecture

**Tenant Interface + Manager Interface**
→ **Next.js Web Application**
→ **Authentication / Business Logic / APIs**
→ **PostgreSQL / Supabase**
→ **Payments / Storage / Realtime / Backups**

## Technology Principle

Technology decisions must support the approved Hostivo workflows, security model, reliability requirements, and automation goals. The stack should not drive the product requirements.

## Development Status

The repository currently contains planning documentation only. Application code is intentionally not being implemented yet.
