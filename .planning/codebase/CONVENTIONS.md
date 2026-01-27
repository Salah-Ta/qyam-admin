# Coding Conventions

**Analysis Date:** 2026-01-27

## Naming Patterns

**Files:**
- Server-only modules use `.server.ts` suffix: `app/db/user/user.server.ts`, `app/lib/auth.server.ts`, `app/utils/session.server.ts`
- Client-only modules use `.client.ts` suffix (detected in tsconfig includes)
- Components use PascalCase: `Icon.tsx`, `ClientWordCloud.tsx`, `RegionsChart.tsx`
- Route files follow remix-flat-routes convention with `+` for nested layouts: `_auth+/`, `_admin+/cp+/`, `_user+/`
- Utility and helper files use camelCase: `generateCertificate.ts`, `santize-arabic.filenames.ts`
- Database entity modules organized by entity name: `app/db/user/`, `app/db/trainer/`, `app/db/report/`

**Functions:**
- Event handlers and callbacks use camelCase: `editUserRegisteration`, `createUser`, `bulkEditUserRegisteration`, `getUsersByRegion`
- Factory/constructor functions use camelCase: `initializeDatabase`, `getResendObject`, `createPrismaClient`
- React component functions use PascalCase: `function Index()`, `export function Icon()`, `const Input = React.forwardRef()`
- Private helper functions start with lowercase: `transformUser`, `getResendObject`
- Async functions follow same naming (no async prefix): `async function loader()`, `async function action()`, `const createUser = async ()`

**Variables:**
- Use camelCase for all variables and constants: `regionIds`, `eduAdminIds`, `schoolIds`, `regionMap`, `emailComponent`
- Constants defined as lowercase when mutable: `const sizeClassName = { ... }`, `const childrenSizeClassName = { ... }`
- Type discriminants use literal unions: `status: "success" | "error" | "warning"`
- Use `const` as default, only use `let` when mutations needed

**Types:**
- Type names use PascalCase: `QUser`, `StatusResponse<T>`, `AcceptenceState`, `UserRole`
- Type files use `.d.ts` extension: `app/types/types.d.ts`, `app/types/auth.types.d.ts`
- Discriminated union types for status: `status: "success" | "error"` paired with data fields
- Optional fields suffixed with `?`: `id?: string`, `regionName?: string | null`

## Code Style

**Formatting:**
- No `.prettierrc` or explicit prettier configuration detected - code appears manually formatted
- Mixed spacing patterns observed (inconsistent indentation in some files)
- Import statements use standardized ordering (see Import Organization)
- No explicit linting for spacing/indentation beyond ESLint defaults

**Linting:**
- ESLint enabled with configuration at `.eslintrc.cjs`
- Base config: `eslint:recommended`
- React plugins: `plugin:react/recommended`, `plugin:react/jsx-runtime`, `plugin:react-hooks/recommended`
- Accessibility: `plugin:jsx-a11y/recommended`
- TypeScript: `@typescript-eslint/recommended`, `plugin:import/typescript`
- Cache location: `./node_modules/.cache/eslint`
- Run via: `npm run lint`

## Import Organization

**Order:**
1. React and framework imports: `import { useState, useReducer }`, `import { LoaderFunctionArgs }`
2. External dependencies: `import { Resend }`, `import { clsx }`, `import bcrypt`
3. Internal absolute imports (using `~` path alias): `import glossary from "~/lib/glossary"`, `import { client } from "~/db/db-client.server"`
4. Relative imports (rare): `import { something } from "../module"`
5. Side effects last: `import "./tailwind.css"`

**Path Aliases:**
- Single alias configured: `~/*` maps to `./app/*`
- All internal imports use `~` prefix: `~/lib/`, `~/db/`, `~/components/`, `~/types/`, `~/utils/`, `~/routes/`
- Import resolver configured for TypeScript: `typescript: { alwaysTryTypes: true }`
- Internal regex pattern for import resolution: `"import/internal-regex": "^~/"`

**Example import block from `app/db/user/user.server.ts`:**
```typescript
import glossary from "~/lib/glossary";
import { client } from "../db-client.server";
import { StatusResponse, QUser, AcceptenceState } from "~/types/types";
import { sendEmail } from "~/lib/send-email.server";
import bcrypt from "bcryptjs";
```

## Error Handling

**Patterns:**
- Promise-based error handling with `.then().catch()` blocks (majority pattern in database modules)
- Reject with `StatusResponse<T>` wrapper: `reject({ status: "error", message: "...", data?: T })`
- Try-catch blocks in async functions: `try { ... } catch (error: any) { ... }`
- Type-safe error checks: `error.code === 'P2003'` (Prisma-specific codes)
- Fallback error messages with Arabic text: `"فشل إنشاء المستخدم"`, `"لم يتم العثور على المستخدم"`

