# Phase 7 — Implementation Plan

**Project:** OpenFolklore
**Status:** Approved and built. **Amendment (Phase 10):** §7's validation rule "audio ≤25MB" was lowered to 4MB after deployment, to fit Vercel serverless functions' request-body limit — see docs/phase10-deployment.md §5. §10's deployment shape (Docker, Fly.io) remains built and valid (docs/phase9-technical-debt.md D2) but is not the platform actually running in production; see docs/phase10-deployment.md for what is.

This document is the pre-code checkpoint the process calls for: backend/frontend architecture, auth flow, authorization, security strategy, validation rules, error handling, logging, and deployment architecture — all decided *before* the first line of application code, so implementation is executing a plan rather than discovering one.

---

## 1. Module Sequence (build order, mapped to Phase 4's estimate)

Ordered by dependency, not just priority — each module lists what it needs already done. Hours reconcile exactly to the Phase 4 baseline (43h Must-have) and stretch queue (10h, attempted only in this order, only with time remaining).

| # | Module | Depends on | Hours | FR/BR |
|---|---|---|---|---|
| M0 | Project scaffold: npm workspaces, TypeScript config, lint/format, Docker skeleton | — | 2 | — |
| M1 | Database: Prisma schema (Phase 6 §4), migrations, seed script skeleton | M0 | 2 | — |
| M2 | Auth module: register/login, bcrypt, JWT issuance, RBAC middleware | M1 | 3 | FR15 |
| M3 | Story submission: backend endpoint + validation (BR1–BR3) + `StorageService` (local) + submission form UI | M2 | 5 | FR1–FR3 |
| M4 | Audio upload handling: multipart parsing, file validation, range-enabled static serving | M3 | 3 | FR2 |
| M5 | Moderation module: queue endpoint, decision endpoint, state machine, notification stub + queue UI | M3 | 5 | FR4, FR5, FR7 |
| M6 | Public browse/search: backend filters + browse page UI | M3 | 3 | FR8 |
| M7 | Story detail page: text, audio player, provenance, license display | M6 | 3 | FR9, FR11, FR19 |
| M8 | Seed content authoring: 2 regions, self-retold tales + metadata, seed script | M1 | 3 | — |
| M9 | Responsive styling pass (Tailwind baseline across all pages) | M3, M5, M6, M7 | 3 | — |
| M10 | Testing on the critical path (submit → moderate → publish) | M3, M5 | 4 | — |
| M11 | Deployment: Dockerfile finalize, env config, deploy to free-tier host | all above | 3 | — |
| M12 | Documentation pass + debugging/contingency buffer | throughout | 4 | — |
| | **Must-have subtotal** | | **43h** | |

**Should-have stretch queue** (attempted only after M0–M12 are done, strictly in this order, each independently droppable):

| # | Module | Depends on | Hours | FR/BR |
|---|---|---|---|---|
| S-A | Public read-only API (FR17) | M6 | 2 | FR17 |
| S-B | Takedown form + Admin resolution (incl. BR9 `unpublished` transition) | M7 | 2 | FR20, BR9 |
| S-C | Variant linking (moderator UI + relation) | M5, M7 | 2 | FR6, FR10 |
| S-D | Speech-to-text integration (`AsrService` hosted impl) | M4 | 4 | FR12 |

---

## 2. Backend Architecture

**Request lifecycle:**

```
Client → requestLogger → cors → helmet → rateLimiter (write routes)
       → authMiddleware (verify JWT, attach req.user) → rbacMiddleware (role check)
       → zodValidation → controller → service → Prisma → SQLite
       → response formatter → (errors → centralized error handler)
```

**Layer responsibilities:**
- `routes/` — endpoint → controller wiring + which middleware applies to which route. No logic.
- `controllers/` — parse request, call the service, shape the HTTP response. No business logic.
- `services/` — all business logic: BR1–BR9 enforcement, the `Story` state machine, orchestration of `StorageService`/`AsrService`/Prisma. This is the layer Phase 8's tests target hardest, since it's where correctness actually lives.
- `middleware/` — `auth`, `rbac`, `validate`, `errorHandler`, `requestLogger`.
- `schemas/` — Zod schemas, imported by both server validation and (via the `shared/` package) client-side form validation.
- `prisma/` — schema and migrations (Phase 6 §4, translated to Prisma syntax).
- `lib/` — `AppError` class, logger instance, JWT helpers, password-hashing helpers.

