# Phase 12 — Maintenance Plan

**Project:** OpenFolklore
**Status:** Draft

Grounded in what's actually running (Vercel + Neon + Blob, docs/phase10-deployment.md) and what's actually tracked as unfinished (docs/phase9-technical-debt.md D1–D11) — this isn't a generic maintenance checklist, it's this project's.

---

## 1. Maintenance Categories

### 1.1 Corrective Maintenance (fixing defects)

Fixing something that's broken relative to its specification. Two real, open examples exist right now, not hypothetically:

- **D10** — the Browse nav link doesn't work on the live deployment.
- **D11** — no working sign-up flow on the live deployment.

Both are triaged, dated, and deliberately queued behind the planned UI redesign (docs/phase9-technical-debt.md, updated 2026-08-13) rather than patched blind. That sequencing is itself a maintenance decision worth stating: **fix the two known corrective items as part of the redesign pass, not before it** — patching the nav link today risks conflicting with whatever the redesign changes about the `Layout` component tomorrow.

**Process going forward:** any new user-reported defect gets a debt-register entry (id, cause, impact, priority, classification) before it gets a fix — the same discipline already applied throughout this project, not a new process being introduced now.

### 1.2 Adaptive Maintenance (keeping pace with a changing environment)

Changes required not because the app is wrong, but because something it depends on moved:

- **Platform version drift.** `prisma` CLI already reported a major version available (5.22.0 → 7.x) during this project's own build. Prisma major versions can change generated-client behavior — this needs a deliberate upgrade-and-retest cycle (§4), not an automatic bump.
- **Vercel/Neon/Blob platform changes.** All three are managed services whose free-tier limits, APIs, or default behaviors can change outside this project's control (exactly the kind of platform-specific constraint that already bit this project twice — the 4.5MB body limit and the `NODE_ENV` build-time behavior, both docs/phase10-deployment.md §5). Adaptive maintenance here means re-reading the relevant platform's changelog when something that used to work stops working, before assuming it's a code regression.
- **Node.js version.** Currently Node 20 across server, client tooling, and Vercel's function runtime. Node 20 reaches end-of-life on a known schedule; migrating to the next LTS is adaptive maintenance, not optional forever.

### 1.3 Perfective Maintenance (improving without changing behavior)

Work that makes the system better without changing what it does. The largest one is already committed to, not hypothetical:

- **The planned UI/UX redesign** (working memory, 2026-08-13) is textbook perfective maintenance — the functional behavior documented in Phase 11 stays the same; the visual design changes. D10/D11 are folded into this pass deliberately (§1.1).
- **D3** (normalized region/ethnic-group/language taxonomy instead of free text) and **D7** (automated frontend tests) are both perfective — the system works today; these make it more maintainable and higher-quality over time, not more correct right now.

### 1.4 Preventive Maintenance (reducing future failure risk)

Work done before something breaks, not after:

- **D4** (true magic-byte file-type sniffing instead of trusting the client-declared MIME type) — closing this before it's exploited, not after.
- **D8** (5 npm audit findings in the dev-tooling chain) — low risk today because they're dev-only, but reviewing them on a schedule (§4) rather than only when something forces the issue.
- **Backup automation** (§6) — the single most important preventive item not yet done. Neon's point-in-time recovery is a safety net that already exists by default, but a periodic export via the already-built `/api/export` endpoint is cheap, additional insurance that doesn't exist yet.

## 2. Dependency Updates

