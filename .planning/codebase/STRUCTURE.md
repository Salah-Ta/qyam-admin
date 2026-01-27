# Codebase Structure

**Analysis Date:** 2026-01-27

## Directory Layout

```
qyam-admin/
├── app/                           # Remix application source code
│   ├── routes/                    # File-based routing (flat-routes convention)
│   ├── components/                # Reusable React components
│   ├── db/                        # Database modules (server-only, one per entity)
│   ├── lib/                       # Utilities, auth, constants, glossary
│   ├── types/                     # TypeScript type definitions
│   ├── utils/                     # Helper functions (session, validation)
│   ├── assets/                    # Static assets (icons, images, fonts)
│   ├── root.tsx                   # Root layout component with theme
│   └── tailwind.css               # Tailwind CSS imports
├── prisma/                        # Database schema and migrations
│   ├── schema.prisma              # Prisma data model (PostgreSQL)
│   └── migrations/                # Database migration files
├── public/                        # Static files served directly
│   ├── fonts/                     # Fonts for PDF generation (Alexandria, Tajawal)
│   └── templates/                 # Certificate PDF templates
├── build/                         # Compiled output (Vite build)
│   └── client/                    # Client bundle (deployed to Cloudflare Pages)
├── .planning/                     # GSD planning documents
│   └── codebase/                  # Architecture analysis documents
├── vite.config.ts                 # Vite build configuration
├── remix.config.ts                # Remix/Vite plugin config (if exists)
├── wrangler.toml                  # Cloudflare Pages configuration
├── tsconfig.json                  # TypeScript configuration
├── load-context.ts                # Cloudflare context loader for Remix
├── tailwind.config.ts             # Tailwind CSS theme configuration
└── package.json                   # Dependencies and scripts
```

## Directory Purposes

**app/routes/ (Flat-Routes Convention):**
- Purpose: File-based routing with nested layout groups using `+` suffix
- Pattern: Groups are created with `_groupname+/` or `groupname+/`
- Layout nesting: `_auth+/dashboard+/trainer+/` creates deeply nested routes under auth boundary

**app/routes/_home+/:**
- Purpose: Public home page and marketing sections
- Key files: `_index.tsx` (landing page), `components-updated/` (sections)
- Contains: hero, statistics, teaching methods, evaluation sections, testimonials
- No authentication required

**app/routes/_auth+/:**
- Purpose: Authentication flows and authenticated user routes
- Key files:
  - `login.tsx`, `join.tsx`, `forgot-password.tsx` - Auth pages
  - `logout.tsx` - Sign out handler
  - `api.auth.$.ts` - better-auth API endpoint (catch-all)
  - `reset-password.tsx` - Password reset from email link
  - `dashboard.tsx` - Main authenticated hub
- Sub-routes: `dashboard+/`, `supervisor+/` - Role-specific sections
- Requires: Active session (redirects to /login if missing)

**app/routes/_auth+/dashboard+/:**
- Purpose: Main dashboard with role-based sub-sections
- Layout: `dashboard.tsx` is parent layout, children render in `<Outlet />`
- Sub-routes:
  - `trainer+/` - Trainer profile, reports, certificates, skills
  - `admin+/` - Admin console with user/article/material management
- Authentication: Requires valid session

**app/routes/_auth+/dashboard+/trainer+/:**
- Purpose: Trainer-specific dashboard pages
- Key files:
  - `trainerProfile.tsx` - User profile form, CV upload
  - `certificates.tsx` - View/download generated certificates
  - `successpillars.tsx` - Training hours, goals display
  - `NavFeatureCard.tsx` - Navigation card component
- Pattern: Sub-routes for modules (reports, skills, materials)
- Depends on: `materialDB`, `reportDB` for data

**app/routes/_auth+/dashboard+/admin+/:**
- Purpose: Admin-only management interface
- Key files:
  - `users.tsx` - User list, approval status management
  - `articles.tsx` - Article CRUD
  - `materials.tsx` - Educational material management
  - `programs.tsx` - Program configuration
  - `messages.tsx` - Support/messaging system