## 3. Frontend Architecture

- **Routing:** React Router — pages for Browse, Story Detail, Submit, Login/Register, Moderation Queue, Admin.
- **Server state:** TanStack Query (React Query) for fetching/caching stories and the moderation queue — handles loading/error states and cache invalidation after mutations (e.g., a new submission or moderation decision) without hand-rolled state plumbing.
- **Local/form state:** plain `useState`/`useReducer` per form. **No Redux or other global state library** — at this scale (a handful of screens, no complex cross-cutting client state) that would be unjustified complexity, consistent with the "right-sized architecture" principle from Phase 6.
- **API layer:** typed fetch wrapper functions per resource (`api/stories.ts`, `api/moderation.ts`, …), using the DTO types from `shared/`, so a backend response-shape change is a compile error on the frontend, not a silent runtime bug.

## 4. Authentication Flow

**Refinement over Phase 6's literal API wording:** Phase 6 §5 described login/register as returning "user + token" in the JSON body. For security, the actual mechanism is: the server issues the JWT as an **httpOnly, Secure, SameSite=Strict cookie**, not a token returned for client-side storage. This is a stronger default against XSS-based token theft than storing a JWT in `localStorage`, at negligible extra cost — noted explicitly here as the authoritative mechanism, since it refines (not contradicts) Phase 6's API behavior.

1. **Register:** client submits name/email/password → Zod validates (email format, password ≥ 8 chars with at least one digit) → bcrypt hashes password (cost factor 12) → `User` created with `role = contributor` (fixed — role is never client-selectable at registration; see §5) → JWT issued (`{userId, role}`, 7-day expiry) → set as httpOnly/Secure/SameSite=Strict cookie → response body returns the user profile only (never the password hash).
2. **Login:** credentials validated → `bcrypt.compare` → same JWT issuance/cookie as registration.
3. **Authenticated requests:** the cookie is sent automatically by the browser → `authMiddleware` verifies the JWT signature and expiry → attaches `req.user = {id, role}` → `rbacMiddleware` checks `req.user.role` against the route's allowed roles.
4. **Logout:** clears the cookie.

**Security rule, stated explicitly because it prevents a real vulnerability class:** `role` is never accepted as client input on registration. Moderator/Admin roles are only ever set by (a) the seed script, for the initial test accounts, or (b) an existing Admin via `PATCH /api/admin/users/:id/role` (FR16) — never by self-service. This closes the obvious privilege-escalation path (a Contributor registering themselves as Admin) before it can be built, not after.

## 5. Authorization (RBAC Matrix)

| Action | Anonymous | Contributor | Moderator | Admin |
|---|---|---|---|---|
| Browse/search/read published stories (FR8, FR9) | ✅ | ✅ | ✅ | ✅ |
| Submit a story (FR1) | ❌ | ✅ | ✅ | ✅ |
| File a takedown request (FR20) | ✅ | ✅ | ✅ | ✅ |
| View/act on moderation queue (FR5) | ❌ | ❌ | ✅ | ✅ |
| Link a variant (FR6) | ❌ | ❌ | ✅ | ✅ |
| Resolve a takedown request (BR9) | ❌ | ❌ | ❌ | ✅ |
| Manage users/roles (FR16) | ❌ | ❌ | ❌ | ✅ |

Enforced server-side in `rbacMiddleware` on every route in the table — per SRS §3.2, a direct API call from an unauthorized role must fail regardless of what the UI shows or hides.

## 6. Security Strategy

