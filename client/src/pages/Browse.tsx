import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { storiesApi, type StoryFilters } from "../api/stories";
import { StoryCard } from "../components/StoryCard";

// FR8 — public browse/search, no login required. Reads an initial filter
// from the URL (?region=/?ethnicGroup=/?language=) so links from Landing,
// Countries, and Languages pre-filter correctly — those pages don't
// duplicate this filtering logic, they just link here.
export function Browse() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<StoryFilters>({
    region: searchParams.get("region") ?? undefined,
    ethnicGroup: searchParams.get("ethnicGroup") ?? undefined,
    language: searchParams.get("language") ?? undefined,
  });
  const { data, isLoading, isError } = useQuery({
    queryKey: ["stories", filters],
    queryFn: () => storiesApi.list(filters),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full">
      <h1 className="text-2xl font-bold text-adinkra-900 mb-1">Traditional Stories</h1>
      <p className="text-adinkra-700 mb-4">
        Read or listen to community-contributed African folktales, each with its narrator, region, and language recorded.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="search"
          placeholder="Search title or text…"
          className="border border-adinkra-300 rounded-md px-3 py-1.5 text-sm flex-1 min-w-[160px]"
          value={filters.q ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value || undefined }))}
        />
        <input
          type="text"
          placeholder="Region"
          className="border border-adinkra-300 rounded-md px-3 py-1.5 text-sm w-32"
          value={filters.region ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, region: e.target.value || undefined }))}
        />
        <input
          type="text"
          placeholder="Ethnic group"
          className="border border-adinkra-300 rounded-md px-3 py-1.5 text-sm w-36"
          value={filters.ethnicGroup ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, ethnicGroup: e.target.value || undefined }))}
        />
        <input
          type="text"
          placeholder="Language"
          className="border border-adinkra-300 rounded-md px-3 py-1.5 text-sm w-32"
          value={filters.language ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, language: e.target.value || undefined }))}
        />
      </div>

      {isLoading && <p className="text-adinkra-600">Loading stories…</p>}
      {isError && <p className="text-red-700">Could not load stories. Try again shortly.</p>}
      {data && data.stories.length === 0 && (
        <p className="text-adinkra-600">No stories match your filters yet.</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {data?.stories.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