- Pattern: Table views with edit/delete dialogs
- Authorization: Checked via `check-permission.ts`

**app/routes/_auth+/supervisor+/:**
- Purpose: Supervisor region management
- Key files:
  - `users.tsx` - Trainers in region
  - `allTrainers.tsx` - View all trainers
  - `regionsStatistics.tsx` - Regional stats with shared chart component
  - `programStatics.tsx` - Program statistics
- Permissions: Role === "SUPERVISOR"

**app/routes/_admin+/cp+/:**
- Purpose: Admin control panel (alternative to dashboard admin section)
- Key files:
  - `_index.tsx` - Control panel home
  - `users.tsx` - User management
  - `articles+/` - Article CRUD with slug routes
  - `material.tsx` - Material management
  - `programs.tsx` - Program management
  - `messages.tsx` - System messages
- Pattern: CRUD operations for content management

**app/routes/_user+/:**
- Purpose: User profile and learning center
- Key files:
  - `profile.tsx` - User profile view/edit
  - `center.tsx` - Learning center layout
  - `center+/courses.tsx`, `programs.tsx`, `articles+/` - Content browsing
  - `levels.tsx` - User level progression
- Pattern: Read-only for regular users, full edit for own profile

**app/routes/ (Root level):**
- `$.tsx` - Splat route (404 fallback) - renders when no route matches
- `404.tsx` - Error page component
- `api.notifications.tsx` - API endpoint: GET unread messages
- `api.qrcode.tsx` - API endpoint: Generate QR code
- `contact.tsx` - Contact form page
- `download.$.ts` - File download handler (R2 bucket retrieval)

**app/routes/dashbord/ (Legacy):**
- Purpose: Legacy dashboard components (being deprecated/refactored)
- Contains: Old UI component copies, duplicate assets
- Status: Not used in current routing (artifacts from refactor)

**app/components/ (Reusable Components):**
- Purpose: Shared React components used across pages
- `ui/` - shadcn/ui base components (Button, Dialog, Input, Table, etc.)
- `UI-dashbord/` - Dashboard-specific components
- `admin/` - Admin panel exclusive components
- `emails/` - Email template components (React for Resend)
- Key files: `navbar.tsx`, `footer.tsx`, `RegionsChart.tsx`, `CertificateRow.tsx`, `NotificationDropdown.tsx`

**app/db/ (Database Layer):**
- Purpose: Entity-specific database operations (one module per Prisma model)
- Pattern: `{entity}.server.ts` exports object with async CRUD methods
- Files per entity:
  - `app/db/user/user.server.ts` - User queries, approval status updates
  - `app/db/report/report.server.ts` - Report CRUD with testimonials/skills
  - `app/db/material/material.server.ts` - Material CRUD
  - `app/db/trainer/trainer.server.ts` - Trainer-specific queries
  - `app/db/region/region.server.ts` - Regional data
  - `app/db/school/school.server.ts`, `app/db/eduAdmin/` - Organizational hierarchy
  - `app/db/skill/`, `app/db/testimonial/`, `app/db/message/`, `app/db/statistics/`, `app/db/articles/`, `app/db/program/`, `app/db/role/`
- All access via: `import userDB from '~/db/user/user.server.ts'`

**app/db/db-client.server.ts:**
- Purpose: Prisma client factory with Neon serverless adapter
- Exports: `createPrismaClient(dbUrl?, context?)`, aliases `client`, `getPrismaClient`
- Configuration: WebSocket for Neon, connection pool with max=1 (serverless optimization)
- Error handling: Throws if no DATABASE_URL found

