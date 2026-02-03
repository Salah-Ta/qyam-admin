# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Qyam Admin is an Arabic-language educational platform admin dashboard built with Remix, deployed on Cloudflare Pages. It manages trainers, supervisors, reports, certificates, and educational materials for the Qyam/Yania organization.

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production (copies fonts, updates sprites, runs vite build)
npm run typecheck    # TypeScript type checking
npm run lint         # ESLint
npm run deploy       # Build and deploy to Cloudflare Pages
npm run preview      # Build and preview locally with Wrangler

# Database
npm run db:generate  # Generate Prisma client (uses .dev.vars for env)
npm run db:migrate   # Run Prisma migrations

# Utilities
npm run update-sprite  # Regenerate SVG sprite sheet from app/assets/icons/
npm run typegen        # Generate Cloudflare binding types from wrangler.toml
```

## Architecture

### Tech Stack
- **Framework**: Remix v2 with Vite, deployed on Cloudflare Pages
- **Database**: PostgreSQL via Neon (serverless) with Prisma ORM
- **Auth**: better-auth library with email/password authentication
- **Storage**: Cloudflare R2 (bucket: `QYAM_BUCKET`)
- **Styling**: Tailwind CSS with custom Arabic font (PingARLT)
- **Email**: Resend API

### Routing (remix-flat-routes)

Routes use flat-routes convention with `+` suffix for nested layouts:
- `_home+/` - Public home page sections
- `_auth+/` - Authenticated user routes (login, join, dashboard)
- `_auth+/dashboard+/` - Main dashboard with `trainer+` and `admin+` sub-routes
- `_auth+/supervisor+/` - Supervisor-specific routes
- `_admin+/cp+/` - Admin control panel
- `_user+/` - User profile routes

### Database Layer (`app/db/`)

Server-only modules (`.server.ts` suffix) organized by entity:
- `db-client.server.ts` - Prisma client factory using Neon adapter
- Each entity has its own module: `user/`, `trainer/`, `report/`, `region/`, `eduAdmin/`, `school/`, `skill/`, `material/`, `message/`, etc.

### Authentication & Authorization

- Auth configured in `app/lib/auth.server.ts` using better-auth
- Session managed via `app/utils/session.server.ts`
- Permission check: `app/lib/check-permission.ts`
- User roles: `admin`, `user` (trainer), with `acceptenceState` for approval workflow
- API route: `_auth+/api.auth.$.ts` handles auth endpoints

### Key Types (`app/types/types.d.ts`)

- `QUser` - Extended user with region/school/eduAdmin relations
- `Report` - Trainer reports with volunteer hours, economic value, skills
- `Region`, `EduAdmin`, `School` - Organizational hierarchy
- `StatusResponse<T>` - Standard API response wrapper

### Component Organization

- `app/components/ui/` - shadcn/ui components (Button, Dialog, etc.)
- `app/components/UI-dashbord/` - Dashboard-specific components
- `app/components/admin/` - Admin panel components
- `app/components/emails/` - Email templates for Resend

### Assets

- `app/assets/icons/` - SVG icons (auto-sprited to `sheet/sprites.svg`)
- `app/assets/images/new-design/` - UI images
- `app/assets/fonts/` - Arabic fonts (PingARLT family, Amiri)
- `public/fonts/` - Fonts for PDF generation (Tajawal, Lateef, Amiri)
- `public/templates/` - Certificate PDF templates

### Environment Variables

Required in `.dev.vars` (local) or Cloudflare Pages secrets:
- `DATABASE_URL` / `DEV_DATABASE_URL` - Neon PostgreSQL connection string
- `RESEND_API` - Resend API key for emails
- `MAIN_EMAIL` - Sender email address

### PDF Certificate Generation

`app/utils/generateCertificate.ts` handles certificate PDF generation using pdf-lib with Arabic text support via custom fonts loaded from `/public/fonts/`.

## Code Conventions

- RTL (right-to-left) layout throughout - Arabic is the primary language
- Server-only code uses `.server.ts` suffix
- Client-only code uses `.client.ts` suffix
- Loader/action data validated with Zod schemas where applicable
- Toast notifications via sonner + custom `app/lib/toast.server.ts`

### Loader/Action Return Values (IMPORTANT)

This project uses `v3_singleFetch: true` which enables turbo-stream encoding. **Never use `Response.json()` or the deprecated `json()` helper in route loaders/actions.** They bypass turbo-stream and cause hydration errors or Worker crashes.

- **200 responses**: return a plain object (`return { users, regions }`)
- **Non-200 responses**: use `data()` from `@remix-run/cloudflare` (`return data({ error: "..." }, { status: 401 })`)
- **Responses with headers** (e.g. toast): use `data()` (`return data({ success: true }, { headers: await createToastHeaders(...) })`)
- **Binary responses** (file downloads): `new Response(blob, { headers })` is still correct
- **Redirects**: `redirect()` from `@remix-run/cloudflare` is still correct

An ESLint rule enforces this: `no-restricted-syntax` flags `Response.json()` in route files.
