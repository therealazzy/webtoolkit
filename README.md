# WebToolkit

A backend API for developer utilities: JWT and JSON tools, plus a webhook-testing service where each user gets temporary inboxes for capturing and inspecting incoming HTTP requests.

![CI](https://github.com/therealazzy/webtoolkit/actions/workflows/ci.yml/badge.svg)

## Stack

| | |
|---|---|
| Runtime / language | Node.js 24, TypeScript (strict) |
| HTTP | Express 5 |
| Database | PostgreSQL (Supabase), Prisma ORM with migrations |
| Validation | Zod |
| Testing | Vitest, Supertest |
| CI | GitHub Actions: install, generate client, build, test |

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/jwt/inspect` | – | Decode a JWT's header, payload and expiry (no signature check) |
| POST | `/api/v1/jwt/verify` | – | Verify a JWT's signature |
| POST | `/api/v1/json/format` · `/minify` · `/diff` · `/validate` | – | JSON utilities |
| GET | `/api/v1/me` | API key | Return the authenticated owner |
| POST | `/api/v1/inboxes` | API key | Create a webhook inbox (expires after 24h) |
| GET | `/api/v1/inboxes` | API key | List your inboxes, newest first |
| GET | `/api/v1/inboxes/:inboxId` | API key | Get one inbox |
| DELETE | `/api/v1/inboxes/:inboxId` | API key | Delete an inbox and its captured requests |

Authenticated endpoints take an `X-API-Key` header. In progress: the public receiver `POST /hooks/:inboxId` and request inspection.

## Engineering decisions

- **Hashed API keys.** Keys are 32 random bytes; only a SHA-256 hash is stored, and the raw key is shown once. Lookup is a single indexed query on the unique hash.
- **Ownership is derived, never trusted.** The owner comes from the verified key (`req.ownerId`), not from the request. Every query filters by owner, and another user's inbox returns **404, not 403**, so IDs can't be probed.
- **Silent data leaks made impossible by type.** Services take `ownerId: string` (required), so code that could pass `undefined` (which Prisma treats as "no filter") doesn't compile.
- **Errors tell the truth.** Bad credentials → 401 with one generic message; invalid input → 400 via Zod (including route params, before they reach Postgres); a database failure → 500 and logged, never disguised as a 401. Internal details never reach the client.
- **Fail-fast configuration.** Required env vars are validated at startup, so a misconfigured deploy refuses to start rather than failing on a later request.
- **Unguessable inbox IDs.** UUID v4 IDs protect the public receiver URL; the webhook URL is built from config, not the client-controlled `Host` header.
- **Indexed for the access pattern.** A composite index on `(ownerId, createdAt)` serves the "my inboxes, newest first" query without a sort.

## Testing

Route tests run the real middleware, controllers and services through Supertest, with Prisma mocked. They check both what the client receives and what each query asked the database for (owner scoping, spoofed owner IDs ignored, 401/400/404 paths). The suite needs no database, so it runs as-is in CI.

```bash
npm test -- --run
```

## Running locally

```bash
npm ci
npx prisma migrate deploy
npm run dev:key        # prints a development API key once
npm run dev
```

Environment variables (`.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection for the app (pooled) |
| `DIRECT_URL` | Direct connection for Prisma migrations |
| `PUBLIC_BASE_URL` | Base for generated webhook URLs, e.g. `http://localhost:3000` |
| `DEV_API_KEY_OWNER_ID` | Written by `npm run dev:key` |

## Project structure

```
src/
  routes/        HTTP endpoints and middleware wiring
  controllers/   request/response handling
  services/      business logic and database access
  schemas/       Zod validation
  middleware/    API-key auth, error handling
  config.ts      validated environment
prisma/          schema and migrations
tests/           Vitest + Supertest
```
