import { put } from "@vercel/blob";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { env } from "../lib/env.js";
import { logger } from "../lib/logger.js";

export interface UploadedFile {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

// Strategy pattern: business logic depends on this interface, never on the
// filesystem or a specific cloud provider (docs/phase6-design.md §6, SRS
// §5.3). Originally implemented with local disk storage for the Docker/Fly.io
// deployment path (Phase 7); swapped to Vercel Blob when the deployment
// target changed to Vercel (docs/phase10-deployment.md §9) — Vercel's
// serverless functions have no persistent local disk, so this was a hard
// requirement, not a preference. LocalStorageService is kept, not deleted,
// so pure-offline local development still works without any cloud token.
export interface StorageService {
  /** Persists the file and returns the URL it can be served from. */
  save(file: UploadedFile): Promise<string>;
}

export const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");

class LocalStorageService implements StorageService {
  async save(file: UploadedFile): Promise<string> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = path.extname(file.originalName).toLowerCase();
    const filename = `${crypto.randomUUID()}${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    return `/uploads/${filename}`;
  }
}

class VercelBlobStorageService implements StorageService {
  async save(file: UploadedFile): Promise<string> {
    const ext = path.extname(file.originalName).toLowerCase();
    const key = `audio/${crypto.randomUUID()}${ext}`;
    const blob = await put(key, file.buffer, {
      access: "public",
      contentType: file.mimeType,
      token: env.blobReadWriteToken,
    });
    return blob.url;
  }
}

export const storageService: StorageService = env.blobReadWriteToken
  ? new VercelBlobStorageService()
  : new LocalStorageService();

if (!env.blobReadWriteToken) {
  logger.info("BLOB_READ_WRITE_TOKEN not set — using local disk storage for audio uploads.");
}
