import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storiesApi } from "../api/stories";

// Same pattern as Countries.tsx, grouped by language instead of region.
export function Languages() {
  const { data } = useQuery({ queryKey: ["stories", "facets"], queryFn: storiesApi.facets });
  const languages = data?.languages ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full">
      <h1 className="font-heading text-2xl text-adinkra-900 mb-1">Languages</h1>
      <p className="text-adinkra-900/60 text-sm mb-6">Browse published stories by language.</p>
      {languages.length === 0 && <p className="text-adinkra-600 text-sm">No published stories yet.</p>}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {languages.map((l) => (
          <Link
            key={l.value}
            to={`/browse?language=${encodeURIComponent(l.value)}`}
            className="card elev-sm flex-row items-center justify-between no-underline text-inherit"
          >
            <span className="card-title">{l.value}</span>
            <span className="tag tag-accent-2">
              {l.count} {l.count === 1 ? "story" : "stories"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
