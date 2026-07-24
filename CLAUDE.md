# hello-world — Next.js Self-Host Boilerplate

This repo is a **template/boilerplate**. New projects are created by copying this repo and
renaming `hello-world` (package.json `name`, GHCR image refs, README badges, repo URLs in
`deploy.sh`/workflows). When working in a project derived from this template, the same
architecture and conventions below apply unless the project's own CLAUDE.md overrides them.

## Core idea

One TypeScript class per entity, decorated for **TypeORM** (`@Entity`) and **TypeGraphQL**
(`@ObjectType`/`@Field`) at once. The same class is imported in resolvers, server libs, and
React components — no separate DTOs/generated types. Each entity's resolver lives in the same
folder as the entity, not in a separate `resolvers/` tree — a feature is one folder to open, not
two.

```
app/db/entities/user/User.entity.ts
  ├─ @Entity()        → Postgres table (TypeORM)
  ├─ @ObjectType()    → GraphQL type (TypeGraphQL → Apollo)
  └─ import { User }  → React components & server libs

app/db/entities/user/User.resolver.ts
  └─ @Resolver(User)  → queries/mutations/field resolvers for User
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
    schema.ts          buildGqlSchema() + authChecker, imports resolvers from db/entities/*
  db/
    entities/          Single source of truth (TypeORM + TypeGraphQL), one folder per feature
      user/            User.entity.ts + User.types.ts (UserRole) + User.inputs.ts +
                        User.response.ts + User.resolver.ts
      notification/    Notification.entity.ts + Notification.resolver.ts (no inputs yet)
      engineer/        Engineer.entity.ts + Engineer.inputs.ts + Engineer.response.ts +
                        Engineer.resolver.ts
      order/           Order.entity.ts + Order.types.ts (OrderType, OrderStatus) +
                        Order.inputs.ts + Order.response.ts + Order.resolver.ts
      client/          Client.entity.ts + Client.inputs.ts + Client.response.ts +
                        Client.resolver.ts
      invoice/         Invoice.entity.ts + Invoice.types.ts (PaymentStatus) + Invoice.inputs.ts +
                        Invoice.response.ts (PaginatedInvoicesResponse + InvoicePayment) +
                        Invoice.resolver.ts
      store/           Two entities behind one feature resolver: Part.entity.ts/.inputs.ts/
                        .response.ts + EngineerStock.entity.ts/.inputs.ts + Store.resolver.ts
      dashboard/       No entity — reporting only: Dashboard.response.ts (DashboardStats,
                        OrderStatusCount) + Dashboard.resolver.ts
      PaginatedResponse.ts   Generic PaginatedResponse<T>(ItemClass, typeName) factory
      PaginationInput.ts, SortOrder.ts, UserRole.ts   Shared cross-entity types
      index.ts         Barrel re-exports + TypeORM `entities` array
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
  `app/api/graphql/schema.ts` checks `context.userId`/`context.role`. Each resolver lives next
  to its entity, e.g. `app/db/entities/user/User.resolver.ts`, and is registered by hand in
  `app/api/graphql/schema.ts`.
- Entities: TypeORM columns + `class-validator` decorators + TypeGraphQL `@Field`s on the
  same property. Filters/inputs (`UsersFilter`, `CreateOrderInput`, `PaginationInput`, etc.)
  always live in `<Name>.inputs.ts`, never in the entity file itself — this holds from the first
  input type, not just once a file gets large (see `User.inputs.ts`, `Order.inputs.ts`) — and
  are re-exported from `app/db/entities/index.ts`.
- **`<Entity>.types.ts` files must stay import-free.** All of an entity's plain enums live
  together in one `<Entity>.types.ts` (e.g. `order/Order.types.ts` holds both `OrderType` and
  `OrderStatus`; `user/User.types.ts` holds `UserRole`; `invoice/Invoice.types.ts` holds
  `PaymentStatus`) — one file per entity, not one file per enum, and zero imports: no
  `type-graphql`, no `registerEnumType` in these files. Several of these enums are imported
  directly by `'use client'` components (e.g. `OrdersFilters.tsx`, `Filters.tsx`) for filter
  dropdowns; `type-graphql`'s package barrel pulls in a `node:fs`-dependent helper
  (`emitSchemaDefinitionFile.js`) regardless of which named export you use, so importing
  `type-graphql` anywhere in a file reachable from a client component breaks the Turbopack/
  webpack client build ("the chunking context does not support external modules (request:
  node:fs)"). `registerEnumType(...)` is instead called inline in the server-only `*.entity.ts`
  file, importing the enum from `./<Entity>.types` (`User.entity.ts` registers `UserRole`,
  `Order.entity.ts` registers `OrderType`+`OrderStatus`, `Invoice.entity.ts` registers
  `PaymentStatus`); `SortOrder` has no single owning entity, so it registers in
  `app/api/graphql/schema.ts` instead. When adding a new enum, follow this split — never put
  `registerEnumType` in `<Entity>.types.ts` itself unless you've confirmed nothing client-side
  ever imports that file as a runtime value (not just `import type`).
- Paginated list responses: use `PaginatedResponse(ItemClass, 'PaginatedXsResponse')` from
  `app/db/entities/PaginatedResponse.ts` rather than hand-writing a `{ items, total }` class —
  see `User.response.ts`. The type name must always be passed explicitly (same reason as the
  `@ObjectType`/`@InputType` rule below — never rely on a class's own `.name`).
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
- Add/remove entities as a folder under `app/db/entities/<name>/` (`<Name>.entity.ts` +
  `<Name>.resolver.ts`), keep the entity re-exported and added to the `entities` array in
  `app/db/entities/index.ts`, and register the resolver in `app/api/graphql/schema.ts`.
- New env vars go to GitHub Secrets/Variables for each environment, never hardcoded.
- New endpoints: confirm `@Authorized()` is applied where required.
