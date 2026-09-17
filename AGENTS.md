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

- **Framework**: NestJS 12, `"type": "module"`, TypeScript `nodenext` (`module: nodenext`, `target: ES2023`)
- **Package manager**: pnpm (do not use npm/yarn)
- **ORM**: Prisma 7 + `@prisma/adapter-pg` (`PrismaPg`) on PostgreSQL
- **API docs**: `@nestjs/swagger` at `/api-docs` (title **Job Tracker API**)
- **Tests**: Vitest (`vitest.config.ts` uses `vite-tsconfig-paths`, `globals: true`; e2e uses `vitest.config.e2e.ts`)
- **Lint/format**: oxlint (`oxlint.json`) + Prettier (single quotes, trailing commas)
- **Observability**: `@nestjs/observe` via `createObserveModule()` in `app.module.ts` (disabled unless configured)
- **Validation**: `class-validator` + `class-transformer`, global `ValidationPipe({ whitelist: true })`

## Project Structure

```
.
├── opencode.json                 # opencode project config (instructions)
├── AGENTS.md                     # this file — loaded via opencode.json instructions
├── prisma/
│   ├── schema.prisma             # ← source of truth for DB schema (prisma.config.ts declares src/prisma/schema.prisma but file lives here)
│   └── migrations/               # SQL migrations (migration_lock.toml)
├── prisma.config.ts              # defineConfig({ schema: 'src/prisma/schema.prisma', migrations.path: 'src/prisma/migrations' })
├── src/
│   ├── main.ts                   # bootstrap, ValidationPipe, PrismaExceptionFilter, Swagger
│   ├── app.module.ts             # registers PrismaModule (global) + feature modules
│   ├── generated/prisma/         # Prisma Client output (gitignored, moduleFormat = "cjs")
│   ├── common/
│   │   ├── dto/
│   │   │   ├── pagination-query.dto.ts   # PaginationQueryDto { page=1, limit=10 }
│   │   │   └── paginated-response.dto.ts # PaginatedResponse(Entity) factory
│   │   ├── entities/             # Swagger response classes — NOT Prisma models
│   │   │   ├── user.entity.ts
│   │   │   ├── company.entity.ts
│   │   │   ├── source.entity.ts
│   │   │   └── preference.entity.ts
│   │   └── filters/
│   │       └── prisma-exception.filter.ts # global: P2002→409, P2025→404, P2003→409
│   ├── prisma/
│   │   ├── prisma.module.ts      # @Global() PrismaModule
│   │   └── prisma.service.ts     # PrismaClient + PrismaPg adapter (DATABASE_URL required)
│   └── modules/
│       ├── user/                 # ✅ finished pattern — copy this
│       ├── source/               # ✅ finished pattern (mirrors user)
│       ├── company/              # ⚠️ Nest CLI stub (placeholder returns, +id) — do not copy
│       └── preference/           # special: upsert by userId, not standard CRUD
│           <resource>/           # singular kebab-case
│             <resource>.module.ts
│             <resource>.controller.ts
│             <resource>.service.ts
│             <resource>.controller.spec.ts
│             <resource>.service.spec.ts
│             dto/
│               create-<resource>.dto.ts
│               update-<resource>.dto.ts
```

**Prisma Client** is generated to `src/generated/prisma` (gitignored). Import via relative path with `.js`:
```ts
import { PrismaService } from '../../prisma/prisma.service.js';
import { Prisma } from '../../generated/prisma/client.js';
```

## Conventions

### Naming

