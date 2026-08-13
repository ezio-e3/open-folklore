# Phase 10 — Deployment

**Project:** OpenFolklore
**Status:** Complete — deployed and verified live at **https://openfolklore.vercel.app**

---

## 0. What Actually Happened (read this first)

The original recommendation in this document was **Fly.io**, reasoned from the SQLite/local-file architecture built in Phase 6. That reasoning is preserved in §1–§2 below because it was sound and remains valid — the Docker image it describes was built, tested, and fixed for real in Phase 9 §6, and would still work as a deployment path today.

When asked to act on it, you pushed back: "why Fly.io, what about Vercel?" That was a fair challenge, not a detour — the honest answer required laying out a real trade-off (§3), not just restating the original pick. You chose **Vercel, with the Postgres + Blob storage swap**, accepting the additional implementation work that entailed. Sections §4 onward document what that swap actually required, the bugs it surfaced, and the live result. Both paths are real; Vercel is the one actually running.

---

## 1. Original Recommendation: Fly.io (historical, still valid)

The architecture decided in Phase 6 — one Docker container, SQLite as a file, audio on local disk, both needing a **persistent volume** — was a real constraint on platform choice. Phase 9 §6 confirmed this requirement empirically (data survived a restart only because a named volume was mounted at `/app/server/prisma`).

| Platform | Fit | Why |
|---|---|---|
| **Fly.io** | ✅ Good fit | Native persistent volumes, deploys a Dockerfile directly, single-region single-container is its core use case, built-in health-check support matches `/api/health`. |
| Render | ❌ Poor fit as configured | Free-tier web services have an *ephemeral* filesystem — would silently lose the SQLite file and all uploaded audio on every redeploy. |
| Railway | ⚠️ Workable, weaker default | Supports volumes, but its free tier is a time/credit-limited trial. |
| Vercel (as SQLite/local-disk architecture) | ❌ Wrong shape | Serverless functions have no persistent local disk — would require re-architecting storage before it could run at all. |

## 2. Fly.io Deployment Reference (unused, kept as a documented alternative)

Everything needed to deploy the existing Docker image to Fly.io instead, if this project ever needs to move off Vercel:

- **Database:** SQLite in the volume — no separate service.
- **Checklist:** `flyctl auth login` → `flyctl launch --no-deploy` → `flyctl volumes create openfolklore_data --size 1` → mount it at `/app/server/prisma` in the generated `fly.toml` → `flyctl secrets set JWT_SECRET=$(openssl rand -base64 32)` → `flyctl deploy` → `flyctl ssh console -C "npx tsx prisma/seed.ts"`.
- **Env vars:** `DATABASE_URL=file:./dev.db`, `JWT_SECRET`, `NODE_ENV=production`, `PORT=4000`, `CORS_ORIGIN=https://<app>.fly.dev`.
- **Monitoring/backup:** `flyctl logs`; `flyctl volumes snapshots create <volume-id>` for backup — same honest gap noted below (§8) applies here too: no automated schedule was ever set up.

## 3. The Real Trade-off: Why Vercel Needed More Than a Different `deploy` Command

Vercel is a serverless platform — API requests run in short-lived functions with no persistent local disk between invocations. That's the actual incompatibility with the Phase 6 architecture, not Express itself (Vercel runs Express fine via a serverless wrapper). Choosing Vercel meant accepting two real architecture swaps, engineered as cheap precisely *because* Phase 6 anticipated this possibility:

1. **SQLite → Postgres (Neon)** — a `provider`/`url` change in `schema.prisma`, exactly what the Scalability NFR (docs/phase3-srs.md §4) was written to make cheap.
2. **Local file storage → Vercel Blob** — a new `StorageService` implementation behind the same Strategy-pattern interface from Phase 6 §6, not a rewrite of anything that calls it.

What follows is what actually happened when those swaps met reality.

## 4. Setup: Accounts and Provisioning

Done together in this session, the same way Docker Desktop needed your first-launch click-through:

- Installed the Vercel CLI (`brew install vercel`), authenticated (`vercel login`), linked the project (`vercel link`).
- Installed the Neon marketplace integration (`vercel install neon`) — required accepting Neon's marketplace terms in your browser first, then auto-provisioned a Postgres database and injected `DATABASE_URL` and related vars directly into the project's environment config. No manual connection-string copying.
- Created a public Vercel Blob store (`vercel blob create-store openfolklore-audio --access public`) — auto-injected `BLOB_READ_WRITE_TOKEN`.
- Generated and set `JWT_SECRET` across Production, Preview, and Development environments (`vercel env add`), using a fresh secret for each — never the local dev placeholder.

## 5. What Building It Actually Required — 6 Real Bugs

Every one of these was found by deploying and testing against the real platform, not by inspecting code — the same discipline applied to the Docker verification in Phase 9 §6, and it paid off the same way:

