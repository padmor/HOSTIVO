# Hostivo — Authentication

## 1. Scope

Authentication establishes identity for Hostivo users and provides the foundation for manager, staff, tenant, and system-administrator access.

The first implemented account-creation path is tenant signup.

## 2. Authentication Stack

- Supabase Auth
- @supabase/ssr
- Next.js App Router
- Next.js Proxy
- Server Actions
- PostgreSQL RLS

Supabase's current Next.js SSR guidance uses @supabase/ssr, separate browser/server clients, cookie-based sessions, and getClaims() in the Proxy for protected server-side requests.

## 3. Signup Flow

Tenant enters name, email, password
-> Server-side Zod validation
-> Supabase Auth signUp()
-> Supabase creates auth identity
-> Database trigger creates profile and tenant role
-> Email confirmation when required
-> Auth callback exchanges code for session
-> Dashboard routing
-> Tenant portal

## 4. Login Flow

Email + password
-> Server Action
-> Supabase signInWithPassword()
-> Session cookie
-> Next.js Proxy refresh/validation
-> getClaims()
-> Role lookup
-> Role-specific portal

## 5. Roles

Initial role values:

- system_admin
- manager
- staff
- tenant

Open public signup assigns the tenant role through the database trigger.

Manager/staff provisioning is not exposed as an open self-service role selector.

## 6. Protected Routes

The authentication proxy protects:

- /dashboard
- /manager
- /staff
- /tenant

Authenticated users visiting /login are sent to /dashboard.

## 7. Security Rules

- Never trust client-supplied role information.
- Never expose privileged Supabase keys in browser code.
- Use the publishable key on the client.
- Use cookie-based SSR sessions.
- Use getClaims() for server-side route protection.
- Enforce access again with database RLS.
- Validate authentication inputs on the server.
- Prevent open redirects when honoring a return path.
- Do not leak provider/server internals in public error messages.

## 8. Environment Variables

Required:

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- NEXT_PUBLIC_SITE_URL

Privileged keys must remain server-side and must never be placed in NEXT_PUBLIC_* variables.

## 9. Supabase Auth URL Configuration

Development callback:

http://localhost:3000/auth/callback

Production uses the deployed Hostivo origin plus:

/auth/callback

The production site URL must also match NEXT_PUBLIC_SITE_URL.

## 10. Manager Onboarding

Open signup does not allow users to choose the manager or system-admin role.

A controlled manager provisioning process will be implemented in the platform-management milestone.

## 11. Acceptance Tests

### Tenant signup
- Valid tenant can submit signup.
- Invalid email is rejected.
- Short password is rejected.
- Duplicate account is handled safely.
- Profile is created.
- Tenant role is created.
- Confirmation callback exchanges the code successfully when enabled.

### Login
- Valid credentials create a session.
- Invalid credentials return a generic error.
- Authenticated user is routed according to role.
- Unauthenticated protected-route access redirects to /login.

### Isolation
- Tenant cannot read another tenant's protected records.
- Tenant cannot elevate their role through profile data.
- Client-side route changes cannot bypass server/database authorization.

## 12. Current Status

Authentication foundation is implemented.

The next milestone is manager/tenant onboarding integration with the Hostel domain and the first real Hostel data-management workflow.
