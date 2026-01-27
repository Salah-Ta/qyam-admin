# Technology Stack

**Analysis Date:** 2026-01-27

## Languages

**Primary:**
- TypeScript 5.1.6 - Core application logic and type safety for both frontend and backend

**Secondary:**
- JavaScript - Configuration files (Vite, Tailwind, ESLint, PostCSS)
- SQL - PostgreSQL database via Prisma ORM

## Runtime

**Environment:**
- Node.js 20.0.0+ (specified in `package.json` engines)
- Cloudflare Workers/Pages for deployment

**Package Manager:**
- npm (version specified by lockfile in `package.json`)
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Remix 2.13.1 - Full-stack web framework with Vite integration (`@remix-run/react`, `@remix-run/cloudflare`, `@remix-run/cloudflare-pages`)
- React 18.2.0 - UI library for client-side rendering
- Vite 5.1.0 - Build tool and dev server with Remix plugin integration

**UI Components:**
- shadcn/ui (via Radix UI) - Multiple component libraries:
  - `@radix-ui/react-alert-dialog`
  - `@radix-ui/react-avatar`
  - `@radix-ui/react-checkbox`
  - `@radix-ui/react-dialog`
  - `@radix-ui/react-dropdown-menu`
  - `@radix-ui/react-label`
  - `@radix-ui/react-navigation-menu`
  - `@radix-ui/react-progress`
  - `@radix-ui/react-separator`
  - `@radix-ui/react-tabs`
  - `@radix-ui/react-toggle`
  - `@radix-ui/react-toggle-group`
  - `@radix-ui/react-tooltip`

**Styling:**
- Tailwind CSS 3.4.4 - Utility-first CSS framework
- Custom plugins: `tailwind-clip-path` (custom clip-path utilities), `tailwindcss-animate`
- PostCSS 8.4.38 with autoprefixer 10.4.19 for CSS processing

**Routing:**
- remix-flat-routes 0.6.5 - File-based routing convention with `+` suffix for nested layouts

**Testing:**
- Not detected in current stack

**Build/Dev:**
- Wrangler 3.76 - Cloudflare CLI for Pages deployment and local development
- TypeScript 5.1.6 - Type checking (via `npm run typecheck`)
- ESLint 8.38.0 - Code linting with TypeScript and React plugins
- Vite dev server - Local development with hot reload

## Key Dependencies

**Critical:**

- **@prisma/client 5.22.0** - PostgreSQL ORM for database interaction with Neon adapter
- **@prisma/adapter-neon 6.0.1** - Prisma adapter for Neon serverless PostgreSQL
- **@neondatabase/serverless 0.10.4** - Serverless PostgreSQL client for connection pooling
- **better-auth 1.0.20** - Authentication library with email/password support and Prisma integration
- **bcryptjs 3.0.2** - Password hashing (upgraded from `@noble/hashes` scrypt for new passwords)
- **resend 4.0.1-alpha.0** - Email service provider for transactional emails
- **pdf-lib 1.17.1** - PDF generation library for certificate creation
- **@pdf-lib/fontkit 1.1.1** - Font support for PDF generation with Arabic text

**Data & Formatting:**

- **zod 3.23.8** - Schema validation for runtime type checking
- **export-to-csv 1.4.0** - CSV export functionality for reports
- **qrcode 1.5.4** - QR code generation

**UI & Visualization:**

- **lucide-react 0.462.0** - Icon library with React components
- **chart.js 4.4.9** - Charting library for statistics
- **react-chartjs-2 5.3.0** - React bindings for Chart.js
- **d3-cloud 1.2.7** - Word cloud layout algorithm
- **react-wordcloud 1.2.7** - Word cloud visualization
- **@isoterik/react-word-cloud 1.2.0** - Alternative word cloud implementation

**Text Processing (Arabic):**

- **arabic-reshaper 1.1.0** - Arabic text reshaping for proper rendering
- **bidi-js 1.0.3** - Bidirectional text handling (RTL/LTR)

**File Handling:**

- **react-dropzone 14.3.5** - File upload drag-and-drop component
- **react-quill 2.0.0** - Rich text editor
- **pdfjs-dist 5.4.149** - PDF viewer and parser

**Utilities:**

- **clsx 2.1.1** - Conditional class name utility
- **tailwind-merge 2.5.5** - Merge Tailwind utility classes
- **class-variance-authority 0.7.1** - Component variant management
- **@paralleldrive/cuid2 2.2.2** - Unique ID generation
- **sonner 1.7.0** - Toast notification library
- **@react-email/components 0.3.2** - Email template components
- **@react-email/render 1.1.3** - Render React email templates to HTML
- **@react-email/tailwind 1.2.2** - Tailwind CSS support in email templates
- **@tanstack/react-table 8.20.5** - Headless table component library
- **ws 8.18.0** - WebSocket client for real-time communication
- **isbot 4.1.0** - Bot detection
- **mdx-bundler 10.0.3** - MDX content bundling

## Configuration

**Environment:**

- Configured via `.dev.vars` file for local development (referenced in scripts)
- `DATABASE_URL` / `DEV_DATABASE_URL` - Neon PostgreSQL connection string
- `RESEND_API` - Resend API key for email service
- `MAIN_EMAIL` - Sender email address for transactional emails
- `ADMIN_EMAIL` - Admin account email
- `R2_AUTH_KEY_SECRET` - Cloudflare R2 bucket authentication
- `CONTACT_NUMBER` - WhatsApp contact number (optional)

**TypeScript Configuration (`tsconfig.json`):**
- Target: ES2022
- Module: ESNext
- Strict mode enabled
- Path alias: `~/*` → `./app/*`
- Vite handles building, not tsc (noEmit: true)

**Build Configuration:**

- `vite.config.ts` - Remix Vite plugin with flat-routes integration
- Plugins: Remix plugin, Cloudflare dev proxy, TypeScript path resolution
- SSR mode: Specifies `lucide-react` and `react-dropzone` as external to prevent bundling issues

**Remix Configuration:**

- Future flags enabled:
  - `v3_singleFetch` - Single fetch per request
  - `v3_fetcherPersist` - Persistent fetchers
  - `v3_relativeSplatPath` - Relative splat paths
  - `v3_throwAbortReason` - Throw abort reasons
  - `v3_lazyRouteDiscovery` - Lazy route discovery
- Uses `remix-flat-routes` for file-based routing with `+` suffix convention

## Platform Requirements

**Development:**
- Node.js >= 20.0.0
- npm for package management
- Cloudflare Pages CLI (wrangler) for local preview
- PostgreSQL database (Neon serverless)

**Production:**
- Cloudflare Pages deployment platform
- Cloudflare Workers runtime support
- Neon serverless PostgreSQL database
- Cloudflare R2 bucket for file storage
- Resend for email delivery

---

*Stack analysis: 2026-01-27*
