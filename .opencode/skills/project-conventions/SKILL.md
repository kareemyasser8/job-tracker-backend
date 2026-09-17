---
name: project-conventions
description: Job Tracker NestJS backend layout, ESM imports, CRUD patterns, and naming conventions for NestJS/Prisma modules. Use when adding files, creating modules, implementing CRUD, or matching existing folder structure.
license: MIT
compatibility: opencode
metadata:
  project: job-tracker-backend
  audience: agents
---

# Project conventions

Load this skill before writing or moving Nest/TypeScript files in this repo. It is the canonical opencode instruction for architecture and naming — it mirrors `AGENTS.md` but is formatted for agent consumption.

Treat **`src/modules/user/`** and **`src/modules/source/`** as the finished patterns. **`src/modules/company/`** is still a Nest CLI stub (placeholder returns, numeric `+id`). **Do not copy `company` for new features.** `src/modules/preference/` is special (upsert by `userId`, not standard CRUD).

## Stack (do not change unless asked)

- NestJS 12, `"type": "module"`, TypeScript `nodenext` (`module: nodenext`, `moduleResolution: nodenext`, `target: ES2023`, `strict: true` except `strictPropertyInitialization: false`)
- Package manager: **pnpm** (never npm/yarn)
- ORM: Prisma 7 + `@prisma/adapter-pg` (`PrismaPg`) on PostgreSQL, UUID PKs (`@id @default(uuid()) @db.Uuid`)
- HTTP docs: `@nestjs/swagger` at `/api-docs`, title **Job Tracker API**
- Tests: Vitest (`vitest.config.ts` with `vite-tsconfig-paths`, `globals: true`; e2e via `vitest.config.e2e.ts`; coverage `@vitest/coverage-v8`)
- Lint/format: `oxlint` (oxlint.json) + Prettier (single quotes, trailing commas, `pnpm lint` / `pnpm format`)
- Validation: `class-validator` + `class-transformer`, global `ValidationPipe({ whitelist: true })`
- Observability: `@nestjs/observe` via `createObserveModule()` in `app.module.ts` (disabled unless configured)
- Every local TS import **must** use a `.js` extension (ESM emit):

```ts
import { UserService } from './user.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
```

## Folder map (exact)

```
.
├── opencode.json                 # { "$schema": "https://opencode.ai/config.json", "instructions": ["AGENTS.md", ".opencode/skills/project-conventions/SKILL.md"] }
├── AGENTS.md                     # full agent guide — also loaded via opencode.json instructions
├── prisma/
│   ├── schema.prisma             # ← source of truth (prisma.config.ts declares src/prisma/schema.prisma but file lives here)
│   └── migrations/               # SQL migrations
├── prisma.config.ts              # defineConfig({ schema: 'src/prisma/schema.prisma', migrations.path: 'src/prisma/migrations' })
├── src/
│   ├── main.ts                   # bootstrap: ValidationPipe, PrismaExceptionFilter, Swagger
│   ├── app.module.ts             # registers PrismaModule (global) + feature modules
│   ├── generated/prisma/         # Prisma Client output (gitignored, moduleFormat="cjs")
│   ├── common/
│   │   ├── dto/
│   │   │   ├── pagination-query.dto.ts    # PaginationQueryDto { page=1, limit=10 }
│   │   │   └── paginated-response.dto.ts  # PaginatedResponse(Entity) factory
│   │   ├── entities/             # Swagger response classes — NOT Prisma models
│   │   │   ├── user.entity.ts    # id, firstName, lastName, email, createdAt
│   │   │   ├── source.entity.ts  # id, ownerId:string|null, name, createdAt, updatedAt
│   │   │   ├── company.entity.ts # id, ownerId, name, normalizedName, domain, location, logoUrl, isVerified, createdAt, updatedAt
│   │   │   └── preference.entity.ts
│   │   └── filters/
│   │       └── prisma-exception.filter.ts # global: P2002→409, P2025→404, P2003→409
│   ├── prisma/
│   │   ├── prisma.module.ts      # @Global() PrismaModule
│   │   └── prisma.service.ts     # PrismaClient + PrismaPg adapter (DATABASE_URL required, validated at ctor)
│   └── modules/
│       ├── user/                 # ✅ finished — copy this
│       ├── source/               # ✅ finished — mirrors user
│       ├── company/              # ⚠️ stub — do not copy
│       └── preference/           # special: upsert by userId
│           <resource>/           # singular kebab-case folder
│             <resource>.module.ts
│             <resource>.controller.ts
│             <resource>.service.ts
│             <resource>.controller.spec.ts
│             <resource>.service.spec.ts
│             dto/
│               create-<resource>.dto.ts
│               update-<resource>.dto.ts
```

Prisma Client is generated to `src/generated/prisma` (gitignored). Import via relative path with `.js`:
```ts
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
```
Never re-import `PrismaModule` in a feature module — it is `@Global`; just inject `PrismaService`.

