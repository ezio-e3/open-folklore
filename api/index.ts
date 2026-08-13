// Vercel serverless function entry point. All /api/* requests are rewritten
// here (see vercel.json) and handled by the same Express app used by the
// Fly.io/Docker deployment path (docs/phase10-deployment.md §1-2) — the
// routing, business logic, and middleware are identical; only the storage
// (StorageService, storage.service.ts) and database (Postgres via Neon
// instead of SQLite) differ between the two targets, both already
// abstracted behind interfaces for exactly this reason (docs/phase6-design.md §6).
import { createApp } from "../server/src/app.js";

export default createApp();
