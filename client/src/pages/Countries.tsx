import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "../api/stories";

// Real nav destination from the Claude Design mockup's "Countries" link —
// backed by GET /api/stories/facets (real aggregate counts), linking into
// Browse pre-filtered by region.
export function Countries() {
  const { data } = useQuery({ queryKey: ["stories", "facets"], queryFn: storiesApi.facets });
  const regions = data?.regions ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full">
      <h1 className="font-heading text-2xl text-adinkra-900 mb-1">Countries</h1>
      <p className="text-adinkra-900/60 text-sm mb-6">Browse published stories by region.</p>
      {regions.length === 0 && <p className="text-adinkra-600 text-sm">No published stories yet.</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {regions.map((r) => (
          <Link
            key={r.value}
            to={`/browse?region=${encodeURIComponent(r.value)}`}
            className="card elev-sm flex-row items-center justify-between no-underline text-inherit"
          >
            <span className="card-title">{r.value}</span>
            <span className="tag tag-accent">
              {r.count} {r.count === 1 ? "story" : "stories"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
