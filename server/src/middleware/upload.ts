import multer from "multer";
import { AppError } from "../lib/errors.js";

// FR2 (audio upload) + the file-upload security rules in
// docs/phase7-implementation-plan.md §6: MIME allow-list, size cap, filenames
// never derived from user input. Buffers in memory rather than writing to
// local disk directly — the actual persistence (local disk or Vercel Blob)
// is StorageService's job (see storage.service.ts), since Vercel's
// serverless functions have no persistent disk to write to at all
// (docs/phase10-deployment.md §9).
const ALLOWED_MIME_TYPES = new Set(["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/x-wav"]);
// Lowered from the original 25MB (Phase 7 §7) to fit under Vercel serverless
// functions' hard ~4.5MB request body limit (docs/phase10-deployment.md §9)
// — the whole upload passes through this function as one request body, so
// this is the platform's ceiling, not a design preference. Still enough for
// several minutes of spoken narration at a reasonable bitrate.
const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024;

export const uploadAudio = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError(400, "INVALID_FILE_TYPE", "Audio must be MP3, MP4/M4A, WAV, or WebM"));
      return;
    }
    cb(null, true);
  },
}).single("audio");
