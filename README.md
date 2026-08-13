# OpenFolklore

**Live:** https://openfolklore.vercel.app

An open, audio-first platform for African oral folktales — community members submit stories as text and/or narrated audio with structured provenance (narrator, region, ethnic group, language), a moderator reviews and publishes them, and related tellings of the same tale across cultures can be linked as variants.

Full software engineering lifecycle documentation — discovery, requirements, SRS, effort estimation, analysis, design, and this implementation — lives in [`docs/`](docs/), produced in that order for a CSCD602 capstone exam.

## Stack

TypeScript end to end — React + Vite + Tailwind (client), Express (server), Postgres (Neon) via Prisma, JWT auth in an httpOnly cookie, audio storage on Vercel Blob behind a swappable interface, deployed as a Vercel serverless function. See [docs/phase6-design.md](docs/phase6-design.md) for the original architecture/rationale and [docs/phase10-deployment.md](docs/phase10-deployment.md) for the Vercel/Neon/Blob deployment (a Docker/Fly.io/SQLite path also exists and is fully verified — docs/phase9-technical-debt.md D2 — but isn't what's live).

## Quick start (local dev)

Local dev now uses the same Postgres + Blob services as production (pulled via the Vercel CLI), not a local SQLite file:

```bash
npm install
npm run build --workspace=shared          # shared types package ships compiled output

vercel link                               # link to the openfolklore Vercel project
vercel env pull .env.local                # pulls DATABASE_URL, BLOB_READ_WRITE_TOKEN, etc.

cd server
# copy DATABASE_URL and BLOB_READ_WRITE_TOKEN from ../.env.local into server/.env,
# alongside a local JWT_SECRET (openssl rand -base64 32) — see .env.example
npx prisma migrate deploy
npx tsx prisma/seed.ts                    # creates test accounts + demo stories (idempotent)
cd ..

npm run dev                               # server on :4000, client on :5173
```

Open http://localhost:5173.

**No Vercel access?** The app still runs fully offline: point `DATABASE_URL` at any Postgres instance (e.g. `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine`) and omit `BLOB_READ_WRITE_TOKEN` — `StorageService` automatically falls back to local disk storage under `server/uploads/` (docs/phase10-deployment.md §3, Strategy pattern).

## Test accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@openfolklore.org | ChangeMe123! |
| Moderator | moderator@openfolklore.org | ChangeMe123! |
| Contributor | contributor@openfolklore.org | ChangeMe123! |

The seed also creates 4 demo stories (3 published, 1 pending review) across two regions (Ghana/Akan and Nigeria/Yoruba) — including a genuine cross-cultural variant pair ready to be linked live from the moderation queue. See [server/prisma/seed-stories.ts](server/prisma/seed-stories.ts) for sourcing notes.

## Tests

```bash
docker run -d --name openfolklore-test-db -p 5433:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=openfolklore_test \
  postgres:16-alpine

cd server
npm run pretest   # applies migrations to the local test container above
npm test
```

22 tests covering the submission → moderation → publish critical path, RBAC (401/403), the story state machine, and the takedown/unpublish flow (BR1–BR9). See [docs/phase8-testing.md](docs/phase8-testing.md) for the full test strategy and manual QA record.

## Repository layout

```
client/   React frontend
server/   Express API + Prisma schema/migrations/seed
shared/   TypeScript types & Zod schemas shared by both
api/      Vercel serverless function entry point (wraps the Express app)
docs/     Full SE lifecycle documentation (Phases 1–14)
```

## Licensing

Application code: MIT ([LICENSE](LICENSE)). Story content: CC BY-NC-SA 4.0 by default, declared per-story ([CONTENT_LICENSE.md](CONTENT_LICENSE.md)) — code and content are licensed separately on purpose.
