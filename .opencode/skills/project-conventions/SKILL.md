---
name: project-conventions
description: Job Tracker NestJS backend layout, ESM imports, file naming, and module conventions. Use when adding files, creating modules, renaming, or matching existing folder structure.
license: MIT
compatibility: opencode
metadata:
  project: job-tracker-backend
  audience: agents
---

# Project conventions

Load this skill before writing or moving Nest/TypeScript files in this repo.

Treat **`src/modules/user/`** as the finished pattern. **`src/modules/company/`** is still a Nest CLI stub (placeholder returns, numeric `+id`). Do not copy Company for new features.

## Stack (do not change unless asked)

- NestJS 12, `"type": "module"`, TypeScript `nodenext`
- Package manager: **pnpm**
- ORM: Prisma 7 + `@prisma/adapter-pg` (PostgreSQL)
- HTTP docs: `@nestjs/swagger` at `/api-docs`
- Tests: Vitest (`pnpm test`, `pnpm test:e2e`)
- Lint/format: `oxlint`, Prettier (single quotes, trailing commas)
- Every local TS import **must** use a `.js` extension (ESM emit)

```ts
import { UserService } from './user.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
```

## Folder map

```
src/
  main.ts                 # bootstrap, ValidationPipe, PrismaExceptionFilter, Swagger
  app.module.ts           # register feature modules here
  common/
    dto/                  # shared request/response DTOs (pagination)
    entities/             # Swagger response models (not Prisma classes)
    filters/              # global exception filters
  prisma/
    prisma.module.ts      # @Global PrismaModule
    prisma.service.ts     # PrismaClient + PrismaPg adapter
    migrations/
      schema.prisma       # schema lives here (see prisma.config.ts)
  modules/
    <resource>/           # one folder per domain, singular kebab-case
      <resource>.module.ts
      <resource>.controller.ts
      <resource>.service.ts
      <resource>.controller.spec.ts
      <resource>.service.spec.ts
      dto/
        create-<resource>.dto.ts
        update-<resource>.dto.ts
```

Prisma Client is generated to `src/generated/prisma` (gitignored). Import from `../generated/prisma/client.js` relative to the consuming file.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Feature folder | singular kebab-case | `user`, `company`, `application` |
| Class files | `<name>.<role>.ts` | `user.controller.ts` |
| Classes | PascalCase + role suffix | `UserController`, `UserService`, `UserModule` |
| HTTP path | plural kebab-case | `@Controller('users')` |
| `@ApiTags` | plural English | `'Users'`, `'Companies'` |
| DTO classes | `CreateXDto` / `UpdateXDto` | `CreateUserDto` |
| Entity classes | domain noun, Swagger-only | `User`, `Company` |
| Prisma models | PascalCase in schema | `User`, `ApplicationNote` |
| DB ids | UUID strings | never `+id` / `number` |
| Env | `DATABASE_URL`, `PORT` (default 3000) | |

Controller method names on finished modules: `getUsers`, `getUser`, `createUser`, `updateUser`. Prefer that over Nest CLI `create`/`findAll` when implementing a real module.

## Shared building blocks

- Lists: `PaginationQueryDto` + `PaginatedResponse(Entity)` from `src/common/dto/`
- Responses: `@ApiProperty` classes in `src/common/entities/`
- Prisma unique/not-found: already mapped globally by `PrismaExceptionFilter`
- `PrismaModule` is global — inject `PrismaService`, do not re-import unless testing

## Bootstrap rules (`src/main.ts`)

- Global `ValidationPipe({ whitelist: true })`
- Global `PrismaExceptionFilter`
- Swagger title **Job Tracker API**, path **`api-docs`**

Do not add a global prefix unless asked.

## Style

- `strict: true` (except `strictPropertyInitialization: false`)
- No default exports for Nest classes
- Do not return `passwordHash` from list/get user
- Map DTO `password` → Prisma `passwordHash` in the service

## Additional resources

- [folder-structure.md](folder-structure.md) — exact paths and what belongs where
- [naming.md](naming.md) — file, class, route, and Prisma naming
