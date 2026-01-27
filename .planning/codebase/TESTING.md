# Testing Patterns

**Analysis Date:** 2026-01-27

## Test Framework

**Runner:**
- Not detected - No testing framework configured in `package.json`
- No vitest, jest, mocha, or other test runner found in devDependencies
- No test config files (vitest.config.ts, jest.config.js) present

**Assertion Library:**
- Not detected - No assertion library in dependencies

**Run Commands:**
```bash
# No test commands configured
npm run test              # NOT DEFINED
npm test                  # NOT DEFINED
npm run test:watch       # NOT DEFINED
npm run test:coverage    # NOT DEFINED
```

## Test File Organization

**Status:** Not implemented

No test files detected in codebase. Search for `*.test.*` and `*.spec.*` patterns returned no results across the application.

**What Would Be Expected:**
- Test files would typically be co-located or in `__tests__` directories
- Naming would follow `.test.ts`, `.test.tsx`, `.spec.ts`, `.spec.tsx` patterns
- Database tests would live in `app/db/__tests__/`
- Component tests would live in `app/components/__tests__/`

## Test Structure

**Current State:** No testing framework installed

**When Testing Framework is Added:**
The codebase should use standard patterns for:
- Unit tests for database functions (`app/db/*/`)
- Component tests for React components (`app/components/`)
- Integration tests for Remix loaders and actions (`app/routes/`)

## Mocking

**Current State:** Not implemented

**What Will Be Needed:**
- Mock Prisma client for database testing
- Mock Remix LoaderFunctionArgs for route testing
- Mock fetch for external API calls (Resend email, Cloudflare R2)
- Mock environment variables for auth and configuration

**Expected Patterns for Future Implementation:**

Mocking database client:
```typescript
// Example structure for future tests
import { vi } from 'vitest';
import { client } from '~/db/db-client.server';

vi.mock('~/db/db-client.server', () => ({
  client: vi.fn(() => ({
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    report: { /* ... */ },
    // other entities
  }))
}));
```

Mocking Resend API:
```typescript
// Example for email service testing
vi.mock('~/lib/send-email.server', () => ({
  sendEmail: vi.fn().mockResolvedValue({ id: 'mock-email-id' })
}));
```

**What to Mock:**
- External services: Resend email API, Cloudflare R2, Neon database
- Environment configuration passed via context
- Time-based functions (crypto.randomUUID, Date.now)
- File system operations (PDF generation, font loading)

**What NOT to Mock:**
- Core business logic (user creation flow, report calculations)
- Validation logic (password verification, data transformation)
- Framework utilities (Remix loaders/actions)
- Standard library functions (Array methods, object operations)

## Fixtures and Factories

**Test Data:**
Not implemented - no factories or fixtures present

**Expected Pattern (for future implementation):**

User factory:
```typescript
export function createTestUser(overrides?: Partial<QUser>): QUser {
  return {
    id: crypto.randomUUID(),
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    acceptenceState: 'accepted',
    regionId: null,
    eduAdminId: null,
    schoolId: null,
    ...overrides
  };
}
```

Report factory:
```typescript
export function createTestReport(userId: string, overrides?: Partial<Report>): Report {
  return {
    id: crypto.randomUUID(),
    userId,
    volunteerHours: 10,
    economicValue: 500,
    volunteerOpportunities: 2,
    activitiesCount: 5,
    volunteerCount: 15,
    skillsEconomicValue: 200,
    skillsTrainedCount: 3,
    attachedFiles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
}
```

**Location:**
- Would live in `app/__tests__/fixtures/` or `app/__tests__/factories/`
- Organized by entity: `userFactory.ts`, `reportFactory.ts`, `regionFactory.ts`
- Reusable across all test suites

## Coverage

**Requirements:**
- Not configured - No coverage thresholds enforced
- Coverage not tracked or reported

**View Coverage (when implemented):**
```bash
npm run test:coverage    # Would generate coverage reports
# Coverage output: coverage/
# Open: coverage/index.html
```

**Recommended Coverage Targets:**
- Database modules (CRUD functions): 80%+
- Business logic (statistics, calculations): 85%+
- Components (UI): 60-70%
- Route loaders/actions: 75%+
- Utility functions: 90%+

## Test Types

**Unit Tests:**
- **Scope:** Individual functions (database CRUD, calculations, transformations)
- **Approach:** Test function inputs and outputs in isolation
- **Files:** `app/db/user/user.test.ts`, `app/lib/statistics.test.ts`
- **What to test:**
  - User creation with validation
  - Database queries return correct data
  - Error handling and StatusResponse format
  - Data transformations (e.g., `transformUser()`)

