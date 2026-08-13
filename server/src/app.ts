import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";

import { env } from "./lib/env.js";
import { logger } from "./lib/logger.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { UPLOAD_DIR } from "./services/storage.service.js";

import { authRouter } from "./routes/auth.routes.js";
import { storyRouter } from "./routes/story.routes.js";
import { moderationRouter } from "./routes/moderation.routes.js";
import { takedownRouter } from "./routes/takedown.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { exportRouter } from "./routes/export.routes.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true, // cookie-based auth (docs/phase7-implementation-plan.md §4) requires this
    }),
  );
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === "/api/health" } }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(attachUser);

  // express.static serves Accept-Ranges by default, which is what FR11's
  // audio seek control needs (docs/phase6-design.md §5) — no dedicated
  // streaming endpoint required.
  app.use("/uploads", express.static(UPLOAD_DIR));

  app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", authRouter);
  app.use("/api/stories", storyRouter);
  app.use("/api/moderation", moderationRouter);
  app.use("/api/takedown-requests", takedownRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/export", exportRouter);

  // Serve the built React app for every non-API route (single deployable
  // unit, docs/phase6-design.md §1) — this path is what the Fly.io/Docker
  // deployment (docs/phase10-deployment.md §1-2) actually uses. On Vercel,
  // vercel.json routes static assets directly, so this branch is never
  // reached there, but is kept rather than deleted since Fly.io remains a
  // documented, working alternative deployment target. In dev, Vite's own
  // server handles the frontend instead — see server/package.json "dev" vs "start".
  const clientDist = path.resolve(process.cwd(), "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });

  app.use(errorHandler);

  return app;
}
