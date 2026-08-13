import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { StoryDetailDTO } from "@openfolklore/shared";
import { moderationApi } from "../api/moderation";
import { storiesApi } from "../api/stories";
import { AudioPlayer } from "../components/AudioPlayer";

// FR4/FR5/FR6/FR7 — the moderation queue. Every action here is re-checked
// server-side by rbac middleware (docs/phase7-implementation-plan.md §5);
// this page assumes the user already passed RequireRole, but that's UX only.
export function ModerationQueue() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const queueQuery = useQuery({ queryKey: ["moderation", "queue"], queryFn: moderationApi.queue });
  const itemQuery = useQuery({
    queryKey: ["moderation", "item", selectedId],
    queryFn: () => moderationApi.getQueueItem(selectedId as string),
    enabled: Boolean(selectedId),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["moderation"] });
    queryClient.invalidateQueries({ queryKey: ["stories"] });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-adinkra-900 mb-4">
        Moderation Queue {queueQuery.data ? `(${queueQuery.data.stories.length} pending)` : ""}
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          {queueQuery.data?.stories.length === 0 && <p className="text-adinkra-600 text-sm">Nothing pending.</p>}
          {queueQuery.data?.stories.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-left border rounded-md px-3 py-2 text-sm ${
                selectedId === s.id ? "border-adinkra-600 bg-adinkra-100" : "border-adinkra-300 bg-white"
              }`}
            >
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-adinkra-500">{s.status.replace("_", " ")}</div>
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          {itemQuery.data ? (
            <ReviewPanel
              story={itemQuery.data.story}
              onActed={() => {
                setSelectedId(null);
                refresh();
              }}
            />
          ) : (
            <p className="text-adinkra-600 text-sm">Select an item to review.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewPanel({ story, onActed }: { story: StoryDetailDTO; onActed: () => void }) {
  const [reason, setReason] = useState("");
  const [linkQuery, setLinkQuery] = useState("");

  const decide = useMutation({
    mutationFn: (input: { decision: "approved" | "rejected" | "changes_requested"; reason?: string }) =>
      moderationApi.decide(story.id, input),
    onSuccess: onActed,
  });

  const linkResults = useQuery({
    queryKey: ["stories", "search-for-link", linkQuery],
    queryFn: () => storiesApi.list({ q: linkQuery }),
    enabled: linkQuery.length > 1,
  });

  const linkVariant = useMutation({
    mutationFn: (relatedStoryId: string) => storiesApi.linkVariant(story.id, relatedStoryId),
  });

  return (
    <div className="border border-adinkra-300 rounded-lg p-4 bg-white space-y-4">
      <div>
        <h2 className="font-semibold text-adinkra-900">{story.title}</h2>
        <p className="text-sm text-adinkra-600">
          {story.narratorName} · {[story.region, story.ethnicGroup].filter(Boolean).join(" · ")} · {story.language}
        </p>
      </div>

      {story.audio && (
        <div>
          <AudioPlayer src={story.audio.fileUrl} />
          {story.audio.transcript && (
            <p className="text-xs text-adinkra-600 mt-1 whitespace-pre-line">
              Draft transcript: {story.audio.transcript}
            </p>
          )}
        </div>
      )}
      {story.textBody && <p className="text-sm whitespace-pre-line text-adinkra-800">{story.textBody}</p>}

      <div>
        <h3 className="text-sm font-medium text-adinkra-900 mb-1">Link as a variant of an existing story</h3>
        <input
          placeholder="Search published stories…"
          className="w-full border border-adinkra-300 rounded-md px-3 py-1.5 text-sm"
          value={linkQuery}
          onChange={(e) => setLinkQuery(e.target.value)}
        />
        {linkResults.data && linkResults.data.stories.length > 0 && (
          <ul className="mt-2 space-y-1">
            {linkResults.data.stories
              .filter((s) => s.id !== story.id)
              .map((s) => (
                <li key={s.id} className="flex items-center justify-between text-sm">
                  <span>{s.title}</span>
                  <button
                    onClick={() => linkVariant.mutate(s.id)}
                    disabled={linkVariant.isPending}
                    className="text-xs px-2 py-1 rounded bg-adinkra-200 hover:bg-adinkra-300"
                  >
                    Link
                  </button>
                </li>
              ))}
          </ul>
        )}
        {linkVariant.isSuccess && <p className="text-xs text-green-700 mt-1">Linked.</p>}
      </div>

      <div className="border-t border-adinkra-200 pt-3 space-y-2">
        <textarea
          placeholder="Reason (required to reject or request changes)"
          className="w-full border border-adinkra-300 rounded-md px-3 py-1.5 text-sm"
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        {decide.isError && <p className="text-sm text-red-700">{decide.error.message}</p>}
        <div className="flex gap-2">
          <button
            onClick={() => decide.mutate({ decision: "approved" })}
            disabled={decide.isPending}
            className="px-3 py-1.5 rounded-md bg-green-700 text-white text-sm"
          >
            Approve
          </button>
          <button
            onClick={() => decide.mutate({ decision: "changes_requested", reason })}
            disabled={decide.isPending}
            className="px-3 py-1.5 rounded-md bg-amber-600 text-white text-sm"
          >
            Request Changes
          </button>
          <button
            onClick={() => decide.mutate({ decision: "rejected", reason })}
            disabled={decide.isPending}
            className="px-3 py-1.5 rounded-md bg-red-700 text-white text-sm"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