## Naming

| Kind | Convention | Example |
|------|------------|---------|
| Feature folder | singular kebab-case | `user`, `source`, `company`, `application` |
| Class files | `<name>.<role>.ts` | `user.controller.ts`, `source.service.ts` |
| Classes | PascalCase + role suffix | `UserController`, `SourceService`, `UserModule` |
| HTTP path | plural kebab-case | `@Controller('users')`, `@Controller('sources')` |
| `@ApiTags` | plural English | `'Users'`, `'Sources'`, `'Companies'` |
| DTO classes | `CreateXDto` / `UpdateXDto` (`UpdateXDto extends PartialType(CreateXDto)`) | `CreateSourceDto` |
| Entity classes | domain noun (Swagger-only, `@ApiProperty`) | `User`, `Source`, `Company` |
| Prisma models | PascalCase in `prisma/schema.prisma` | `User`, `ApplicationNote` |
| Service methods | `createX` / `findAll` / `findOne` / `updateOne` / `deleteOne` | `createSource()`, `updateOne()` |
| Controller methods | `getXs` / `getX` / `createX` / `updateX` / `deleteX` | `getSources()`, `getSource()`, `createSource()` |
| DB IDs | UUID strings | never `+id` / `number`; `string` + `NotFoundException` |
| Env vars | `DATABASE_URL`, `PORT` (default 3000) | |

Finished modules (`user`, `source`) use `getUsers`/`getUser`/`createUser`/`updateUser` etc. Do not use Nest CLI defaults `findAll`/`findOne`/`create`/`update`/`remove` for new features.

## Controller pattern (copy `user.controller.ts:1` / `source.controller.ts:1`)

```ts
@ApiTags('Sources')
@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sources' })
  @ApiResponse({ status: 200, description: 'Paginated list of sources', type: PaginatedResponse(Source) })
  getSources(@Query() paginationQuery: PaginationQueryDto) { return this.sourceService.findAll(paginationQuery); }

  @Get(':id')
  @ApiOperation({ summary: 'Get a source by id' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, type: Source }) @ApiResponse({ status: 404 })
  getSource(@Param('id') id: string) { return this.sourceService.findOne(id); }

  @Post()
  @ApiOperation({ summary: 'Create a new source' })
  @ApiResponse({ status: 201 })
  createSource(@Body() dto: CreateSourceDto) { return this.sourceService.createSource(dto); }

  @Put(':id') // PUT, not PATCH
  @ApiOperation({ summary: 'Update a source' })
  updateSource(@Param('id') id: string, @Body() dto: UpdateSourceDto) { return this.sourceService.updateOne(id, dto); }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a source' })
  async deleteSource(@Param('id') id: string): Promise<void> { return this.sourceService.deleteOne(id); }
}
```

- Use `PUT` not `PATCH`; document via `@ApiOperation`/`@ApiParam`/`@ApiResponse`/`@ApiTags`.
- `GET /` is paginated via `PaginationQueryDto`; `DELETE` returns `204` with `Promise<void>`.

## Service pattern (copy `user.service.ts:1` / `source.service.ts:1`)

- Inject `PrismaService` directly (`PrismaModule` is `@Global`).
- **Pagination** (`findAll`): `const skip = (page-1)*limit`; `Promise.all([prisma.x.findMany({ skip, take: limit, orderBy:{createdAt:'desc'}, select }), prisma.x.count()])` → `{ total, data }`.
- **Select**: always explicit `select`; never return `passwordHash`. Cast `as unknown as Promise<Entity>` when Swagger entity differs from Prisma type.
- **Password mapping**: DTO `password` → Prisma `passwordHash` (see `user.service.ts:19`).
- **findOne**: `findUnique({ where:{id}, select })` → `throw new NotFoundException('X with id ${id} not found')` if null.
- **updateOne**: `prisma.x.update({ where:{id}, data:{ field: dto?.field }, select })` with optional chaining.
- **deleteOne/remove**: `prisma.x.delete({ where:{id} })` → `Promise<void>`.
- **Transactions**: `user.service.ts:13` uses `$transaction` to create `user` + `preference` atomically.
- Do not duplicate error handling for `P2002`/`P2025`/`P2003` — `PrismaExceptionFilter` handles them globally.

## DTOs & Entities

- `CreateXDto`: `@ApiProperty` + `class-validator` (`@IsString`, `@IsEmail`, `@MaxLength(100)`, `@IsUUID`, `@IsOptional`, `@IsInt` etc). `UpdateXDto extends PartialType(CreateXDto)`.
- Entities in `src/common/entities/` are Swagger-only (`@ApiProperty` with examples), not Prisma models. Keep them in sync with `select` fields (e.g. `Source` has `id`, `ownerId: string|null`, `name`, `createdAt`, `updatedAt`; `Company` adds `normalizedName`, `domain`, `location`, `logoUrl`, `isVerified`).
- Optional `ownerId: string|null` pattern shown in `company.entity.ts:1` and `source.entity.ts:1`.