| Kind | Convention | Example |
|------|------------|---------|
| Feature folder | singular kebab-case | `user`, `company`, `source`, `application` |
| Class files | `<name>.<role>.ts` | `user.controller.ts`, `source.service.ts` |
| Classes | PascalCase + role suffix | `UserController`, `SourceService`, `UserModule` |
| HTTP path | plural kebab-case | `@Controller('users')`, `@Controller('sources')` |
| `@ApiTags` | plural English | `'Users'`, `'Sources'`, `'Companies'` |
| DTO classes | `CreateXDto` / `UpdateXDto` | `CreateUserDto`, `CreateSourceDto` |
| Entity classes | domain noun (Swagger-only) | `User`, `Source`, `Company` |
| Prisma models | PascalCase in `schema.prisma` | `User`, `ApplicationNote` |
| Service methods | `createX`/`findAll`/`findOne`/`updateOne`/`deleteOne` | `createSource()`, `updateOne()` |
| Controller methods | `getXs`/`getX`/`createX`/`updateX`/`deleteX` | `getSources()`, `getSource()`, `createSource()` |
| DB IDs | UUID strings | never `+id` / `number` — use `string` + `NotFoundException` |
| Env vars | `DATABASE_URL`, `PORT` (default 3000) | |

> **Finished modules** (`user`, `source`) use `getUsers`/`getUser`/`createUser`/`updateUser` (and `getSources`/`getSource`/`createSource`/`updateSource`/`deleteSource`). Do **not** use Nest CLI defaults `findAll`/`findOne`/`create`/`update`/`remove` for new features. `company` is still a stub and must not be copied.

### ESM Imports
Every local TS import **must** include `.js` extension (project is `"type": "module"`, `nodenext`):
```ts
import { UserService } from './user.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
```

### Controller Pattern (finished modules: `user.controller.ts:1`, `source.controller.ts:1`)

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

### Service Pattern (finished modules: `user.service.ts:1`, `source.service.ts:1`)

- Inject `PrismaService` directly — `PrismaModule` is `@Global`, never re-import it in feature modules.
- **Pagination** (`findAll`): `const skip = (page-1)*limit`, `Promise.all([findMany({ skip, take: limit, orderBy:{createdAt:'desc'}, select:{...} }), count()])` → `{ total, data }`. Use `PaginationQueryDto` + `PaginatedResponseDto`.
- **Select**: always `select` explicit fields; never return `passwordHash`. Cast `as unknown as Promise<Entity>` when Prisma type mismatches Swagger entity.
- **Password**: DTO `password` → Prisma `passwordHash` (see `user.service.ts:19`).
- **findOne**: `findUnique({ where:{id}, select })` → throw `NotFoundException(`X with id ${id} not found`)` if null.
- **updateOne**: `prisma.x.update({ where:{id}, data:{ field: dto?.field }, select })` — optional chaining for partial DTOs.
- **deleteOne/remove**: `prisma.x.delete({ where:{id} })` → `Promise<void>`.
- **Transactions**: `user.service.ts:13` uses `$transaction` to create `user` + `preference` atomically.
- Errors `P2002` (unique), `P2025` (not found), `P2003` (FK) are handled globally by `PrismaExceptionFilter` — do not duplicate in services.

### DTOs & Entities

- `CreateXDto` has `@ApiProperty` + `class-validator` (`@IsString`, `@IsEmail`, `@MaxLength`, `@IsUUID`, `@IsOptional` etc). `UpdateXDto extends PartialType(CreateXDto)`.
- Entities in `src/common/entities/` are Swagger-only (`@ApiProperty` with examples), not Prisma models. Keep them in sync with `select` fields (e.g. `Source` has `id`, `ownerId: string|null`, `name`, `createdAt`, `updatedAt`).
- `company.entity.ts:1` and `source.entity.ts:1` show optional `ownerId` pattern.

### Shared Building Blocks
- `PrismaModule` is `@Global` — inject `PrismaService`, don't re-import.
- `PaginationQueryDto` (`page`, `limit` with defaults 1/10) and `PaginatedResponse(Entity)` factory are shared.
- Prisma unique/not-found/FK errors mapped globally by `PrismaExceptionFilter`.

## Database

