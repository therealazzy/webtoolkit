# WebToolkit

A backend API for developer utilities: JWT and JSON tools, plus a webhook-testing service where each user gets temporary inboxes that capture incoming HTTP requests for inspection.

![CI](https://github.com/therealazzy/webtoolkit/actions/workflows/ci.yml/badge.svg)

**Live:** https://webtoolkit-production-64842500.up.railway.app/health

## Stack

| | |
|---|---|
| Runtime / language | Node.js 24, TypeScript (strict) |
| HTTP | Express 5 |
| Database | PostgreSQL (Supabase in production, Docker locally), Prisma ORM |
| Validation | Zod |
| Logging | pino, pino-http |
| Testing | Vitest, Supertest |
| CI / deploy | GitHub Actions, Docker, Railway |

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/v1/jwt/inspect` | – | Decode a JWT's header, payload and expiry (no signature check) |
| POST | `/api/v1/jwt/verify` | – | Verify a JWT's signature |
| POST | `/api/v1/json/format` · `/minify` · `/diff` · `/validate` | – | JSON utilities |
| GET | `/api/v1/me` | API key | Return the authenticated owner |
| POST | `/api/v1/inboxes` | API key | Create a webhook inbox (expires after 24h) |
| GET | `/api/v1/inboxes` | API key | List your active inboxes, newest first |
| GET | `/api/v1/inboxes/:inboxId` | API key | Get one inbox |
| DELETE | `/api/v1/inboxes/:inboxId` | API key | Delete an inbox and its captured requests |
| GET | `/api/v1/inboxes/:inboxId/requests` | API key | List captured requests (cursor pagination: `limit`, `cursor`) |
| GET | `/api/v1/inboxes/:inboxId/requests/:requestId` | API key | Get one captured request, including headers and body |
| POST | `/hooks/:inboxId` | – | Public receiver: captures any request sent to an inbox |
| GET | `/health` | – | Liveness: the process is up |
| GET | `/health/readiness` | – | Readiness: the database is reachable (503 if not) |

Authenticated endpoints take an `X-API-Key` header.

### Webhook inboxes

1. Create an inbox. The response includes a `webhookUrl`.
2. Point any service (Stripe, GitHub, your own app) at that URL. Every request is stored exactly as received: method, headers, query string and raw body (up to 1 MB).
3. List and inspect the captured requests. Text bodies (`text/*`, JSON, XML, form data) come back as UTF-8; everything else comes back as base64, so binary payloads survive intact.

Inboxes expire 24 hours after creation. Expired inboxes stop accepting requests (410 Gone) and are deleted, with their requests, by an hourly cleanup job.

## Engineering decisions

- **Hashed API keys.** Keys are 32 random bytes; only a SHA-256 hash is stored, and the raw key is shown once. Lookup is a single indexed query on the unique hash.
- **Ownership is derived, never trusted.** The owner comes from the verified key (`req.ownerId`), not from the request. Every query filters by owner, and another user's inbox returns **404, not 403**, so IDs can't be probed.
- **Silent data leaks made impossible by type.** Services take `ownerId: string` (required), so code that could pass `undefined` (which Prisma treats as "no filter") doesn't compile.
- **Errors tell the truth.** Bad credentials → 401 with one generic message; invalid input → 400 via Zod (including route params, before they reach Postgres); a database failure → 500 and logged, never disguised as a 401. Internal details never reach the client.
- **Raw bodies, stored as bytes.** The receiver reads the body before any parser touches it, so payloads are stored byte for byte. Signature verification and binary content depend on that.
- **Stable pagination.** Request lists use cursor pagination ordered by `(createdAt, id)`, so pages don't skip or repeat rows while new webhooks arrive.
- **Batched cleanup.** Expired inboxes are deleted in batches of 1,000, with an overlap guard so a slow run never stacks up behind the next one.
- **Structured, redacted logs.** Every request gets a JSON log line with a request ID. The `X-API-Key`, `Authorization` and `Cookie` headers are redacted before anything is written.
- **Graceful shutdown.** On SIGTERM the server stops the cleanup job, finishes in-flight requests, closes the database connection and exits, with a 20-second forced exit as a backstop.
- **Separate liveness and readiness.** `/health` never touches the database, so an outage stops traffic instead of triggering pointless restarts.
- **Fail-fast configuration.** Required env vars are validated at startup, so a misconfigured deploy refuses to start rather than failing on a later request.
- **Unguessable inbox IDs.** UUID v4 IDs protect the public receiver URL; the webhook URL is built from config, not the client-controlled `Host` header.
- **Indexed for the access pattern.** Composite indexes on `(ownerId, createdAt)` and `(inboxId, createdAt)` serve the "newest first" list queries without a sort.

## Testing

Route tests run the real middleware, controllers and services through Supertest, with Prisma mocked. They check both what the client receives and what each query asked the database for (owner scoping, spoofed owner IDs ignored, 400/401/404/410/413 paths). The suite needs no database, so it runs as-is in CI.

```bash
npm test -- --run
```

## Running locally

Requires Node.js 24 and Docker.

```bash
npm ci
docker compose up -d          # local Postgres on localhost:5432
npx prisma migrate dev        # create the tables
npm run dev:key               # prints a development API key once
npm run dev
```

Environment variables (`.env`):

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection for the app. Locally: `postgresql://webtoolkitusr:wtktikpwd@localhost:5432/webtoolkitdb` |
| `DIRECT_URL` | Connection for Prisma migrations. Locally: the same as `DATABASE_URL` |
| `PUBLIC_BASE_URL` | Base for generated webhook URLs, e.g. `http://localhost:3000` |
| `DEV_API_KEY_OWNER_ID` | Written by `npm run dev:key` |
| `LOG_LEVEL` | Optional, defaults to `info` |

The local database is for development only and its data is disposable. `docker compose down -v` deletes it.

## Deployment

The app ships as a multi-stage Docker image: TypeScript is compiled in a build stage, and the runtime stage contains only production dependencies and the compiled output, running as a non-root user. Railway builds the image from the repository and supplies environment variables at runtime; secrets are never baked into the image. Migrations are applied to production with `npx prisma migrate deploy`.

## Project structure

```
src/
  routes/        HTTP endpoints and middleware wiring
  controllers/   request/response handling
  services/      business logic and database access
  schemas/       Zod validation
  middleware/    API-key auth, error handling
  jobs/          scheduled cleanup
  lib/           Prisma client, logger, API-key helpers
  config.ts      validated environment
prisma/          schema and migrations
tests/           Vitest + Supertest
```

## License

MIT
