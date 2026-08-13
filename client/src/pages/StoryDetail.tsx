import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { storiesApi } from "../api/stories";
import { takedownApi } from "../api/takedown";
import { AudioPlayer } from "../components/AudioPlayer";

// FR9, FR10, FR11, FR19 — full provenance + license + audio + linked variants.
export function StoryDetail() {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["stories", id],
    queryFn: () => storiesApi.getById(id),
  });

  if (isLoading) return <p className="text-adinkra-600">Loading…</p>;
  if (isError || !data) return <p className="text-red-700">Story not found.</p>;

  const { story } = data;

  return (
    <div className="max-w-2xl">
      <Link to="/" className="text-sm text-adinkra-600 hover:underline">
        ← Back to all stories
      </Link>

      <h1 className="text-2xl font-bold text-adinkra-900 mt-2">{story.title}</h1>
      <p className="text-sm text-adinkra-700 mt-1">
        Narrated by <strong>{story.narratorName}</strong> ·{" "}
        {[story.region, story.ethnicGroup].filter(Boolean).join(" · ")} · {story.language}
      </p>
      <p className="text-xs text-adinkra-500 mt-1">License: {story.license}</p>

      {story.audio && (
        <div className="mt-4">
          <AudioPlayer src={story.audio.fileUrl} />
          {story.audio.transcript && (
            <details className="mt-2 text-sm text-adinkra-700">
              <summary className="cursor-pointer">Transcript (auto-generated draft)</summary>
              <p className="mt-2 whitespace-pre-line">{story.audio.transcript}</p>
            </details>
          )}
        </div>
      )}

      {story.textBody && (
        <p className="mt-4 whitespace-pre-line leading-relaxed text-adinkra-900">{story.textBody}</p>
      )}

      {story.variants.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-adinkra-900">Other tellings of this story</h2>
          <ul className="mt-2 space-y-1">
            {story.variants.map((v) => (
              <li key={v.id}>
                <Link to={`/stories/${v.id}`} className="text-adinkra-700 hover:underline">
                  {v.title}
                </Link>
                <span className="text-xs text-adinkra-500">
                  {" "}
                  — {[v.region, v.ethnicGroup].filter(Boolean).join(" · ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <TakedownForm storyId={story.id} />
    </div>
  );
}

// FR20 / UC8 — no authentication required, per SRS.
function TakedownForm({ storyId }: { storyId: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ requesterName: "", requesterEmail: "", reason: "" });
  const mutation = useMutation({ mutationFn: () => takedownApi.create({ storyId, ...form }) });

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="mt-8 text-xs text-adinkra-500 hover:underline">
        Report a concern about this story's provenance or license
      </button>
    );
  }

  if (mutation.isSuccess) {
    return <p className="mt-8 text-sm text-adinkra-700">Thank you — an administrator will review this.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="mt-8 border border-adinkra-300 rounded-lg p-4 space-y-2"
    >
      <h3 className="font-medium text-adinkra-900">Report a concern</h3>
      <input
        required
        placeholder="Your name"
        className="w-full border border-adinkra-300 rounded-md px-3 py-1.5 text-sm"
        value={form.requesterName}
        onChange={(e) => setForm((f) => ({ ...f, requesterName: e.target.value }))}
      />
      <input
        required
        type="email"
        placeholder="Your email"
        className="w-full border border-adinkra-300 rounded-md px-3 py-1.5 text-sm"
        value={form.requesterEmail}
        onChange={(e) => setForm((f) => ({ ...f, requesterEmail: e.target.value }))}
      />
      <textarea
        required
        minLength={10}
        placeholder="What's the concern? (min. 10 characters)"
        className="w-full border border-adinkra-300 rounded-md px-3 py-1.5 text-sm"
        rows={3}
        value={form.reason}
        onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
      />
      {mutation.isError && <p className="text-sm text-red-700">{mutation.error.message}</p>}
      <button type="submit" disabled={mutation.isPending} className="text-sm px-3 py-1.5 rounded-md bg-adinkra-700 text-white">
        {mutation.isPending ? "Submitting…" : "Submit report"}
      </button>
    </form>
  );
}