**Policy:** run `npm audit` and check for major-version updates on a monthly cadence at minimum, and immediately after any CVE disclosure affecting a direct dependency (Express, Prisma, jsonwebtoken, bcryptjs, multer — the security-sensitive ones). Every update gets the same verification bar already established in this project: type-check clean, full test suite green (22/22 currently), and — for anything touching auth, uploads, or the database — a manual smoke pass against the live deployment before considering it done. "It installed without error" is not the bar; this project has already demonstrated why (docs/phase9-technical-debt.md §6, §7's build-vs-runtime failures).

**Specifically flagged now:** the Prisma major-version upgrade (5.x → 7.x) noted in §1.2 should be scheduled deliberately, with the schema/migration regenerated and the full local Postgres test pass (server/tests/) rerun before touching the Neon production database.

## 3. Security Updates

- Dependency CVEs: covered by §2's cadence.
- **D4** (MIME content-sniffing) and **D8** (dev-tooling audit findings) are the two open, tracked security-adjacent debt items — see docs/phase9-technical-debt.md for their full reasoning and effort estimates.
- Secrets rotation: `JWT_SECRET` was generated fresh per-environment during Phase 10 setup (never the local dev placeholder) — if it's ever suspected of exposure, rotate via `vercel env rm` + `vercel env add` per environment; every existing session cookie becomes invalid immediately, which is the correct fail-safe behavior, not a bug to work around.
- RBAC and input validation are enforced server-side throughout (docs/phase7-implementation-plan.md §5–§7) — any future endpoint must follow the same pattern (`requireRole`/`requireAuth` + Zod schema), verified the same way the existing 22 tests verify it, not assumed.

## 4. Scaling Strategy

The current architecture scales further than it looks, mostly by default rather than by design effort:

- **Compute (Vercel serverless functions):** scales horizontally automatically — no capacity planning needed at this project's scale.
- **Database (Neon Postgres):** already provisioned behind a **pooled connection** (the `-pooler` endpoint in `DATABASE_URL`, confirmed during Phase 10 setup) — this matters specifically because serverless functions can otherwise exhaust a database's connection limit under load by opening a fresh connection per invocation. This wasn't a deliberate scaling decision made in this phase; it's what Neon's Vercel integration provisions by default — worth knowing it's there and *why* it matters, rather than assuming it's accidental if it's ever changed.
- **File storage (Vercel Blob):** CDN-backed, scales by default (confirmed in Phase 10 §6 — `x-vercel-cache` header present on served audio).
- **When to actually revisit this:** if story volume or concurrent moderation load ever becomes real (not demo-scale), the first things to check are Neon's connection pool limits on the free tier and Vercel's function concurrency limits — both are configuration changes on existing services, not an architecture change, consistent with how Phase 6 designed this from the start.

## 5. Monitoring

- **Health check:** `GET /api/health`, already live and verified (docs/phase10-deployment.md §6). No external uptime checker is currently configured — adding one (e.g. a free UptimeRobot check against the health endpoint) remains a cheap, undone next step, same as noted in the original Phase 10 draft.
- **Function logs:** `vercel logs <url>` or the Vercel dashboard, streaming the structured `pino` JSON logs already built (docs/phase7-implementation-plan.md §9). **Honest limitation:** Vercel's default log retention window is short — there is no long-term log archive configured. For a project at this scale that's an acceptable trade-off, not an oversight, but it means any incident investigation needs to happen close to when the incident occurred.
- **Error visibility:** the centralized error handler (docs/phase7-implementation-plan.md §8) already logs every 5xx with a stack trace server-side — this is the primary signal to watch, since it's the one thing in these logs that should almost never appear in normal operation.

## 6. Logging

No change from the design already built and verified: structured JSON via `pino`, request-level logging (method, path, status, duration, user id if authenticated — never secrets or full request bodies), 5xx errors logged with stack traces. The one maintenance-relevant addition worth flagging: **if this project ever needs log retention beyond Vercel's default window**, a log drain integration (Vercel supports several) is the next step — not attempted here because nothing in this project's current scope has needed it yet.

## 7. Backup

- **Database:** Neon's automatic point-in-time recovery, confirmed available on its free tier (docs/phase10-deployment.md §10) — this is real backup coverage that exists today, not a gap.
- **Audio files:** Vercel Blob is redundant by provider default; no separate backup process layered on top.
- **The actual open item:** a periodic *exported snapshot* of the published dataset (via the already-built `GET /api/export`) as an independent copy outside Neon/Vercel entirely — cheap to add (a scheduled GitHub Action hitting the endpoint and committing/archiving the result), not yet done. This is the single most concrete, actionable leftover from Phase 10's honest limitation note, and the first thing to build if this project moves toward real community use rather than staying a demo.

## 8. Disaster Recovery

Informal, matched to this project's actual scale — no enterprise RTO/RPO commitments are made here because none would be honest at this scale:

| Scenario | Recovery step |
|---|---|
| Vercel deployment broken (bad deploy) | `vercel rollback`, or redeploy the last known-good commit via `vercel deploy --prod` |
| Neon database corrupted/lost | Restore via Neon's point-in-time recovery (dashboard), or worst case, re-run `prisma migrate deploy` + `prisma/seed.ts` against a fresh database — the seed script is idempotent and re-runnable by design (docs/phase5-analysis.md §6), so the demo dataset is never truly lost even in a total-loss scenario |
| Vercel Blob store lost | Uploaded audio would be unrecoverable without the §7 export improvement — this is the sharpest edge in the current disaster-recovery posture and the strongest argument for building that export automation sooner rather than later |
| GitHub repo lost | Full local working copy already exists in the current development environment; not currently mirrored anywhere else — a second remote (e.g. GitLab) is a cheap insurance step not yet taken |
| Domain/account access lost (Vercel/Neon/GitHub) | No recovery path beyond each provider's own account-recovery process — genuinely out of this project's control, worth knowing rather than assuming otherwise |

---

## 9. Decision Point

This plan is written against what's real: the actual tracked debt (D1–D11), the actual provisioned infrastructure, and the actual gaps already admitted in Phase 10 rather than newly invented ones. Confirm before **Phase 13 — Future Evolution**, which is where the perfective items above (redesign, taxonomy normalization, AI features) turn into a forward-looking roadmap rather than a backlog.
