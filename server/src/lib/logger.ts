import pino from "pino";
import { env } from "./env.js";

// Structured JSON logs to stdout — captured by the hosting platform's log
// viewer (docs/phase7-implementation-plan.md §9). No external aggregator at
// this scale; that's a Phase 12/13 upgrade path, not attempted here.
export const logger = pino({
  level: env.isProduction ? "info" : "debug",
  transport: env.isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});
