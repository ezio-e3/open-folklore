// Runs before every test file (vitest.config.ts setupFiles). Sets env vars
// before src/lib/env.ts's required() check runs on import, and points the
// test suite at a local Postgres container (docker run postgres:16-alpine,
// see docs/phase9-technical-debt.md / README) so it never touches the real
// Neon dev database (docs/phase5-analysis.md §6 — don't let tooling corrupt
// seed data). Schema provider is fixed to "postgresql" (docs/phase10-deployment.md
// §9), so SQLite is no longer an option here even for test isolation.
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/openfolklore_test";
process.env.JWT_SECRET = "test-secret-not-for-real-use";
process.env.NODE_ENV = "test";
process.env.CORS_ORIGIN = "http://localhost:5173";
