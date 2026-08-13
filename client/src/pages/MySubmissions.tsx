import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import type { StoryStatus } from "@openfolklore/shared";
import { storiesApi } from "../api/stories";

// Closes D1 (docs/phase9-technical-debt.md) — FR7 promised the Contributor
// would be "notified" of a moderation decision; with no email/push channel
// in scope, this page is where they actually find out.
const STATUS_STYLES: Record<StoryStatus, string> = {
  pending_review: "bg-amber-100 text-amber-800",
  published: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  changes_requested: "bg-amber-100 text-amber-800",
  unpublished: "bg-adinkra-200 text-adinkra-700",
};

const STATUS_LABELS: Record<StoryStatus, string> = {
  pending_review: "Pending review",
  published: "Published",
  rejected: "Rejected",
  changes_requested: "Changes requested",
  unpublished: "Unpublished",
};

export function MySubmissions() {
  const { data, isLoading } = useQuery({ queryKey: ["stories", "mine"], queryFn: storiesApi.mine });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 w-full">
      <h1 className="text-2xl font-bold text-adinkra-900 mb-4">My Submissions</h1>
      {isLoading && <p className="text-adinkra-600">Loading…</p>}
      {data?.stories.length === 0 && (
        <p className="text-adinkra-600 text-sm">
          You haven't submitted anything yet. <Link to="/submit" className="underline">Submit a story</Link>.
        </p>
      )}
      <div className="space-y-2">
        {data?.stories.map((s) => (
          <div key={s.id} className="border border-adinkra-300 rounded-lg p-3 bg-white flex items-center justify-between">
            <div>
              {s.status === "published" ? (
                <Link to={`/stories/${s.id}`} className="font-medium text-adinkra-900 hover:underline">
                  {s.title}
                </Link>
              ) : (
                <span className="font-medium text-adinkra-900">{s.title}</span>
              )}
              <p className="text-xs text-adinkra-500">Submitted {new Date(s.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[s.status]}`}>
              {STATUS_LABELS[s.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
