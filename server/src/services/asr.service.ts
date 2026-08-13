import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";

// Strategy pattern, mirroring storage.service.ts. FR12 (draft transcript) is a
// Should-have (stretch module S-D, docs/phase7-implementation-plan.md §1) — the
// interface exists from day one so StoryService can call it unconditionally,
// and a missing/failing provider is always non-fatal (Reliability NFR,
// docs/phase3-srs.md §4: "must never block submission").
export interface AsrService {
  transcribe(audioFileUrl: string): Promise<string | null>;
}

// Default implementation until S-D wires up a real hosted ASR provider.
// Submission works end-to-end without it; transcripts are simply absent.
class NoopAsrService implements AsrService {
  async transcribe(): Promise<string | null> {
    return null;
  }
}

class HostedAsrService implements AsrService {
  async transcribe(audioFileUrl: string): Promise<string | null> {
    try {
      // Placeholder for the S-D stretch module: call a hosted ASR API here.
      // Intentionally not implemented in the Must-have build — see
      // docs/phase9-technical-debt.md.
      logger.debug({ audioFileUrl }, "HostedAsrService.transcribe called but not implemented");
      return null;
    } catch (err) {
      logger.warn({ err }, "ASR transcription failed — continuing without a transcript");
      return null;
    }
  }
}

export const asrService: AsrService = env.asrApiKey ? new HostedAsrService() : new NoopAsrService();