**StatusResponse Pattern (used throughout codebase):**
```typescript
type StatusResponse<T> = {
  status: "success" | "error" | "warning";
  message?: string;
  data?: T | T[];
};
```

**Example from `app/db/user/user.server.ts`:**
```typescript
return new Promise((resolve, reject) => {
  db.user.findMany(...)
    .then((users) => {
      resolve({ status: "success", data: transformedUsers });
    })
    .catch((error: any) => {
      reject({
        status: "error",
        message: glossary.status_response.error.general,
      });
    });
});
```

**Error Boundary Pattern in React:**
- Use `GeneralErrorBoundary` component from `app/components/error-boundry.tsx`
- Define status handlers for specific HTTP codes: `statusHandlers?: Record<number, StatusHandler>`
- Use `useRouteError()` hook to capture errors in route error boundaries
- Handle unexpected errors with custom fallback: `unexpectedErrorHandler?: (error: unknown) => JSX.Element | null`

## Logging

**Framework:** Console-based logging (no structured logging library)

**Patterns:**
- Debug logging with `console.log()`: `console.log("Loading template from:", templatePath)`
- Error logging with `console.error()`: `console.error("Error generating PDF:", error)`
- Warning logging with `console.warn()`: `console.warn("Error loading font...")`
- No log levels or severity configuration - pure console output
- Extensive logging in development-critical paths: PDF generation, font loading, database operations

**Observed Usage:**
- Database module errors: `console.log("ERROR [methodName]: ", error)`
- Component errors: `console.error("Error generating PDF:", error)` in catch blocks
- Development helpers: `console.log("Word clicked:", word)` in event handlers
- Template loading: `console.log("Response status:", response.status)`

**Guidelines:**
- Log errors in catch blocks for debugging
- Include context in log messages (function name, operation being performed)
- Clean up console.log statements before production (not enforced, but observed in generated template code)

## Comments

**When to Comment:**
- Route comments explain purpose: `// This is called a "splat route"...` in `app/routes/$.tsx`
- Commented-out code preserved for context: `{/* <BackIcon/> */}` in route components
- JSDoc-style comments for exported functions (sparse usage): `/** Get user details including certificates */`
- Inline comments rare; code generally self-documenting

**JSDoc/TSDoc:**
- Minimal usage - mostly single-line description comments
- Example from `app/db/user/user.server.ts`:
```typescript
/**
 * Get user details including certificates
 */
const getUserWithCertificates = (userId: string, dbUrl?: string): Promise<StatusResponse<any>> => {
```

- Function types documented via TypeScript signatures, not JSDoc params
- No return type documentation in comments (TypeScript types used)

## Function Design

**Size:**
- Database functions are large (200-400 lines) to handle complete CRUD operations with relationships
- Database functions like `deleteUser()` include transaction management and cascading deletes
- Helper functions are small and focused (5-20 lines)
- React components vary 30-200 lines depending on complexity

**Parameters:**
- Use objects for multiple parameters: `userData: { name: string, email: string, ... }`
- Optional parameters use `?`: `dbUrl?: string`, `emailConfig?: { ... }`
- Configuration parameters grouped in single object: `emailConfig?: { resendApi: string; mainEmail: string; userEmail: string }`
- Curried style not used; direct parameter passing

**Return Values:**
- Always use `Promise<StatusResponse<T>>` for async database functions
- React components return `JSX.Element` or component functions returning components
- Handler functions return middleware responses: `return auth.handler(request)`
- Use tuple destructuring for multiple returns: `const [regions, eduAdmins, schools] = await Promise.all([...])`

**Example from `app/db/user/user.server.ts`:**
```typescript
const createUser = (userData: {
  name: string,
  email: string,
  password: string,
  phone?: string,
  role: string,
  regionId?: string,
  eduAdminId?: string,
  schoolId?: string,
  acceptenceState?: string
}, dbUrl?: string, emailConfig?: { resendApi: string, mainEmail: string }): Promise<StatusResponse<null>> => {
  // implementation
}
```

## Module Design

**Exports:**
- Default exports for database modules: `export default { methodA, methodB, ... }`
- Named exports for components: `export function Icon()`, `export { Input }`
- React components typically default export: `export default function Index()`
- Utility modules use named exports: `export const cn = (...inputs: ClassValue[]) => { ... }`

**Barrel Files:**
- Email templates organized in constants barrel: `app/components/emails/constants.ts`
- No evidence of comprehensive index.ts barrel files in component directories
- Each module is self-contained with explicit imports

**Example default export pattern from database modules:**
```typescript
export default {
  editUserRegisteration,
  bulkEditUserRegisteration,
  getAllUsers,
  getUser,
  getUserByEmail,
  createUser,
  updateUser,
  deleteUser,
  getUsersByRegion,
  getUsersByEduAdmin,
  getUsersBySchool,
  getUserWithCertificates,
  addCertificateToUser
};
```

---

*Convention analysis: 2026-01-27*