**Example test structure for `createUser()`:**
```typescript
describe('createUser', () => {
  it('should create a user with valid data', async () => {
    const result = await createUser({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    expect(result.status).toBe('success');
  });

  it('should reject duplicate email', async () => {
    // Create first user
    // Attempt to create second with same email
    // Expect: status 'error', message about duplicate
  });

  it('should hash password before storing', async () => {
    // Create user
    // Verify password is not plain text in database
    // Verify bcrypt.compare works with stored hash
  });
});
```

**Integration Tests:**
- **Scope:** Multiple components working together (loaders + database, actions + email)
- **Approach:** Test realistic user workflows
- **Files:** `app/routes/__tests__/`, `app/lib/__tests__/`
- **What to test:**
  - Complete user registration flow (form submission → database → email)
  - Permission checks before database operations
  - Error recovery and rollback
  - Transaction boundaries

**Example test structure for user registration flow:**
```typescript
describe('User registration flow', () => {
  it('should register user and send welcome email', async () => {
    const mockMailer = vi.fn().mockResolvedValue({ id: 'email-id' });

    const result = await createUser(
      { name: 'New User', email: 'new@example.com', ... },
      dbUrl,
      { resendApi: 'api-key', mainEmail: 'sender@example.com' }
    );

    expect(result.status).toBe('success');
    expect(mockMailer).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'new@example.com' })
    );
  });
});
```

**E2E Tests:**
- **Status:** Not implemented
- **Framework:** Not configured
- **Recommendation:** Would use Playwright or similar for end-to-end testing if added
- **Scope:** Full user journeys (login → dashboard → create report → view certificate)

## Common Patterns

**Async Testing:**

Using Promises with StatusResponse:
```typescript
it('should handle async database call', async () => {
  const result = await new Promise<StatusResponse<QUser[]>>((resolve, reject) => {
    db.user.findMany()
      .then((users) => {
        resolve({ status: 'success', data: users });
      })
      .catch((error) => {
        reject({ status: 'error', message: 'Failed' });
      });
  });

  expect(result.status).toBe('success');
  expect(result.data).toBeInstanceOf(Array);
});
```

Testing Remix loaders:
```typescript
it('should load user data in route', async () => {
  const mockContext = {
    cloudflare: { env: { DATABASE_URL: 'mock-url' } }
  };

  const data = await loader({
    request: new Request('http://localhost/'),
    context: mockContext,
    params: { id: 'user-123' }
  });

  expect(data).toHaveProperty('user');
});
```

**Error Testing:**

StatusResponse error handling:
```typescript
it('should return error status when user not found', async () => {
  const result = await new Promise<StatusResponse<QUser>>((resolve, reject) => {
    db.user.findUnique({ where: { id: 'nonexistent' } })
      .then((user) => {
        if (!user) {
          reject({ status: 'error', message: 'لم يتم العثور على المستخدم' });
        }
      })
      .catch((error) => reject({ status: 'error' }));
  }).catch(e => e);

  expect(result.status).toBe('error');
});
```

Testing Prisma-specific errors:
```typescript
it('should handle foreign key constraint errors', async () => {
  const error = new Error('Foreign key constraint');
  (error as any).code = 'P2003';

  expect(() => {
    if ((error as any).code === 'P2003') {
      throw new Error('Cannot delete user with related records');
    }
  }).toThrow();
});
```

Testing permission checks:
```typescript
it('should reject unauthorized access', async () => {
  const user = createTestUser({ role: 'user' });
  const canAccess = canViewElement(user, 'admin-panel');

  expect(canAccess).toBe(false);
});
```

## Missing Test Infrastructure

**Critical Gaps:**
1. **No test framework** - Must install vitest or jest
2. **No test configuration** - Need vitest.config.ts or jest.config.js
3. **No test utilities** - No helper functions for mocking, fixtures, or test setup
4. **No test data factories** - No builders for creating test users, reports, etc.
5. **No CI/CD testing** - No test step in deployment pipeline

## Recommended Testing Implementation Plan

**Phase 1: Setup (Foundation)**
- Install vitest as test runner
- Install @vitest/ui for test interface
- Create vitest.config.ts with Remix and Prisma support
- Setup test environment file for environment variables

**Phase 2: Database Testing**
- Create test factories in `app/__tests__/factories/`
- Test all CRUD operations in `app/db/*/*.test.ts`
- Mock Prisma client with consistent error patterns
- Aim for 80%+ coverage on database layer

**Phase 3: API & Route Testing**
- Test Remix loaders and actions in `app/routes/__tests__/`
- Mock context, request, and database
- Test authorization and permission checks
- Aim for 75%+ coverage

**Phase 4: Component Testing**
- Setup React Testing Library
- Test critical components: Icon, Input, Error Boundary
- Test form interactions and submission
- Aim for 60%+ coverage

---

*Testing analysis: 2026-01-27*
