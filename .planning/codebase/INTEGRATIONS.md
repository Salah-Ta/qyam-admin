# External Integrations

**Analysis Date:** 2026-01-27

## APIs & External Services

**Email Service:**
- Resend - Email delivery for transactional notifications
  - SDK/Client: `resend` package v4.0.1-alpha.0
  - Auth: `RESEND_API` environment variable
  - Implementation: `app/lib/send-email.server.ts`
  - Templates: `app/components/emails/` directory
  - Supported templates:
    - `user-registration` - New user welcome email
    - `program-status` - Program status updates
    - `password-reset` - Password reset emails
    - `contact` - Contact form responses
    - `account-deactivation` - Account deletion notifications
  - Batch email support via `sendBatchEmail()` function for multiple recipients

**WhatsApp Integration:**
- WhatsApp Business API via URL link generation
  - QR Code endpoint: `app/routes/api.qrcode.tsx`
  - Contact number: `CONTACT_NUMBER` environment variable
  - Usage: Links to WhatsApp conversations for support

**PDF Generation:**
- Custom PDF certificate generation
  - Service: pdf-lib with custom fonts
  - Implementation: `app/utils/generateCertificate.ts`
  - Font support: Arabic fonts from `/public/fonts/` (Alexandria, Tajawal, Lateef, Amiri)
  - Font embedding: `@pdf-lib/fontkit` for custom font rendering
  - Certificate data interface: `CertificateData` with name, administration, school, hours, trainer info
  - Template loading: Loads from `/assets/certificate-template.pdf` with fallback generation

**QR Code Generation:**
- QRCode library for generating verification/contact QR codes
  - Package: `qrcode` v1.5.4
  - Endpoint: `app/routes/api.qrcode.tsx`
  - Output: Data URL format for inline use

## Data Storage

**Databases:**

- **PostgreSQL (Neon Serverless)**
  - Connection: `DATABASE_URL` and `DEV_DATABASE_URL` environment variables
  - Provider: Neon serverless database on AWS eu-central-1
  - Client: Prisma ORM v5.22.0
  - Adapter: `@prisma/adapter-neon` v6.0.1 with connection pooling
  - Pool config:
    - max: 1 connection per request (optimal for serverless)
    - connectionTimeoutMillis: 10000
    - idleTimeoutMillis: 30000
    - maxUses: 1
    - allowExitOnIdle: true
  - WebSocket constructor: Native `ws` module for connection stability
  - Database client factory: `app/db/db-client.server.ts`
  - Schema: `prisma/schema.prisma`

**File Storage:**

- **Cloudflare R2 (Object Storage)**
  - Bucket name: `qyam-bucket`
  - Binding: `QYAM_BUCKET` (configured in `wrangler.toml`)
  - Auth: `R2_AUTH_KEY_SECRET` environment variable
  - Usage locations:
    - Certificate uploads: `app/routes/_auth+/dashboard.tsx`
    - Material uploads: `app/routes/_auth+/dashboard+/admin+/materials.tsx`
    - User file uploads: `app/routes/_admin+/cp+/material.tsx` and `users_.$id.tsx`
    - File downloads: `app/routes/download.$.ts`
  - Operations supported:
    - `put()` - Upload files with metadata
    - `get()` - Retrieve files
    - `head()` - Check file existence
  - Content security: Private cache headers on download, enforced no-cache policy

**Caching:**

- Not detected - Redis or similar caching service not used
- Cloudflare Pages/Workers edge caching only (implicit)

## Authentication & Identity

**Auth Provider:**

- Custom implementation with better-auth library
  - Library: `better-auth` v1.0.20
  - Auth method: Email + Password
  - Configuration: `app/lib/auth.server.ts`
  - Database: Prisma adapter with PostgreSQL
  - Plugins: Admin plugin for user management
  - Features:
    - Email/password authentication (auto sign-in disabled)
    - Session management with acceptance state validation
    - Password reset via email
    - Custom password hashing: bcryptjs for new passwords (v3.0.2)
    - Legacy support: scrypt (from `@noble/hashes`) for existing passwords
    - Custom additional fields: cvKey, bio, phone, acceptanceState, trainingHours, noStudents, region, level, role
  - Session validation: Users must have `acceptanceState === "accepted"` to maintain session
  - Implementation files:
    - Auth setup: `app/lib/auth.server.ts`
    - Auth endpoints: `app/routes/_auth+/api.auth.$.ts`
    - Session management: `app/utils/session.server.ts`
    - Permission checks: `app/lib/check-permission.ts`

