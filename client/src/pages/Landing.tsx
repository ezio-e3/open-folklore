import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { StorySummaryDTO } from "@openfolklore/shared";
import { storiesApi } from "../api/stories";

// New homepage, implemented from the Claude Design "OpenFolklore Landing"
// mockup (project 4ca73ed4-8b7a-42c7-a1ee-8254619aa262, via the DesignSync
// MCP tool). Every section below uses real data from this app — two mockup
// sections ("Continue reading" progress bars, named "Popular collections")
// needed features this app doesn't have and were deliberately omitted rather
// than faked; see docs/phase13-future-evolution.md.

// Deterministic decorative photo per story/culture id — a stand-in for a
// real per-story photo (none exist yet; StoryCard.tsx elsewhere in the app
// uses the same "no image yet" idea via a solid color instead). Picked
// deterministically per id (not randomly) so a given story always shows the
// same photo on reload — decoration, not a claim that the photo depicts
// that specific story or culture.
const PLACEHOLDER_IMAGES = [
  "/images/pexels-ahad-hasan-1816309676-32013787.jpg",
  "/images/pexels-akoonie-10875406.jpg",
  "/images/pexels-amine-kubranur-cakiroglu-689611212-38845156.jpg",
  "/images/pexels-andreea-ch-371539-11889218.jpg",
  "/images/pexels-avro-dutta-2153793012-37475629.jpg",
  "/images/pexels-entumoto-17831035.jpg",
  "/images/pexels-hridyakshgejwal-35295143.jpg",
  "/images/pexels-jameswomble-17192879.jpg",
  "/images/pexels-maxx-sas-382101-36079524.jpg",
  "/images/pexels-maxx-sas-382101-38826145.jpg",
  "/images/pexels-wyteshot-36505989.jpg",
];
function imageFor(id: string): string {
  const hash = [...id].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return PLACEHOLDER_IMAGES[hash % PLACEHOLDER_IMAGES.length];
}