## Shared building blocks

- `PrismaModule` is `@Global` — inject `PrismaService`, don't re-import except in tests.
- `PaginationQueryDto` (`page`, `limit` default 1/10) and `PaginatedResponse(Entity)` factory are shared.
- `PrismaExceptionFilter` globally maps `P2002` (unique) → 409, `P2025` (not found) → 404, `P2003` (FK) → 409, default → 500 with `Logger`.

## Database

- PostgreSQL, UUID PKs (`@id @default(uuid()) @db.Uuid`)
- Schema: `prisma/schema.prisma` (generator `moduleFormat = "cjs"` to `src/generated/prisma`)
- Connection: `DATABASE_URL` in `.env` (required, validated in `prisma.service.ts:13`)
- Adapter: `@prisma/adapter-pg` via `PrismaPg`
- Enums: `WorkMode (ONSITE/REMOTE/HYBRID)`, `Currency (USD/EUR/GBP/EGP/CAD/AUD/INR/JPY)`, `ApplicationStatus (WISHLIST/APPLIED/PHONE_SCREEN/INTERVIEWING/OFFER/REJECTED/GHOSTED/ACCEPTED)`
- Models: `User`, `Preference`, `Source`, `Company`, `Role`, `Technology`, `Application`, `ApplicationTechnology`, `ApplicationNote` — see `prisma/schema.prisma:44`

## Bootstrap (`src/main.ts:1`, `src/app.module.ts:1`)

- Global `ValidationPipe({ whitelist: true })`
- Global `PrismaExceptionFilter` (`P2002→409`, `P2025→404`, `P2003→409`, default→500 with `Logger`)
- Swagger: `DocumentBuilder().setTitle('Job Tracker API')`, path `/api-docs`
- No global prefix (`app.setGlobalPrefix` not used)
- NestJS Observe via `ObserveInstrument` — enable with `ObserveModule.forRoot(...)` if needed (currently commented in `app.module.ts:17`)
- Feature modules registered in `app.module.ts`: `UserModule`, `SourceModule`, `CompanyModule`, `PreferenceModule` + `PrismaModule`

## Testing

- Unit: `pnpm test` (Vitest, `vite-tsconfig-paths`, `globals: true`, `include: ['**/*.spec.ts']`)
- E2E: `pnpm test:e2e` (`vitest.config.e2e.ts`)
- Coverage: `pnpm test:cov` (`@vitest/coverage-v8`)
- Spec pattern: mock `PrismaService` (`prisma.user.create/findMany/count/findUnique/update/delete` + `$transaction` for user); spy on service in controller specs — see `user.service.spec.ts:1`, `source.service.spec.ts:1`, `user.controller.spec.ts:1`, `source.controller.spec.ts:1`
- Use `vi` from `vitest`; `Test.createTestingModule` with `provide: PrismaService`.

## Style & TypeScript

- `strict: true` (except `strictPropertyInitialization: false`); `module: nodenext`, `moduleResolution: nodenext`, `target: ES2023`
- Build: `tsconfig.build.json` extends `tsconfig.json`, `rootDir: ./src`, excludes `*.spec.ts`
- No default exports for Nest classes; use `class-validator`/`class-transformer` decorators.
- Prettier: single quotes, trailing commas; `oxlint` (`no-explicit-any: off`, `no-floating-promises: warn`); run `pnpm lint` before committing.

## Environment

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3000
```
`DATABASE_URL` is required — app throws at startup if missing.

## Gotchas

- Prisma Client generator outputs `moduleFormat = "cjs"` but project is ESM — imports via `.js` still work via Node interop.
- `pnpm prisma:generate` must run after any `schema.prisma` change before `pnpm build`/`pnpm test` (output is gitignored at `src/generated/prisma`); CI must run `prisma:generate`.
- `prisma.config.ts` declares `src/prisma/schema.prisma` but actual schema lives at `prisma/schema.prisma` — both paths are checked by Prisma; prefer `prisma/schema.prisma`.
- `company` module is a Nest CLI stub — **copy `user`/`source` for new features**, not `company`. `preference` uses `upsert` by `userId`, not standard CRUD.
- UUIDs are strings — never coerce with `+id`.
- `PrismaExceptionFilter` already handles `P2002`/`P2025`/`P2003` — don't add duplicate `try/catch` in services.
- `src/generated/prisma` is gitignored; never commit it.

## opencode integration

- Project config: `opencode.json` (`$schema: https://opencode.ai/config.json`, `instructions: ["AGENTS.md", ".opencode/skills/project-conventions/SKILL.md"]`)
- After editing `opencode.json`, agents, skills, or plugins, **quit and restart opencode** (config is loaded once at startup).
