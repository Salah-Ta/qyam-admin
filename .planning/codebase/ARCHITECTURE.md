# Architecture

**Analysis Date:** 2026-01-27

## Pattern Overview

**Overall:** Server-side rendered Remix application with layered architecture (routes → actions/loaders → database layer → Prisma ORM)

**Key Characteristics:**
- Remix v2 with Vite on Cloudflare Pages (serverless deployment)
- Flat-routes convention for file-based routing with nested layout groups
- Separation of concerns: server-only modules (`.server.ts`), client-only (`.client.ts`), routes/components
- Role-based access control with user approval workflow (acceptenceState)
- RTL/Arabic-first design with Tailwind CSS
- Real-time messaging and multi-role dashboard system

## Layers

**Routing Layer (Presentation):**
- Purpose: Handle HTTP requests, render components, collect form data
- Location: `app/routes/`
- Contains: Remix route files (`.tsx`), loaders, actions, components
- Depends on: Utilities, components, database modules, libraries
- Used by: Browsers/clients, Remix framework

**Business Logic Layer:**
- Purpose: Database operations, user authentication, authorization, email sending
- Location: `app/db/*/`, `app/lib/`
- Contains: Server-only database modules (`.server.ts`), auth configuration, permission checks, email templates
- Depends on: Prisma client, better-auth, Resend API, environment config
- Used by: Routes, loaders, actions

**Component Layer:**
- Purpose: Reusable UI elements and layout composition
- Location: `app/components/`
- Contains: shadcn/ui components, dashboard-specific components, email templates, admin panels
- Depends on: React, Radix UI primitives, utility libraries
- Used by: Routes and other components

**Data Access Layer:**
- Purpose: Database abstraction with CRUD operations
- Location: `app/db/*/` (per-entity modules)
- Contains: Prisma client factory, entity-specific operations (user, report, material, etc.)
- Depends on: Prisma ORM, Neon PostgreSQL adapter
- Used by: Routes and business logic

**Assets/Utilities:**
- Purpose: Static assets, type definitions, helper functions
- Location: `app/assets/`, `app/types/`, `app/lib/`
- Contains: SVG icons, images, fonts, TypeScript types, constants, glossary translations
- Used by: All layers

## Data Flow

**Request → Loader/Action → Database → Response:**

1. **Incoming Request** (client browser)
   - Route file receives request via `loader()` or `action()`
   - Authentication check: `getAuthenticated()` extracts session from Cookie header
   - Authorization check: `requireAuth()`, `requireSpecialCase()`, role validation via `QUser.role`

2. **Data Retrieval (Loader)**
   ```
   app/routes/_auth+/dashboard.tsx (loader)
   → app/lib/get-authenticated.server.ts (getAuth from better-auth)
   → app/db/db-client.server.ts (getPrismaClient)
   → Prisma queries to Neon PostgreSQL
   → Return data via Response.json()
   ```

3. **Data Mutation (Action)**
   ```
   FormData from form submission
   → app/routes/**/+/action (validate input)
   → app/db/{entity}/{entity}.server.ts (database operation)
   → Prisma create/update/delete
   → StatusResponse<T> wrapper
   → Redirect or response to client
   ```

4. **Client-side Updates**
   - Component receives loader data via `useLoaderData()`
   - Form submission via `<Form>` or `useFetcher()`
   - Toast notifications via `sonner` (showToast)
   - Custom event dispatching for cross-component state (trainer progress)

5. **Authentication Flow**
   ```
   Login form submission
   → app/routes/_auth+/login.tsx (action)
   → authClient.signIn() from app/lib/auth.client.ts
   → POST to _auth+/api.auth.$.ts (better-auth endpoint)
   → Session created if acceptenceState !== "idle" || "denied"
   → Cookie set in response
   ```

**State Management:**
- Session: better-auth session stored in HTTP-only cookie (managed by `getSession()`)
- Form state: React component state (useState)
- Progress tracking: localStorage for unsaved trainer reports (with custom event listeners)
- Global notifications: Root loader fetches messages, displays in navbar dropdown

## Key Abstractions

**QUser (Extended User Model):**
- Purpose: Represents authenticated user with organizational context
- Location: `app/types/types.d.ts`
- Properties: User from better-auth + domain fields (role, region, school, eduAdmin, acceptenceState, trainingHours)
- Pattern: Extended via `user.additionalFields` in `app/lib/auth.server.ts`

**StatusResponse<T>:**
- Purpose: Standardized API response wrapper
- Used in: All database module exports
- Structure: `{ status: "success" | "error" | "warning", message?: string, data?: T }`
- Example: `reportDB.createReport()` returns `StatusResponse<Report>`

**Database Modules (Entity Pattern):**
- Purpose: Encapsulate all operations for a domain entity
- Files: `app/db/{entity}/{entity}.server.ts`
- Examples: `app/db/user/user.server.ts`, `app/db/report/report.server.ts`
- Pattern: Default export is object with async methods: `{ getAll(), get(id), create(data), update(id, data), delete(id) }`
- Database initialization: `initializeDatabase(dbUrl)` factory pattern with fallback to env vars

**Authentication Adapter:**
- Purpose: Integrate better-auth with Prisma and extend user model
- Location: `app/lib/auth.server.ts`
- Features: Email/password auth, password hashing (bcrypt/scrypt hybrid), session hooks, admin plugin
- Key validation: `acceptenceState` check in session creation hook prevents login for denied/idle users

