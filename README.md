# Next.js Self-Hosted

[![Checks](https://github.com/4-life/hello-world/actions/workflows/deploy.yml/badge.svg?event=push)](https://github.com/4-life/hello-world/actions/workflows/deploy.yml)
[![E2E](https://github.com/4-life/hello-world/actions/workflows/e2e.yml/badge.svg?event=push)](https://github.com/4-life/hello-world/actions/workflows/e2e.yml)

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

@ObjectType('User')          // ← GraphQL type (TypeGraphQL → Apollo)
@Entity({ name: 'users' })   // ← PostgreSQL table (TypeORM)
export class User {          // ← React components & server libs
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
│   ├── staging/           Dockerfile (multi-stage) + compose.yaml
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

1. **`checks` job** (runs on every push to `main` or `stage`):
   - `npm run type-check`
   - `npm run lint`
2. **`deploy` job** (only on `main`, only if `checks` passes):
   - Builds and pushes two Docker images to `ghcr.io`:
     - `:latest` — the app (`runner` stage)
     - `:migrate` — the migration runner (`migrator` stage)
   - Writes a `.env` file from GitHub Secrets/Variables and copies it with `docker/production/compose.yaml` to `/tmp/deploy` on the server
   - SSH:
     - Pulls both images from `ghcr.io` using `GHCR_TOKEN`
     - Starts the database and waits for it to be healthy
     - Runs migrations in an ephemeral `--rm` container
     - Starts the application
     - Prunes old images and removes `/tmp/deploy`

### Manual first server setup

```bash
ssh root@your_server_ip
curl -o ~/deploy.sh https://raw.githubusercontent.com/4-life/hello-world/main/deploy.sh
chmod +x ~/deploy.sh && SSH_USER=myuser SSH_PORT=22 ./deploy.sh
```

`SSH_USER` is the name of the deploy system user the script creates (default: `myuser`). `SSH_PORT` is the SSH port (default: `22`). Set them to match your `SSH_USER` and `SSH_PORT` secrets in GitHub Actions.

### Required secrets / vars

| Name | Kind |
|---|---|
| `SSH_HOST`, `SSH_USER`, `SSH_PORT` | Variables / Secrets |
| `SSH_PRIVATE_KEY` | Secret |
| `GHCR_TOKEN` | Secret |
| `POSTGRES_USER`, `POSTGRES_DB` | Variables |
| `POSTGRES_PASSWORD`, `NEXTAUTH_SECRET` | Secrets |
| `CLIENT_ID_GITHUB`, `CLIENT_SECRET_GITHUB` | Secrets |
| `CLIENT_ID_GOOGLE`, `CLIENT_SECRET_GOOGLE` | Secrets |

#### Creating `GHCR_TOKEN`

The server needs this token to pull the Docker image from `ghcr.io`.

1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**
2. Generate a new token with the `read:packages` scope
3. Add it to the repository: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `GHCR_TOKEN`
   - Value: the token you just created

## Environments

### Overview

| Environment | Branch | Docker files | GitHub environment |
|---|---|---|---|
| Development | — (local) | `docker/development/` | — |
| Staging | `stage` | `docker/staging/` | `staging` |
| Production | `main` | `docker/production/` | `production` |

Each environment runs on its own server. SSH credentials (`SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`, `SSH_PORT`) are stored per GitHub environment, so pushing to a branch only ever touches that environment's server.

### Adding a new environment

**1. Docker files** — create `docker/<env>/Dockerfile` and `docker/<env>/compose.yaml` modelled on the staging equivalents.

**2. GitHub environment** — go to **Settings → Environments → New environment**, name it `<env>`, and add the same secrets and variables as `staging` (see [Required secrets / vars](#required-secrets--vars)) pointing to the new server.

**3. Workflow job** — add the trigger branch and a new job to `.github/workflows/deploy.yml`, following `deploy-staging` as the template:

```yaml
# add the branch to the trigger
on:
  push:
    branches:
      - main
      - stage
      - <branch>

# add the job
deploy-<env>:
  if: github.ref == 'refs/heads/<branch>'
  needs: checks
  environment: <env>
  ...
```

The `environment: <env>` binding is what scopes the job to that environment's secrets, ensuring the deploy hits the correct server.

## File storage (S3)

Files are stored in AWS S3. The bucket is fully private — no object is ever publicly accessible. All reads and writes go through short-lived **presigned URLs** signed by the server.

<details>
<summary>Upload flow, security measures, bucket setup, and environment variables</summary>

### Upload flow

```
1. Client  →  GraphQL mutation requestUploadUrl(contentType, ...)
            ←  { uploadUrl (presigned PUT, 5 min), key }

2. Client  →  PUT file directly to S3          (no server proxy)

3. Client  →  GraphQL mutation confirmUpload(key, ...)
              Server: fetches first bytes from S3, validates content
              Server: deletes old file if one exists
              Server: saves key to DB
            ←  Entity with file field (presigned GET URL, 1 h TTL)
```

File fields on GraphQL types are `@FieldResolver` — they always return a fresh presigned GET URL, never the raw S3 key.

### Security measures

| Layer | What it does |
|---|---|
| Private bucket + Block Public Access ON | No anonymous reads or writes ever |
| Content-type allowlist | Server rejects disallowed MIME types before issuing an upload URL |
| `ContentType` locked in presigned PUT | S3 rejects the upload if the browser sends a mismatched `Content-Type` header |
| Key scoped to owner path | Users can only confirm keys that belong to their own prefix |
| Magic bytes check | Files whose content doesn't match the declared type are rejected and deleted from S3 |
| `ResponseContentType` in presigned GET | Browser always receives the correct MIME type regardless of what was stored |
| Old file deleted on replace | Orphaned objects are cleaned up immediately |

### Bucket setup

1. Create an S3 bucket in your AWS region.
2. Under **Permissions**, enable **Block all public access**.
3. Create an IAM user with the policy below (least-privilege — scoped to the prefix used by the feature):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

4. Set the bucket **CORS policy** to allow direct PUT uploads from the browser:

```json
[
  {
    "AllowedHeaders": ["Content-Type"],
    "AllowedMethods": ["PUT"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-production-domain.com",
      "https://your-staging-domain.com"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### Environment variables

Add to your `.env` (development) and to each GitHub environment (staging / production):

| Name | Kind | Description |
|---|---|---|
| `AWS_REGION` | Variable | e.g. `eu-north-1` |
| `S3_BUCKET_NAME` | Variable | The bucket name |
| `AWS_ACCESS_KEY_ID` | Secret | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | Secret | IAM user secret key |

`S3_BUCKET_NAME` and `AWS_REGION` are also required as **build arguments** — `next.config.ts` reads them at build time to whitelist the bucket hostname for `next/image` optimization. Both Dockerfiles and the CI workflow are already wired to pass them.

</details>

## Security

### Secrets management

- **No secrets in the Docker image.** The production `Dockerfile` contains no credentials. All environment variables are injected at runtime by the CI/CD pipeline and passed to containers via `env_file`.
- **No secrets in the repository.** `.env` files are git-ignored. GitHub Actions secrets/variables are the single source of truth — the pipeline writes a `.env` file on the server at deploy time and never commits it.
- **No secrets in build arguments.** `--build-arg` is not used for sensitive values. Only the image artifact is shipped; credentials are absent from all image layers and `docker inspect` output.

### Container security

- The production container runs as a **non-root user** (`nextjs`, uid 1001). An attacker who achieves RCE inside the container gets a restricted user with no write access outside the app directory.
- The **migration runner is a separate image** (`app-migrate`). It runs ephemerally (`--rm`) before the app starts and has no access to the running application.

### Server security

- `deploy.sh` creates a dedicated **`deploy` user** (no root, docker group only) for CI/CD SSH access. The root account is not used by the pipeline.
- SSH access uses **ed25519 key authentication** only. The private key lives exclusively in GitHub Secrets and is never written to disk beyond the server's `authorized_keys`.
- **UFW** is enabled with only ports 22, 80, and 443 open.
- **Nginx** sits in front of Next.js and handles SSL termination, HTTP→HTTPS redirect, and rate limiting (10 req/s, burst 20).
- SSL certificates are issued by **Let's Encrypt** and auto-renewed every 12 hours via cron.

### Access control

Protected pages and API endpoints use two complementary layers:

- **Page-level** — server-side layouts call `getServerSession` (NextAuth). The `/users` route group's [`layout.tsx`](app/users/layout.tsx) redirects unauthenticated requests to `/` before any page content renders.
- **GraphQL-level** — resolvers that require authentication are decorated with `@Authorized()` (TypeGraphQL). The `authChecker` in [`app/api/graphql/schema.ts`](app/api/graphql/schema.ts) reads `context.userId`, which is populated from the NextAuth session by [`server/context.ts`](server/context.ts). A `null` userId rejects the request. Role-based access (`@Authorized('admin')`) is also supported.

### Web hardening (before going live)

This template does not ship with web-layer hardening enabled out of the box. Apply the following before exposing the app to real users:

- **Content Security Policy (CSP)** — add a `Content-Security-Policy` header (or `<meta>` tag) restricting `script-src`, `style-src`, `img-src`, `connect-src`, etc. to known origins. In Next.js, set it in [`next.config.ts`](next.config.ts) via `headers()` or in the Nginx config.
- **XSS protection** — React escapes output by default, but review any `dangerouslySetInnerHTML` usage and sanitize any HTML coming from external sources (e.g. with [DOMPurify](https://github.com/cure53/DOMPurify)).
- **CSRF protection** — GraphQL mutations over POST are not automatically CSRF-safe. Use `SameSite=Lax` (or `Strict`) on session cookies, or add a CSRF token layer (e.g. `csrf` npm package) to the GraphQL route handler.
- **Security headers** — add `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy` in Nginx or `next.config.ts`.
- **Rate limiting** — Nginx rate-limits HTTP at 10 req/s. Consider adding resolver-level rate limiting for expensive GraphQL operations (e.g. auth mutations) using a library such as [graphql-rate-limit](https://github.com/teamplanes/graphql-rate-limit).
- **Dependency audits** — run `npm audit` in CI and keep `npm audit --audit-level=high` clean before every release.
- **Structured logging** — the app currently has no production logger. Before going live, add structured logs (e.g. [pino](https://github.com/pinojs/pino)) with a `requestId` per GraphQL operation so errors and slow queries can be traced end-to-end. Key events to cover: every operation name + duration + `userId`, failed auth attempts, and mutations that touch other users' data.

### What to audit when adding a feature

- New environment variables → add to GitHub Secrets/Variables, not to the Dockerfile or source code
- New endpoints → check that `@Authorized()` is applied where needed in resolvers
- New file uploads or external calls → validate at the boundary, not inside business logic