- PostgreSQL with UUID primary keys (`@id @default(uuid()) @db.Uuid`)
- Schema: `prisma/schema.prisma` (generator outputs `moduleFormat = "cjs"` to `src/generated/prisma`)
- Connection: `DATABASE_URL` in `.env` (required at startup, validated in `prisma.service.ts:13`)
- Prisma adapter: `@prisma/adapter-pg` via `PrismaPg`
- Enums: `WorkMode (ONSITE/REMOTE/HYBRID)`, `Currency (USD/EUR/GBP/EGP/CAD/AUD/INR/JPY)`, `ApplicationStatus (WISHLIST/APPLIED/...)`
- Models: `User`, `Preference`, `Source`, `Company`, `Role`, `Technology`, `Application`, `ApplicationTechnology`, `ApplicationNote` — see `prisma/schema.prisma:44`

## Bootstrap (`src/main.ts:1`)

- Global `ValidationPipe({ whitelist: true })`
- Global `PrismaExceptionFilter` (`P2002→409`, `P2025→404`, `P2003→409`, default→500 with `Logger`)
- Swagger: `DocumentBuilder().setTitle('Job Tracker API')`, path `/api-docs`
- No global prefix (`app.setGlobalPrefix` not used)
- NestJS Observe instrumented via `ObserveInstrument` — configure with `ObserveModule.forRoot(...)` if needed (currently commented in `app.module.ts:17`)

## Testing

- Unit: `pnpm test` (Vitest, `vite-tsconfig-paths`, `globals: true`, `include: ['**/*.spec.ts']`)
- E2E: `pnpm test:e2e` (config `vitest.config.e2e.ts`)
- Coverage: `pnpm test:cov` (`@vitest/coverage-v8`)
- Spec pattern: mock `PrismaService` (`prisma.user.create/findMany/count/findUnique/update/delete` + `$transaction` for user), spy on service in controller specs — see `user.service.spec.ts:1` / `source.service.spec.ts:1` and `user.controller.spec.ts:1` / `source.controller.spec.ts:1`

## Lint/Format

- `oxlint` (`oxlint.json` with `@typescript-eslint/no-explicit-any: off`, `no-floating-promises: warn`)
- Prettier: single quotes, trailing commas (`pnpm format`)
- Run `pnpm lint` before committing

## TypeScript

- `strict: true` (except `strictPropertyInitialization: false`)
- `module: nodenext`, `moduleResolution: nodenext`, `target: ES2023`
- Build config: `tsconfig.build.json` extends `tsconfig.json`, `rootDir: ./src`, excludes `*.spec.ts`
- No default exports for Nest classes
- Use `vi` from `vitest` in specs

## Environment

Create `.env` with:
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
PORT=3000
```

`DATABASE_URL` is required — app throws at startup if missing.

## Gotchas

- Prisma Client generator outputs `moduleFormat = "cjs"` but project is ESM — imports from generated client still use `.js` extension and work via Node interop.
- `pnpm prisma:generate` must run after any `schema.prisma` change before `pnpm build`/`pnpm test` (output is gitignored at `src/generated/prisma`).
- `src/generated/prisma` is gitignored; CI must run `prisma:generate`.
- `prisma.config.ts` declares `src/prisma/schema.prisma` but actual schema lives at `prisma/schema.prisma` — both are checked by Prisma; prefer `prisma/schema.prisma`.
- `company` module is a Nest CLI stub (numeric `+id`, placeholder strings) — **copy `user`/`source` pattern for new features**, not `company`.
- `preference` is not standard CRUD — it uses `upsert` by `userId`.
- UUIDs are strings — never coerce with `+id`.
- `PrismaExceptionFilter` already handles `P2002`/`P2025`/`P2003` — don't add duplicate `try/catch` in services.

## opencode Integration

- Project config: `opencode.json` (`$schema: https://opencode.ai/config.json`, `instructions: ["AGENTS.md", ".opencode/skills/project-conventions/SKILL.md"]`)
- Skill: `.opencode/skills/project-conventions/SKILL.md` — load before writing/moving Nest/TS files; treats `user`/`source` as finished patterns.
- After editing `opencode.json`, agents, skills, or plugins, **quit and restart opencode** (config is loaded once at startup).
