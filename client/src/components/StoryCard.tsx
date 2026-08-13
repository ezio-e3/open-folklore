import { Link } from "react-router-dom";
import type { StorySummaryDTO } from "@openfolklore/shared";

export function StoryCard({ story }: { story: StorySummaryDTO }) {
  return (
    <Link
      to={`/stories/${story.id}`}
      className="block border border-adinkra-300 rounded-lg p-4 bg-white hover:shadow-md hover:border-adinkra-500 transition"
    >
      <h3 className="font-semibold text-adinkra-900 flex items-center gap-2">
        {story.hasAudio && <span title="Has audio narration">🔊</span>}
        {story.title}
      </h3>
      <p className="text-sm text-adinkra-700 mt-1">
        {[story.region, story.ethnicGroup].filter(Boolean).join(" · ")} — {story.language}
      </p>
      <p className="text-xs text-adinkra-500 mt-1">Narrated by {story.narratorName}</p>
    </Link>
  );
}