export function Landing() {
  const { data } = useQuery({ queryKey: ["stories", "landing-all"], queryFn: () => storiesApi.list() });
  const { data: facets } = useQuery({ queryKey: ["stories", "facets"], queryFn: storiesApi.facets });

  const stories = data?.stories ?? [];
  const withAudio = stories.filter((s) => s.hasAudio).slice(0, 4);
  const featured = stories.slice(0, 4);
  const recent = stories.slice(0, 5);
  const cultures = (facets?.ethnicGroups ?? []).slice(0, 6);

  return (
    <div>
      {/* Hero */}
      <section className="grid md:grid-cols-2 gap-12 items-center px-6 md:px-14 pt-16 pb-20 max-w-[1360px] mx-auto">
        <div>
          <span className="tag tag-accent-2 mb-6 inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent2-600" />
            Free, open-source, and growing
          </span>
          <h1 className="font-heading text-[42px] md:text-[58px] leading-[1.06] max-w-xl mt-2">
            Gather round, the way we always have.
          </h1>
          <p className="text-lg leading-relaxed text-adinkra-900/75 max-w-lg mt-4">
            Long before these stories were written down, they were spoken by firelight. OpenFolklore keeps them
            written — with narrator, region, and language recorded for every tale — and narrated audio wherever a
            community member has recorded one, so a story told in one place can travel anywhere.
          </p>
          <div className="flex gap-3.5 items-center mt-6">
            <Link to="/browse" className="btn btn-primary text-[15px] px-7 py-3.5">
              Start reading
            </Link>
            <Link to="/submit" className="btn btn-secondary text-[15px] px-6 py-3.5">
              Add a narration
            </Link>
          </div>
        </div>
        <div className="relative aspect-square rounded-full overflow-hidden elev-lg">
          <img
            src="/images/pexels-bareed_shotz-2155179348-33811037.jpg"
            alt="A woman in traditional dress balances a hand-painted clay bowl on her head"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      {/* Fireside recordings — real published stories with audio */}
      {withAudio.length > 0 && (
        <section className="px-6 md:px-14 pb-20 max-w-[1360px] mx-auto">
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-heading text-[28px] m-0">Fireside recordings</h2>
          </div>
          <p className="text-adinkra-900/60 text-[15px] max-w-xl mb-7">
            Narrated by our community — anyone can record or upload a reading of an open, traditional tale.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {withAudio.map((s) => (
              <Link key={s.id} to={`/stories/${s.id}`} className="card elev-sm p-4 block">
                <div className="aspect-square rounded-organic-md mb-0.5 relative grid place-items-center overflow-hidden">
                  <img src={imageFor(s.id)} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  <span className="relative w-11 h-11 rounded-full bg-adinkra-50 grid place-items-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="6 3 20 12 6 21 6 3" />
                    </svg>
                  </span>
                </div>
                <div className="card-title">{s.title}</div>
                <div className="card-meta">Narrated by {s.narratorName}</div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured stories — a real sample of published stories, honestly labeled */}
      {featured.length > 0 && (
        <section className="px-6 md:px-14 pb-20 max-w-[1360px] mx-auto">
          <div className="flex items-baseline justify-between mb-7">
            <div>
              <h2 className="font-heading text-[28px] m-0 mb-1.5">From the archive</h2>
              <p className="m-0 text-adinkra-900/60 text-[15px]">Published stories, ready to read or listen to</p>
            </div>
            <Link to="/browse" className="btn-ghost text-sm font-semibold no-underline">
              Browse library →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((s) => (
              <FeaturedCard key={s.id} story={s} />
            ))}
          </div>
        </section>
      )}

      {/* Featured cultures — real aggregate counts (GET /api/stories/facets) */}
      {cultures.length > 0 && (
        <section className="px-6 md:px-14 pb-20 max-w-[1360px] mx-auto">
          <h2 className="font-heading text-[28px] mb-2">Featured cultures</h2>
          <p className="text-adinkra-900/60 text-[15px] mb-8">Explore folklore by the people who carried it</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-5">
            {cultures.map((c) => (
              <Link key={c.value} to={`/browse?ethnicGroup=${encodeURIComponent(c.value)}`} className="text-center no-underline text-inherit">
                <div className="aspect-square rounded-full mb-3 overflow-hidden">
                  <img src={imageFor(c.value)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="font-semibold text-sm mb-0.5">{c.value}</div>
                <div className="text-xs text-adinkra-900/55">
                  {c.count} {c.count === 1 ? "story" : "stories"}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently added — real, already sorted by createdAt desc */}
      {recent.length > 0 && (
        <section className="px-6 md:px-14 pb-20 max-w-[1360px] mx-auto">
          <h2 className="font-heading text-[28px] mb-7">Recently added</h2>
          <div className="card elev-sm p-0 overflow-hidden">
            {recent.map((r, i) => (
              <Link
                key={r.id}
                to={`/stories/${r.id}`}
                className={`flex items-center gap-4 px-6 py-4 no-underline text-inherit ${
                  i < recent.length - 1 ? "border-b border-[color:var(--color-divider)]" : ""
                }`}
              >
                <div className="w-11 h-11 rounded-organic-sm flex-none overflow-hidden">
                  <img src={imageFor(r.id)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-[15px]">{r.title}</div>
                  <div className="text-xs text-adinkra-900/60">
                    {[r.ethnicGroup, r.region].filter(Boolean).join(" · ")}
                  </div>
                </div>
                <div className="text-xs text-adinkra-900/50">{new Date(r.createdAt).toLocaleDateString()}</div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.75" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Community CTA — real repo link */}
      <section className="px-6 md:px-14 pb-24 max-w-[1360px] mx-auto">
        <div className="bg-accent2-200 rounded-organic-lg p-12 md:p-16 grid md:grid-cols-[1.3fr_0.7fr] gap-10 items-center">
          <div>
            <h2 className="font-heading text-[32px] text-accent2-900 mb-3.5">
              These stories belong to everyone. Help us keep them that way.
            </h2>
            <p className="text-accent2-800 text-[15px] leading-relaxed max-w-lg m-0">
              OpenFolklore is open-source and community-built. Read the code, file an issue, or contribute a story
              of your own.
            </p>
          </div>
          <div className="flex gap-3 justify-self-end">
            <a
              href="https://github.com/ezio-e3/open-folklore"
              target="_blank"
              rel="noreferrer"
              className="btn bg-adinkra-50 text-accent2-900 px-6 py-3.5 text-sm"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer — real links where they exist */}
      <footer className="px-6 md:px-14 pb-10 max-w-[1360px] mx-auto border-t border-[color:var(--color-divider)] pt-14">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-3.5">
              <span className="w-6 h-6 rounded-full bg-adinkra-500" />
              <span className="font-heading text-base">OpenFolklore</span>
            </div>
            <p className="text-[13px] text-adinkra-900/60 max-w-[280px] leading-relaxed">
              A free, open-source library preserving African oral tradition for readers and listeners everywhere.
            </p>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-adinkra-900/50 mb-3.5">Explore</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <Link to="/countries" className="text-adinkra-900 no-underline">Countries</Link>
              <Link to="/languages" className="text-adinkra-900 no-underline">Languages</Link>
              <Link to="/browse" className="text-adinkra-900 no-underline">Browse library</Link>
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-adinkra-900/50 mb-3.5">Project</div>
            <div className="flex flex-col gap-2.5 text-sm">
              <a href="https://github.com/ezio-e3/open-folklore" target="_blank" rel="noreferrer" className="text-adinkra-900 no-underline">GitHub</a>
              <a href="https://openfolklore.vercel.app/api/export?format=json" className="text-adinkra-900 no-underline">Open dataset (API)</a>
            </div>
          </div>
        </div>
        <div className="text-xs text-adinkra-900/50">
          © 2026 OpenFolklore. Open source under MIT. Stories are licensed CC BY-NC-SA 4.0 by default — see each
          story for its specific attribution.
        </div>
      </footer>
    </div>
  );
}

function FeaturedCard({ story }: { story: StorySummaryDTO }) {
  return (
    <Link to={`/stories/${story.id}`} className="block no-underline text-inherit">
      <div className="aspect-[3/4] rounded-organic-lg mb-3.5 relative overflow-hidden grid place-items-center p-4">
        <img src={imageFor(story.id)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        {story.region && (
          <span className="tag absolute top-3.5 left-3.5 bg-adinkra-50/90 font-semibold">{story.region}</span>
        )}
      </div>
      <div className="card-title mb-1.5">{story.title}</div>
      <div className="card-meta">
        <span>{story.ethnicGroup ?? story.language}</span>
      </div>
    </Link>
  );
}
