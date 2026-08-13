# OpenFolklore

**Live:** https://openfolklore.vercel.app

An open, audio-first platform for African oral folktales — community members submit stories as text and/or narrated audio with structured provenance (narrator, region, ethnic group, language), a moderator reviews and publishes them, and related tellings of the same tale across cultures can be linked as variants.

Full software engineering lifecycle documentation — discovery, requirements, SRS, effort estimation, analysis, design, and this implementation — lives in [`docs/`](docs/), produced in that order for a CSCD602 capstone exam.

## Stack

TypeScript end to end — React + Vite + Tailwind (client), Express (server), Postgres (Neon) via Prisma, JWT auth in an httpOnly cookie, audio storage on Vercel Blob behind a swappable interface, deployed as a Vercel serverless function. See [docs/phase6-design.md](docs/phase6-design.md) for the original architecture/rationale and [docs/phase10-deployment.md](docs/phase10-deployment.md) for the Vercel/Neon/Blob deployment (a Docker/Fly.io/SQLite path also exists and is fully verified — docs/phase9-technical-debt.md D2 — but isn't what's live).

## Quick start (local dev)

**Local dev uses its own isolated Postgres container and local disk storage by default — never the real Neon/Blob production data.** (An earlier version of this README pointed local dev at real Neon/Blob directly; that briefly let local testing leak data onto the live site — see docs/phase9-technical-debt.md. Fixed by isolating them properly, not by warning harder.)

```bash
npm install
npm run build --workspace=shared          # shared types package ships compiled output

docker run -d --name openfolklore-dev-db -p 5434:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=openfolklore_dev \
  postgres:16-alpine

cp server/.env.example server/.env
# edit server/.env: DATABASE_URL="postgresql://postgres:postgres@localhost:5434/openfolklore_dev"
# JWT_SECRET=<openssl rand -base64 32>, leave BLOB_READ_WRITE_TOKEN empty

cd server
npx prisma migrate deploy
npx tsx prisma/seed.ts                    # creates test accounts + demo stories (idempotent)
cd ..

npm run dev                               # server on :4000, client on :5173
```

Open http://localhost:5173. Audio uploads automatically fall back to local disk storage (`server/uploads/`) when `BLOB_READ_WRITE_TOKEN` is empty — `StorageService`'s Strategy pattern, docs/phase10-deployment.md §3.

**Need to test against real Neon/Blob specifically** (e.g. verifying a production-only integration issue)? `vercel link && vercel env pull .env.local`, then copy those values into `server/.env` instead — but know that this makes local dev **write to the same database and file store the live site reads from**. Treat any data created that way as needing manual cleanup afterward, not something to leave lying around.

## Test accounts (seeded)

| Role | Email | Password |
|---|---|---|
| Admin | admin@openfolklore.org | ChangeMe123! |
| Moderator | moderator@openfolklore.org | ChangeMe123! |
| Contributor | contributor@openfolklore.org | ChangeMe123! |

The seed also creates 4 demo stories (3 published, 1 pending review) across two regions (Ghana/Akan and Nigeria/Yoruba) — including a genuine cross-cultural variant pair ready to be linked live from the moderation queue. See [server/prisma/seed-stories.ts](server/prisma/seed-stories.ts) for sourcing notes.

## Tests

A third, separate container — port 5433, distinct from the dev DB on 5434 above and from real Neon — so automated test runs never touch either:

```bash
docker run -d --name openfolklore-test-db -p 5433:5432 \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=openfolklore_test \
  postgres:16-alpine

cd server
npm run pretest   # applies migrations to the local test container above
npm test
```

23 tests covering the submission → moderation → publish critical path, RBAC (401/403), the story state machine, the takedown/unpublish flow (BR1–BR9), and the Landing page's facets aggregation. See [docs/phase8-testing.md](docs/phase8-testing.md) for the full test strategy and manual QA record.

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
