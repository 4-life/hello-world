# hello-world — Next.js Self-Host Boilerplate

This repo is a **template/boilerplate**. New projects are created by copying this repo and
renaming `hello-world` (package.json `name`, GHCR image refs, README badges, repo URLs in
`deploy.sh`/workflows). When working in a project derived from this template, the same
architecture and conventions below apply unless the project's own CLAUDE.md overrides them.

## Core idea

One TypeScript class per entity, decorated for **TypeORM** (`@Entity`) and **TypeGraphQL**
(`@ObjectType`/`@Field`) at once. The same class is imported in resolvers, server libs, and
React components — no separate DTOs/generated types.

```
app/db/entities/User.ts
  ├─ @Entity()        → Postgres table (TypeORM)
  ├─ @ObjectType()    → GraphQL type (TypeGraphQL → Apollo)
  └─ import { User }  → React components & server libs
```

**Critical rule**: `@ObjectType(...)` / `@InputType(...)` must always have an explicit string
name (e.g. `@ObjectType('User')`), never rely on `constructor.name` — Next.js prod builds
mangle class names. Enforced by the local ESLint rule
`local/require-typegraphql-explicit-name` (`eslint-rules/require-typegraphql-explicit-name.mjs`).

## Stack

- Next.js 16 (App Router, standalone output), React 19, Node 20
- PostgreSQL + TypeORM 0.3
- GraphQL: Apollo Server 5 + TypeGraphQL 2, exposed at `app/api/graphql/route.ts`
- Apollo Client 4 (`@apollo/client-integration-nextjs`) on the client + server
  (`server/getServerApolloClient.ts`)
- Auth: NextAuth 4 (GitHub, Google OAuth + credentials), session → `userId`/`role` via
  `server/context.ts`
- UI: Tailwind CSS 4 + shadcn/radix-ui components in `components/ui/`
- Redis (`ioredis`) for Apollo cache (`server/cache.ts`) and rate limiting
  (`server/rateLimiter.ts`, `rate-limiter-flexible`)
- S3 (`lib/s3.ts`) for file uploads via presigned URLs (private bucket only)
- Tests: Vitest (unit, `vitest.config.ts`) + Vitest e2e against real Postgres/Redis
  (`vitest.e2e.config.ts`, `tests/e2e/`)

## Project structure

```
app/
  api/auth/            NextAuth route handler
  api/graphql/
    route.ts           Apollo handler (GET + POST)
    schema.ts          buildGqlSchema() + authChecker
    resolvers/         One resolver per entity (UserResolver, VacationResolver, ...)
  db/
    entities/          Single source of truth (TypeORM + TypeGraphQL), index.ts re-exports all
    migrations/        Plain .js migrations (no ts-node in prod)
    db.ts              TypeORM DataSource
    runMigrations.js
  libs/                Server-side data fetchers using the Apollo client (cached with React `cache()`)
  providers.tsx         Apollo + NextAuth providers
  <route>/...          Page folders (layout.tsx guards auth via getServerSession)
components/            Shared React components
components/ui/         shadcn/radix primitives — don't hand-edit much, regenerate via shadcn CLI
server/
  apollo.ts            ApolloServer singleton
  context.ts           Builds GraphQL context (userId, role) from NextAuth session
  cache.ts, redis.ts   Apollo response cache / Redis client
  rateLimiter.ts        rate-limiter-flexible setups
  notifier.ts
lib/                   Misc server utils (s3.ts)
utils/                 Shared pure utils (buildQuery.ts, etc.)
eslint-rules/          Local ESLint rules
docker/{development,staging,production}/  Per-env Dockerfile + compose.yaml
.github/workflows/     checks → deploy (per env: staging on `stage`, prod on `main`)
tests/e2e/             End-to-end tests (real DB/Redis)
```

## Conventions / code style

- **ESLint + Prettier** (`eslint.config.mjs`): single quotes, semicolons, double quotes in JSX,
  `max-len` 300, no `console`, `eqeqeq`, no `==null`.
- TypeScript `strict: true`. `@typescript-eslint/explicit-function-return-type` is enforced —
  always annotate function return types (expressions/typed expressions exempted).
- `no-explicit-any` is enforced (rest args allowed).
- Boolean variables must be PascalCase with `is/should/has/can/did/will` prefix
  (`@typescript-eslint/naming-convention`).
- `useState` requires an explicit generic (`require-explicit-generics` rule).
- Path alias `@/*` → repo root (e.g. `@/app/db/entities`, `@/server/context`).
- Functional React components only, named via `function` declarations for named components,
  arrow functions for unnamed/inline ones (`react/function-component-definition`).
- GraphQL: queries/mutations defined with `gql` template literals colocated in `app/libs/*`,
  wrapped in React `cache()` for request-level memoization, `fetchPolicy: 'network-only'`.
- Resolvers: `@Authorized('role', ...)` for access control; `authChecker` in
  `app/api/graphql/schema.ts` checks `context.userId`/`context.role`.
- Entities: TypeORM columns + `class-validator` decorators + TypeGraphQL `@Field`s on the
  same property. Enums registered with `registerEnumType`. Filters/inputs (`UsersFilter`,
  `PaginationInput`, etc.) live alongside the entity and are re-exported from
  `app/db/entities/index.ts`.
- Migrations are plain `.js` (not `.ts`) so production doesn't need `ts-node`.

## Commands

- `npm run dev` — Next dev server
- `npm start` — `docker compose -f docker/development/compose.yaml up` (app + postgres)
- `npm run build` / `npm run start-prod` — production build / standalone server
- `npm run type-check` — `tsc --noEmit`
- `npm run lint` — ESLint over the whole repo
- `npm test` / `npm run test:watch` — unit tests (Vitest)
- `npm run test:e2e` — e2e tests against real Postgres + Redis (`vitest.e2e.config.ts`)
- `npm run migration:run` — run TypeORM migrations (`app/db/runMigrations.js`)

## Security notes (apply to derived projects too)

- No secrets in the Docker image or repo; CI writes `.env` from GitHub Secrets at deploy time.
- Production container runs as non-root `nextjs` (uid 1001); migrations run in a separate
  ephemeral `--rm` `app-migrate` image.
- S3 bucket is fully private — all access via short-lived presigned URLs, content-type +
  magic-byte validated server-side (`lib/s3.ts`).
- Auth: page-level via `getServerSession` in route-group layouts, API-level via
  `@Authorized()` resolvers + `authChecker`.
- This template ships **without** CSP/security headers/CSRF hardening — see README "Web
  hardening" section before going to production on a derived project.

## When adapting this template for a new project

- Rename `hello-world` everywhere: `package.json` name, `docker/*/compose.yaml` image names,
  GHCR refs in `.github/workflows/*.yml`, README badges/links, `deploy.sh` repo URL.
- Add/remove entities under `app/db/entities/`, keep them re-exported from
  `app/db/entities/index.ts`, add matching resolver under `app/api/graphql/resolvers/` and
  register it in `app/api/graphql/schema.ts`.
- New env vars go to GitHub Secrets/Variables for each environment, never hardcoded.
- New endpoints: confirm `@Authorized()` is applied where required.