**app/lib/ (Utilities & Core Logic):**
- `auth.server.ts` - better-auth configuration, session management, password hashing, admin plugin
- `auth.client.ts` - Client-side auth SDK initialization
- `get-authenticated.server.ts` - Session extraction, auth guards (`requireAuth`, `requireNoAuth`, `requireSpecialCase`)
- `check-permission.ts` - Role-based access check
- `send-email.server.ts` - Resend API integration for sending emails
- `glossary.ts` - All UI text in Arabic/English (translation map)
- `statistics.server.ts` - Platform statistics calculation
- `toast.server.ts` - Server-side toast notification handling
- `constants.ts` - Region list and other constants
- `get-error-messege.ts` - Error message mapping
- `animation.ts`, `tw-merge.ts`, `utils.ts` - Helper utilities

**app/types/types.d.ts:**
- Purpose: Central TypeScript definitions
- Exports: `QUser`, `Report`, `Region`, `School`, `EduAdmin`, `Skill`, `Material`, `Article`, `Program`, `StatusResponse<T>`, `AcceptenceState`, `UserRole`
- Base types: Extend better-auth User type with domain fields
- Used by: All database modules and components for type safety

**app/utils/:**
- `session.server.ts` - Session cookie management (getSession, commitSession, destroySession)
- `generateCertificate.ts` - PDF certificate generation using pdf-lib with Arabic fonts
- Pattern: Server-only utilities imported with `.server` suffix for tree-shaking

**app/assets/:**
- `icons/` - SVG icons, auto-sprited to `icons/sheet/sprites.svg`
- `images/new-design/` - Marketing/UI images (header, login, sections)
- `fonts/` - Arabic fonts for UI (PingARLT, Amiri)

**prisma/:**
- `schema.prisma` - Prisma data model (PostgreSQL)
  - Models: User, Session, Account, Verification (better-auth), Material, Program, Article, Category, Statistics, UserCertificate, Region, EduAdmin, School, Report, Skill, SkillReport, Testimonial, TestimonialReport, Message
  - Indexes on: `acceptenceState`, `role`, `regionId`, `userId` (for common queries)
  - Relations: User ↔ Report, User ↔ Message, Report ↔ SkillReport, Report ↔ TestimonialReport
- `migrations/` - Schema migration history

**public/:**
- `fonts/` - Fonts copied from `app/assets/fonts` via `npm run copy-fonts`
  - Used for: PDF certificate generation (Alexandria, Tajawal, Lateef, Amiri)
- `templates/` - Certificate PDF template files

**Build & Config:**
- `vite.config.ts` - Vite + Remix plugin config with flat-routes, TypeScript paths, SSR settings
- `wrangler.toml` - Cloudflare Pages deployment config (pages_build_output_dir = "./build/client")
- `load-context.ts` - Cloudflare context loader for Remix SSR
- `tsconfig.json` - Path aliases (`~` → `app/`), strict mode
- `tailwind.config.ts` - Tailwind theme, RTL support, custom colors
- `tailwind.css` - Tailwind directives
- `package.json` - Dependencies, scripts (dev, build, deploy, db:generate, db:migrate)

## Key File Locations

**Entry Points:**
- `app/root.tsx` - Root layout component (renders navbar, Outlet, footer, toaster)
- `app/routes/$.tsx` - Not-found handler (404)
- `app/routes/_home+/_index.tsx` - Public home page
- `app/routes/_auth+/login.tsx` - Login page
- `app/routes/_auth+/dashboard.tsx` - Main authenticated dashboard

**Configuration:**
- `app/lib/auth.server.ts` - Authentication setup
- `prisma/schema.prisma` - Database schema
- `vite.config.ts` - Build configuration
- `wrangler.toml` - Cloudflare deployment config
- `tailwind.config.ts` - Styling configuration

**Core Logic:**
- `app/db/db-client.server.ts` - Database client factory
- `app/db/user/user.server.ts` - User operations
- `app/db/report/report.server.ts` - Report operations
- `app/lib/glossary.ts` - UI text translations
- `app/utils/session.server.ts` - Session management
- `app/utils/generateCertificate.ts` - PDF certificate generation

**Testing:**
- Not detected - No test files in codebase