| # | Bug | Symptom | Fix |
|---|---|---|---|
| 1 | Wrong Postgres migration syntax | The existing migration SQL was generated for SQLite and isn't valid Postgres DDL | Deleted and regenerated the initial migration against the new `postgresql` provider |
| 2 | Test suite pointed at SQLite | Schema provider is now fixed to Postgres; `test.db` no longer matches | Stood up a local Postgres container (`postgres:16-alpine`, port 5433) exclusively for tests, isolated from the real Neon database — same "never let tooling touch real data" principle as Phase 5 §6 |
| 3 | `NODE_ENV=production` set as a Vercel env var broke the *build* | `npm install` treats `NODE_ENV=production` as `--production`, silently skipping devDependencies (`typescript`, `vite`) the build needs — surfaced as `tsc: command not found` | Removed the manual `NODE_ENV` var; Vercel already sets it automatically at *runtime* for deployed functions, which is the only place the app code actually checks it |
| 4 | Prisma Client never generated during the Vercel build | `buildCommand` built `shared` and `client` but never ran `prisma generate` for the server — function crashed on every request with `FUNCTION_INVOCATION_FAILED` | Added `npm run prisma:generate --workspace=server` to `vercel.json`'s `buildCommand` |
| 5 | ESM/CJS mismatch between the function entry and the app it imports | Root `package.json` had no `"type": "module"`, so Vercel bundled `/api/index.ts` as CommonJS while `server/` (which does declare `"type": "module"`) produced ESM output — `Error [ERR_REQUIRE_ESM]` on every request | Added `"type": "module"` to the root `package.json` |
| 6 | SPA client-side routes 404'd on direct navigation | `/login`, `/submit`, etc. only worked via in-app navigation; a hard refresh or direct link hit Vercel's static file server, which has no file at `/login` and no fallback rule | Added a catch-all rewrite in `vercel.json` sending any non-`/api` path to `/index.html`, letting React Router take over client-side |

Also handled, not a bug but a real platform constraint worth naming: **Vercel serverless functions cap request bodies at ~4.5MB**, well under the original 25MB audio limit from Phase 7 §7. Rather than let this fail silently in production, the limit was lowered to 4MB (still several minutes of spoken narration at a reasonable bitrate) and a `MulterError` handler was added so an oversized file now returns a clean 400 instead of a generic 500.

## 6. Verified Live (not just deployed)

Against `https://openfolklore.vercel.app`, for real:

- `GET /api/health` → `200 {"status":"ok"}`
- `GET /api/stories` → the 3 seeded published stories, correctly excluding the pending one
- Full auth + RBAC: login as Moderator, `GET /api/moderation/queue` shows the 1 pending item; a Contributor gets `403` on the same route
- **Real audio upload → Vercel Blob → served back**: uploaded a WAV file through `POST /api/stories`, approved it, fetched the resulting story detail, and confirmed the `audio.fileUrl` is a genuine public `*.blob.vercel-storage.com` URL — `HEAD` on it returns `accept-ranges: bytes` (FR11's seek requirement, now backed by a real CDN rather than Express's static file server) and the correct `content-type: audio/wav`
- **BR9 end-to-end**: filed a takedown against the uploaded story, resolved it as `upheld` as Admin, confirmed the story now 404s on `GET /api/stories/:id`
- **Playwright browser pass against the live URL**: Browse page renders real seeded content; login → Moderation Queue navigation works via direct URL (confirming bug #6's fix); zero console errors
- Local suite re-run one final time after all changes: **22/22 tests still passing**, both `tsc --noEmit` checks clean

## 7. CI/CD (updated for Vercel)

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: openfolklore_test
        ports: ["5433:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm install
      - run: npm run build --workspace=shared
      - run: npx tsc -p server/tsconfig.json --noEmit
      - run: npx tsc -p client/tsconfig.json --noEmit
      - run: npx tsc -p tsconfig.json --noEmit
      - name: Server tests
        working-directory: server
        run: |
          npm run pretest
          npm test
```

Deployment itself is handled by **Vercel's native GitHub integration** (connect the repo in the Vercel dashboard) rather than a custom deploy step in Actions — every push to `main` triggers a production deployment automatically, and every PR gets its own preview URL, once the GitHub remote exists (§9).

## 8. Environment Variables (as actually configured)

| Variable | Source | Note |
|---|---|---|
| `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `PG*` | Auto-provisioned by the Neon integration | Never manually copied |
| `BLOB_READ_WRITE_TOKEN` | Auto-provisioned by the Blob store creation | Same |
| `JWT_SECRET` | Manually set per-environment (`vercel env add`) | Distinct value per environment, never the local dev placeholder |
| `NODE_ENV` | **Not manually set** | Vercel sets this automatically at runtime; setting it manually broke the build (bug #3, §5) |
| `CORS_ORIGIN` | Not required | Single Vercel deployment serves both frontend and API from the same origin |
| `ASR_API_KEY` | Unset | FR12/S-D intentionally not implemented (Phase 9 D6) |

## 9. What Still Requires You

- **GitHub remote:** still not created — the repo is `git init`-ed locally with nothing committed or pushed. Once it exists, connecting it in the Vercel dashboard replaces the manual `vercel deploy --prod` calls used to get this live with automatic deploy-on-push.
- **Ongoing ownership of the Vercel/Neon/Blob accounts** — these are now real, live, billable-beyond-free-tier-limits resources under your accounts, not a local artifact.

## 10. Monitoring & Backup

- **Health check:** `GET /api/health`, verified live (§6). Vercel's own dashboard shows function invocation logs and errors natively — `vercel logs <url>` from the CLI, same as used throughout §5's debugging.
- **Database backup:** Neon takes automatic point-in-time snapshots on its free tier (a real advantage over the Fly.io/SQLite path, which had none set up — §2). Blob storage is Vercel-managed, redundant by default.
- **Honest limitation carried over from the original plan:** no *additional* custom backup/export schedule has been set up beyond Neon's built-in point-in-time recovery — for real community use beyond this demo, exporting the dataset periodically via the existing `GET /api/export` endpoint (FR18, already built) is the cheapest next step and belongs in Phase 12.

---

## 11. Decision Point

**Resolved.** Vercel deployment is live, verified, and documented. Fly.io remains a valid, ready-to-use alternative (§1–§2) if this project ever needs to move off serverless. Proceeding to **Phase 11 — User Manual**, which can now reference the real live URL instead of local-only setup instructions.