**Permission Checker:**
- Purpose: Role-based access control
- Location: `app/lib/check-permission.ts`
- Used by: Admin routes to verify user.role === "ADMIN"

## Entry Points

**Public Home (_home+/_index.tsx):**
- Location: `app/routes/_home+/_index.tsx`
- Triggers: GET `/` (public route)
- Responsibilities:
  - Fetch platform statistics (registeredUsers, trainingHours, curriculums)
  - Render marketing home page with hero, sections, testimonials, footer
  - Load data in loader via `statisticsDB.getStatistics()`

**Authentication Flow (_auth+):**
- Location: `app/routes/_auth+/login.tsx`, `join.tsx`, `forgot-password.tsx`
- Triggers: GET `/login`, `/join`, `/forgot-password`
- Responsibilities:
  - Handle user registration (join), login, password reset
  - Client-side form validation (email format, required fields)
  - Integration with better-auth via `authClient` library
  - Redirect authenticated users to dashboard

**API Auth Endpoint (_auth+/api.auth.$.ts):**
- Location: `app/routes/_auth+/api.auth.$.ts`
- Triggers: POST `/api/auth/*` (catch-all for better-auth endpoints)
- Responsibilities:
  - Route all better-auth calls (signIn, signUp, getSession, signOut)
  - Manages session creation/destruction
  - Returns JSON responses for auth operations

**Dashboard (_auth+/dashboard.tsx):**
- Location: `app/routes/_auth+/dashboard.tsx`
- Triggers: GET `/dashboard` (requires authentication)
- Responsibilities:
  - Central hub for authenticated users
  - Fetch user data and materials
  - Route to role-specific dashboards (trainer, admin, supervisor)
  - Handle file uploads to Cloudflare R2
  - Render progress tracking UI with localStorage state

**Trainer Dashboard (_auth+/dashboard+/trainer.tsx):**
- Location: `app/routes/_auth+/dashboard+/trainer.tsx` and sub-routes
- Triggers: `/dashboard/trainer/*`
- Responsibilities:
  - Display trainer profile, certificates, reports
  - Manage volunteer hours, skills, testimonials
  - Generate certificates via PDF generation utility
  - Track progress with unsaved changes warning

**Admin Control Panel (_admin+/cp+/):**
- Location: `app/routes/_admin+/cp+/` with sub-routes (users, articles, materials, programs, messages)
- Triggers: `/admin/cp/*` (requires role === "ADMIN")
- Responsibilities:
  - Manage user approvals (acceptenceState updates)
  - CRUD operations for articles, materials, programs
  - View/manage messages and support tickets
  - User account management and ban/suspension

**Supervisor Routes (_auth+/supervisor+/):**
- Location: `app/routes/_auth+/supervisor+/`
- Triggers: `/supervisor/*` (requires role === "SUPERVISOR")
- Responsibilities:
  - View region statistics and trainer data
  - Manage trainers in assigned region
  - View all regional trainers and their reports

**API Endpoints:**
- `app/routes/api.notifications.tsx` - Fetch unread messages (GET)
- `app/routes/api.qrcode.tsx` - Generate QR codes (POST)
- `app/routes/download.$.ts` - Download files from R2 (GET /download/*)
- `app/routes/contact.tsx` - Contact form submission (POST)

## Error Handling

**Strategy:** Hierarchical error boundaries with status code propagation

**Patterns:**
- Route loaders throw redirect or Response with status codes
- Error boundary components at route level (exported `ErrorBoundary` function)
- Root-level `GeneralErrorBoundary` component wraps all routes
- Fallback to 404 page via splat route (`app/routes/$.tsx`)

**Example:**
```typescript
// In loader - throw error response
export async function loader() {
  if (!user) throw new Response('Not found', { status: 404 })
}

// In route - export error boundary
export function ErrorBoundary() {
  return <GeneralErrorBoundary statusHandlers={{ 404: () => <NotFoundUI /> }} />
}
```

## Cross-Cutting Concerns

**Logging:** Console-based (development), structured via context in production via Cloudflare

**Validation:**
- Client-side: Input validation in route components (email regex, required fields)
- Server-side: Zod schemas in database modules for type safety
- Form submission: Standard HTML form submission with FormData parsing

**Authentication:**
- Session-based via HTTP-only cookies (30-day expiry)
- better-auth library manages session tokens and verification
- Acceptance workflow: Users must be "accepted" to create valid session

**Authorization:**
- Role-based: `QUser.role` checked against "ADMIN", "SUPERVISOR", "USER"
- Route-level: `requireAuth()`, `requireSpecialCase()` guards in loaders
- Component-level: Conditional rendering based on user.role

**File Storage:**
- Cloudflare R2 bucket (`context.cloudflare.env.QYAM_BUCKET`)
- Used for: CVs, certificates, certificates, educational materials
- Upload flow: Form → Loader action → R2.put() → Return storage key

**Email Notifications:**
- Resend API via `sendEmail()` utility
- Templates in `app/components/emails/`
- Used for: Password reset, registration approval/denial, status updates
- Configuration: `RESEND_API`, `MAIN_EMAIL` env vars

**Internationalization:**
- RTL layout via Tailwind CSS direction settings
- Arabic-first UI with English fallbacks
- Glossary translations in `app/lib/glossary.ts`
- Font support: PingARLT (UI), Amiri/Tajawal (PDFs)

---

*Architecture analysis: 2026-01-27*