- **Passwords:** bcrypt, cost factor 12. Never logged, never returned in any API response.
- **Session token:** JWT (HS256), secret from environment variable, delivered via httpOnly/Secure/SameSite=Strict cookie (§4). SameSite=Strict is the primary CSRF mitigation at this scale — accepted as sufficient rather than adding a separate CSRF-token scheme, given the small, first-party-only client.
- **Authorization:** enforced server-side on every write route (§5) — never inferred from UI state alone.
- **Input validation:** Zod schemas on every request body, whitelist-style (reject unknown fields), not blacklist-style.
- **Output encoding:** React escapes rendered text by default; story text/transcripts are never rendered via `dangerouslySetInnerHTML`, which forecloses stored-XSS through user-submitted story content.
- **File upload:** MIME type checked via content sniffing (not filename/extension alone), size capped (4MB — lowered from an original 25MB after deployment, to fit Vercel's serverless request-body limit; docs/phase10-deployment.md §5), stored outside any web-executable path, served with a locked-down `Content-Type`.
- **Rate limiting:** applied to `/api/auth/*` and `POST /api/stories` to deter credential-stuffing and submission spam.
- **CORS:** restricted to the deployed frontend origin in production.
- **Secure headers:** Helmet-equivalent defaults (CSP, X-Content-Type-Options, etc.).
- **Secrets:** `.env` (gitignored) + `.env.example` committed as the documented template; no secret ever hardcoded or committed.

## 7. Validation Rules

| Field | Rule | Rationale |
|---|---|---|
| `title` | string, 3–200 chars, required | — |
| `textBody` | string, optional, ≤20,000 chars | — |
| `audio` | optional file, ≤4MB (see §6 note), MIME ∈ {audio/mpeg, audio/mp4, audio/wav, audio/webm} | — |
| `language` | string, required, ≥2 chars | Free-text with curated suggestions, per Phase 5's internationalization decision |
| `region` / `ethnicGroup` | optional strings; **at least one required** | BR2 — enforced via a Zod `.refine()` cross-field check |
| `textBody` / `audio` | **at least one required** | BR1 — cross-field check, mirrored server-side inside `StoryService` since it also depends on the uploaded file, not just the body |
| `narratorName` | string, 2–100 chars, required | — |
| `attested` | must be literal `true` | BR3 |
| `email` | valid email format | — |
| `password` | ≥8 chars, ≥1 digit | — |
| `decision.reason` | required, ≥5 chars, **only when decision = rejected** | BR7 — cross-field check |
| `takedown.reason` | required, ≥10 chars | — |

## 8. Error Handling

- Custom `AppError { statusCode, code, message }`, thrown from services/controllers.
- Centralized error-handling middleware (last in the chain): formats every error response as `{ error: { code, message, details? } }`; logs 5xx errors server-side with stack trace; **never** leaks a stack trace to the client.
- Convention: validation failure → 400 with field-level `details`; auth failure → 401; RBAC failure → 403; not found → 404; conflict (e.g. duplicate email) → 409; unhandled → 500.
- All async route handlers wrapped so a rejected promise reaches the error middleware instead of crashing the process.
- ASR failures are caught explicitly inside `StoryService` and treated as non-fatal — logged as a warning, submission proceeds without a transcript. This is the concrete implementation of the Reliability NFR (SRS §4), not just a stated intention.

## 9. Logging Strategy

- Structured JSON logs (`pino` or equivalent), levels: error / warn / info / debug.
- Request logging middleware records method, path, status code, duration, and `user.id` if authenticated — **never** passwords, tokens, or full request bodies containing sensitive fields.
- Error logs carry the stack trace server-side only (§8).
- Destination for this build: stdout, captured by the hosting platform's log viewer — no external log aggregation service. Appropriate at this scale; upgrading to a dedicated log aggregator is logged as a Phase 12/13 maintenance/evolution item, not attempted now.

## 10. Deployment Architecture (detailed in Phase 10 — shape only, here)

- Multi-stage `Dockerfile`: stage 1 builds the client (Vite), stage 2 compiles the server (TS → JS), final stage copies both plus production `node_modules` and runs the server, which also serves the built client as static files.
- Required environment variables: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`, and `ASR_API_KEY` (only if S-D is reached).
- `GET /api/health` for the hosting platform's liveness probe.
- **Flagged risk for Phase 10's provider choice:** SQLite (a file) and local `/uploads` both need a **persistent volume**. Several free-tier PaaS options have an *ephemeral* filesystem by default (data lost on redeploy/restart) unless a persistent disk/volume is explicitly attached. This must be checked, not assumed, when Phase 10 picks a provider — silently losing the seed dataset or submitted content on a routine redeploy would be a bad way to find this out.

---

## 11. Decision Point

This plan is the last checkpoint before real code and commands start running (repo init, package installs, file scaffolding) — a qualitatively different, harder-to-quietly-undo kind of action than the documentation produced so far. Confirm this plan (or flag changes), and confirm you want me to proceed to actually scaffold the project and begin **M0** now.
