import type { Request, Response } from "express";
import type { StoryDetailDTO } from "@openfolklore/shared";
import { storyService } from "../services/story.service.js";

// FR17 (public read-only API) is already satisfied by GET /api/stories
// (docs/phase7-implementation-plan.md M6) — this endpoint adds FR18's bulk
// export in JSON or CSV, the one piece not already covered.
function toCsv(stories: StoryDetailDTO[]): string {
  const headers = ["id", "title", "language", "region", "ethnicGroup", "narratorName", "license", "createdAt"];
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const rows = stories.map((s) =>
    headers.map((h) => escape(String((s as unknown as Record<string, unknown>)[h] ?? ""))).join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}

export const exportController = {
  async export(req: Request, res: Response) {
    const format = req.query.format === "csv" ? "csv" : "json";
    const stories = await storyService.listPublishedForExport();

    if (format === "csv") {
      res.status(200).header("Content-Type", "text/csv").attachment("openfolklore-stories.csv").send(toCsv(stories));
      return;
    }
    res.status(200).json({ stories, license: "CC BY-NC-SA 4.0", exportedAt: new Date().toISOString() });
  },
};