**User Roles:**

- `admin` - Full administrative access
- `user` - Trainer/standard user
- `supervisor` - Supervisory access
- Acceptance workflow: `idle`, `accepted`, `rejected`

## Monitoring & Observability

**Error Tracking:**

- Not detected - No Sentry, Rollbar, or similar service

**Logs:**

- Console-based logging with selective levels
- Prisma client: `log: ['error']` (errors only)
- Database connection logging: Console output on connection string usage
- Auth logging: Console debug output in auth handler

## CI/CD & Deployment

**Hosting:**

- Cloudflare Pages v2.13.1
- Build output directory: `./build/client` (configured in `wrangler.toml`)
- Deployment via wrangler CLI
- Compatibility date: 2024-05-13
- Compatibility flags: `nodejs_compat_v2` (Node.js compatibility)

**CI Pipeline:**

- Not configured - Manual deployment via `npm run deploy`
- Build steps: `npm run update-sprite && remix vite:build`
- Sprite generation: SVG sprite sheet from `app/assets/icons/` via `svg-sprite` tool

**Local Development:**

- Development server: Remix Vite dev mode via `npm run dev`
- Preview: `npm run preview` (builds and runs with Wrangler Pages dev)
- Type checking: `npm run typecheck` (TypeScript compilation check)
- Linting: `npm run lint` (ESLint with caching)
- Database setup: `npm run db:generate` (Prisma client generation), `npm run db:migrate` (run migrations)

## Environment Configuration

**Required env vars:**

- `DATABASE_URL` - Production PostgreSQL connection string (Neon)
- `DEV_DATABASE_URL` - Development PostgreSQL connection string (Neon)
- `RESEND_API` - Resend API key for email delivery
- `MAIN_EMAIL` - Sender email address (e.g., no-reply@qyam.org)
- `ADMIN_EMAIL` - Administrator email address
- `R2_AUTH_KEY_SECRET` - Cloudflare R2 authentication token

**Optional env vars:**

- `CONTACT_NUMBER` - WhatsApp contact number for QR code generation

**Secrets location:**

- Local development: `.dev.vars` file (git-ignored)
- Production: Cloudflare Pages environment secrets via dashboard

**Variable access patterns:**

- Server code: Via `context.cloudflare.env.VARIABLE_NAME` (Cloudflare Workers context)
- Client code: No direct access (server-only via loaders/actions)

## Webhooks & Callbacks

**Incoming:**

- Auth endpoints: `_auth+/api.auth.$.ts` - Handles better-auth callbacks
  - Supports login, registration, password reset flows
  - Integrates with Resend for password reset emails

**Outgoing:**

- Email notifications:
  - User registration confirmation
  - Password reset emails
  - Program status updates (batch and individual)
  - Account deactivation notifications
  - All via Resend API

**File Downloads:**

- Public download endpoint: `app/routes/download.$.ts`
- Retrieves files from R2 bucket by storage key
- Content-Disposition header for browser download handling
- Support for UTF-8 filenames (RFC 5987 encoding)

## Third-Party Font Services

**Google Fonts / Self-hosted:**

- No external font service detected
- Fonts included locally:
  - `app/assets/fonts/` - Application UI fonts (PingARLT primary font)
  - `public/fonts/` - PDF generation fonts (Alexandria, Tajawal, Lateef, Amiri)
  - Font files copied via build script: `npm run copy-fonts`

## Data Validation

**Runtime Schema Validation:**

- Zod v3.23.8 for request/response validation
- Used in loaders and actions to validate Remix data

---

*Integration audit: 2026-01-27*
