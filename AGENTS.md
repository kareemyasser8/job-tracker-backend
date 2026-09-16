# Job Tracker Backend — Agent Guide

## Quick Commands

| Task | Command |
|------|---------|
| Install deps | `pnpm install` |
| Build | `pnpm build` |
| Dev server (watch) | `pnpm start:dev` |
| Production | `pnpm start:prod` |
| Lint | `pnpm lint` |
| Format | `pnpm format` |
| Unit tests | `pnpm test` |
| E2E tests | `pnpm test:e2e` |
| Test coverage | `pnpm test:cov` |
| Prisma generate | `pnpm prisma:generate` |
| Prisma migrate (dev) | `pnpm prisma:migrate` |
| Prisma studio | `pnpm prisma:studio` |

## Stack

- **Framework**: NestJS 12, `"type": "module"`, TypeScript `nodenext`
- **Package manager**: pnpm
- **ORM**: Prisma 7 + `@prisma/adapter-pg` (PostgreSQL)
- **API docs**: `@nestjs/swagger` at `/api-docs`
- **Tests**: Vitest (`vitest.config.ts` uses `vite-tsconfig-paths`)
- **Lint/format**: oxlint + Prettier (single quotes, trailing commas)
- **Observability**: `@nestjs/observe` (disabled unless configured)

## Project Structure

```
src/
  main.ts                 # bootstrap, ValidationPipe(whitelist), PrismaExceptionFilter, Swagger
  app.module.ts           # registers feature modules + PrismaModule (global)
  common/
    dto/                  # PaginationQueryDto, PaginatedResponseDto
    entities/             # Swagger response classes (User, Company) — not Prisma models
    filters/              # PrismaExceptionFilter (global)
  prisma/
    prisma.module.ts      # @Global PrismaModule
    prisma.service.ts     # PrismaClient + PrismaPg adapter (DATABASE_URL required)
    migrations/
      schema.prisma       # ← source of truth for DB schema
  modules/
    <resource>/           # singular kebab-case (user, company, application...)
      <resource>.module.ts
      <resource>.controller.ts
      <resource>.service.ts
      <resource>.controller.spec.ts
      <resource>.service.spec.ts
      dto/
        create-<resource>.dto.ts
        update-<resource>.dto.ts
```

**Prisma Client** is generated to `src/generated/prisma` (gitignored). Import via relative path:
```ts
import { PrismaService } from '../../prisma/prisma.service.js';
import { PrismaClient } from '../generated/prisma/client.js';
```

## Conventions

### Naming

| Kind | Convention | Example |
|------|------------|---------|
| Feature folder | singular kebab-case | `user`, `company`, `application` |
| Class files | `<name>.<role>.ts` | `user.controller.ts` |
| Classes | PascalCase + role suffix | `UserController`, `UserService` |
| HTTP path | plural kebab-case | `@Controller('users')` |
| `@ApiTags` | plural English | `'Users'`, `'Companies'` |
| DTO classes | `CreateXDto` / `UpdateXDto` | `CreateUserDto` |
| Entity classes | domain noun (Swagger) | `User`, `Company` |
| DB IDs | UUID strings | never `+id` / `number` |
| Env vars | `DATABASE_URL`, `PORT` (default 3000) | |

### ESM Imports
Every local TS import **must** include `.js` extension:
```ts
import { UserService } from './user.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
```

### Controller Methods (finished modules)
Use `getUsers`, `getUser`, `createUser`, `updateUser` — not Nest CLI defaults (`findAll`, `create`).

### Service Patterns
- Map DTO `password` → Prisma `passwordHash`
- Never return `passwordHash` in list/get responses
- Use `PaginationQueryDto` + `PaginatedResponseDto` for lists

### Shared Building Blocks
- `PrismaModule` is `@Global` — inject `PrismaService` directly, don't re-import
- Prisma unique/not-found errors handled globally by `PrismaExceptionFilter`

## Database

- PostgreSQL with UUID primary keys (`@default(uuid()) @db.Uuid`)
- Schema: `src/prisma/migrations/schema.prisma`
- Connection: `DATABASE_URL` in `.env` (required at startup)
- Prisma adapter: `@prisma/adapter-pg` via `PrismaPg`

## Bootstrap (`src/main.ts`)

- Global `ValidationPipe({ whitelist: true })`
- Global `PrismaExceptionFilter`
- Swagger: title **Job Tracker API**, path **`/api-docs`**
- No global prefix
- NestJS Observe instrumented (configure with `ObserveModule.forRoot(...)` if needed)

## Testing

- Unit: `pnpm test` (Vitest, `**/*.spec.ts`)
- E2E: `pnpm test:e2e` (separate config `vitest.config.e2e.ts`)
- Coverage: `pnpm test:cov` (`@vitest/coverage-v8`)

## Lint/Format

- `oxlint` with `@typescript-eslint/no-explicit-any: off`, `@typescript-eslint/no-floating-promises: warn`
- Prettier: single quotes, trailing commas (run via `pnpm format`)

## TypeScript

- `strict: true` (except `strictPropertyInitialization: false`)
- Build config: `tsconfig.build.json` extends `tsconfig.json`, `rootDir: ./src`, excludes specs
- No default exports for Nest classes

## Environment

Create `.env` with:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3000
```

## Gotchas

- Prisma Client generator outputs `moduleFormat = "cjs"` but project is ESM — imports from generated client work via `.js` extension
- `prisma:generate` must run after schema changes before build/test
- `src/generated/prisma` is gitignored; CI must run `prisma:generate`
- Company module is a Nest CLI stub (placeholder returns, numeric `+id`) — **copy User module pattern for new features**