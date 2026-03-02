# Next.js Self-Hosted

A self-hosted Next.js application with a single source of truth for all layers — database, GraphQL API, and React front-end — built on top of the [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

## Key idea: one type, all layers

Every entity in [`app/db/entities/`](app/db/entities/) is decorated for both **TypeORM** (database) and **TypeGraphQL** (API), and the same TypeScript class is imported directly in React components and server actions.

```
app/db/entities/User.ts
        │
        ├─ @Entity()          ──▶  PostgreSQL table  (TypeORM)
        ├─ @ObjectType()      ──▶  GraphQL type       (TypeGraphQL → Apollo)
        └─ import { User }    ──▶  React components & server libs
```

No separate DTO, schema file, or generated code — add a field once and it propagates everywhere.

### Entity example

```ts
// app/db/entities/User.ts

@ObjectType('User')          // ← GraphQL type (name must be explicit, prod build mangles class names)
@Entity({ name: 'users' })   // ← PostgreSQL table
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ type: 'varchar' })
  login: string;

  @Field(() => UserRole)
  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;
}

@InputType('UsersFilter')    // ← GraphQL input for filtering
export class UsersFilter {
  @Field(() => String, { nullable: true }) id?: string;
  @Field(() => String, { nullable: true }) login?: string;
  @Field(() => UserRole, { nullable: true }) role?: UserRole;
}
```

> **Important:** `@ObjectType` and `@InputType` decorators **must always include an explicit string name** (e.g. `@ObjectType('User')`). Next.js production builds mangle class names, so TypeGraphQL's default of using `constructor.name` would produce broken schemas (`"r"` instead of `"User"`). The ESLint rule `local/require-typegraphql-explicit-name` enforces this.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| Database | PostgreSQL + TypeORM 0.3.27 |
| API | GraphQL — Apollo Server 5 + TypeGraphQL 2 |
| Client | Apollo Client 4 + `@apollo/client-integration-nextjs` |
| Auth | NextAuth 4 (GitHub, Google OAuth + credentials) |
| Runtime | Node.js 20, React 19 |
| CI/CD | GitHub Actions → SSH deploy |

## Project structure

```
├── app/
│   ├── api/
│   │   ├── auth/          NextAuth route handler
│   │   └── graphql/
│   │       ├── route.ts               Apollo handler (GET + POST)
│   │       ├── schema.ts              buildGqlSchema()
│   │       └── resolvers/
│   │           ├── ...                API crud handlers
│   ├── db/
│   │   ├── entities/      Single source of truth (TypeORM + TypeGraphQL)
│   │   │   ├── ...        Entities models
│   │   ├── migrations/    Plain JS migrations (no ts-node in prod)
│   │   ├── db.ts          TypeORM DataSource
│   │   └── runMigrations.js
│   ├── libs/              Server-side data fetchers (use Apollo client)
│   ├── providers.tsx      Apollo + Auth providers
│   ├── layout.tsx
│   └── ...                All pages folders
├── components/            Shared React components
├── server/
│   ├── apollo.ts          ApolloServer singleton
│   └── context.ts         GraphQL request context (userId from session)
├── utils/
├── docker/
│   ├── development/       compose.yaml (app + postgres)
│   └── production/        Dockerfile (multi-stage) + compose.yaml
├── eslint-rules/          Local ESLint rules
│   └── require-typegraphql-explicit-name.mjs
└── .github/workflows/
    └── deploy.yml         checks (lint + type-check) → deploy
```

## Development

### Prerequisites

- Docker + Docker Compose
- Node.js 20+

### Start

```bash
npm install
npm start          # docker compose up (app + postgres)
```

The app runs at **http://localhost:3000**.

### GraphQL Sandbox

In development mode Apollo Server exposes a **GraphQL Sandbox** at:

```
http://localhost:3000/api/graphql
```

Open it in a browser to explore the schema, run queries, and test mutations interactively.

### Type-check & lint

```bash
npm run type-check   # tsc --noEmit
npm run lint         # eslint .
```

## Database migrations

Migrations live in [`app/db/migrations/`](app/db/migrations/) as plain `.js` files (no `ts-node` needed in production).

```bash
npm run migration:run
```

## Production deployment

The CI/CD pipeline (GitHub Actions) does:

1. **`checks` job** (runs on every push to `main` or `staging`):
   - `npm run type-check`
   - `npm run lint`
2. **`deploy` job** (only on `main`, only if `checks` passes):
   - Builds a Docker image (multi-stage: deps → migrate-deps → builder → runner)
   - Copies the image to the server via SCP
   - SSH: loads image, starts DB, runs migrations, starts app

### Manual first server setup

```bash
ssh root@your_server_ip
curl -o ~/deploy.sh https://raw.githubusercontent.com/4-life/hello-world/main/deploy.sh
chmod +x ~/deploy.sh
./deploy.sh
```

### Required secrets / vars

| Name | Kind |
|---|---|
| `SSH_HOST`, `SSH_USER`, `SSH_PORT` | Variables / Secrets |
| `SSH_PRIVATE_KEY` | Secret |
| `POSTGRES_USER`, `POSTGRES_DB` | Variables |
| `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET` | Secrets |
| `CLIENT_ID_GITHUB`, `CLIENT_SECRET_GITHUB` | Secrets |
| `CLIENT_ID_GOOGLE`, `CLIENT_SECRET_GOOGLE` | Secrets |