## Naming Conventions

**Files:**
- Routes: PascalCase or lowercase with hyphens (e.g., `trainerProfile.tsx`, `forgot-password.tsx`)
- Components: PascalCase (e.g., `RegionsChart.tsx`, `NavFeatureCard.tsx`)
- Database modules: camelCase (e.g., `user.server.ts`, `report.server.ts`)
- Utils: camelCase (e.g., `session.server.ts`, `generateCertificate.ts`)
- Server-only: `.server.ts` suffix (enforced for tree-shaking)
- Client-only: `.client.ts` suffix

**Directories:**
- Flat-routes groups: `_groupname+/` (private) or `groupname+/` (public with parent)
- Entity databases: `db/{entity}/` (lowercase singular)
- Components: `components/{category}/` or just `components/`

## Where to Add New Code

**New Feature (end-to-end):**
- Route/page: `app/routes/{groupname}+/{pageName}.tsx`
- Database operations: `app/db/{entity}/{entity}.server.ts` (add method to exports)
- Components: `app/components/{category}/{ComponentName}.tsx`
- Types: Add to `app/types/types.d.ts` if domain type
- Database model: Add to `prisma/schema.prisma`, run `npm run db:migrate`
- Styles: Use Tailwind classes in components
- Validation: Zod schema in database module or route loader

**New Dashboard Page (under authenticated routes):**
- Location: `app/routes/_auth+/dashboard+/{feature}+/_index.tsx` (or `.tsx` if single file)
- Layout: Use `Outlet` for nested routes
- Data loading: Add loader with `getAuthenticated()` check
- Database: Import from `app/db/{entity}/`
- Components: Build from `app/components/ui/` and `app/components/UI-dashbord/`

**New Component/Module:**
- Reusable component: `app/components/{category}/{ComponentName}.tsx`
- Server-only utility: `app/lib/{utilName}.server.ts`
- Client-only utility: `app/lib/{utilName}.client.ts` (rare)
- Shared: `app/lib/{utilName}.ts` (isomorphic)

**Utilities & Helpers:**
- Shared helpers: `app/lib/` (alphabetically organized)
- Session/auth: `app/lib/auth.server.ts` or `app/utils/session.server.ts`
- Constants: `app/lib/constants.ts`
- Translations: Add to `app/lib/glossary.ts` object

**Database/ORM:**
- New entity: Create `app/db/{entity}/` directory
- Operations: `app/db/{entity}/{entity}.server.ts` with exported methods
- Model definition: Add to `prisma/schema.prisma`
- Migration: Run `npm run db:migrate` after schema change
- Client access: Always use factory: `client(dbUrl)` from `app/db/db-client.server.ts`

## Special Directories

**app/assets/icons/sheet/:**
- Purpose: Auto-generated SVG sprite sheet
- Generated: Yes (via `npm run update-sprite`)
- Committed: Yes (sprites.svg is checked in)
- Import: Inline SVG import or reference from sprite

**build/:**
- Purpose: Vite build output directory
- Generated: Yes (by `npm run build`)
- Committed: No (in .gitignore)
- Structure: `build/client/` contains bundled JavaScript and CSS

**public/fonts/:**
- Purpose: Web fonts for PDF generation at runtime
- Generated: No (copied from `app/assets/fonts/` via `npm run copy-fonts`)
- Committed: Yes (fonts needed for production)
- Used by: PDF certificate generation in `app/utils/generateCertificate.ts`

**prisma/migrations/:**
- Purpose: Database schema change history
- Generated: Yes (by `npm run db:migrate`)
- Committed: Yes (required for deploying schema to new databases)
- Process: Edit schema.prisma → run migrate → migration file created

**app/routes/dashbord/ (Legacy):**
- Purpose: Old component copies (being refactored out)
- Status: Deprecated
- Migration: Code moved to `app/components/` or `app/routes/_auth+/dashboard+/`

---

*Structure analysis: 2026-01-27*
