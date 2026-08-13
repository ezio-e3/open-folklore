import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { LANGUAGE_SUGGESTIONS, REGION_SUGGESTIONS } from "@openfolklore/shared";
import { storiesApi } from "../api/stories";

// FR1/FR2/FR3 — text and/or audio, provenance metadata, rights attestation.
// Audio is upload-only in this build (in-browser mic recording is the first
// item in the Phase 4 §10.3 trim, reversible later without a schema change).
export function Submit() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    textBody: "",
    language: "",
    region: "",
    ethnicGroup: "",
    narratorName: "",
    attested: false,
  });
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, String(value)));
      if (audioFile) fd.append("audio", audioFile);
      return storiesApi.submit(fd);
    },
    onSuccess: () => navigate("/", { state: { submitted: true } }),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setClientError(null);

    // Mirrors BR1/BR2/BR3 client-side (docs/phase7-implementation-plan.md §7)
    // — the server re-validates authoritatively regardless.
    if (!form.textBody.trim() && !audioFile) {
      setClientError("Add story text, an audio recording, or both.");
      return;
    }
    if (!form.region.trim() && !form.ethnicGroup.trim()) {
      setClientError("Enter at least a region or an ethnic group.");
      return;
    }
    if (!form.attested) {
      setClientError("Please confirm you have the right to share this story.");
      return;
    }
    mutation.mutate();
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-adinkra-900 mb-1">Submit a Story</h1>
      <p className="text-adinkra-700 mb-4 text-sm">
        Your submission goes to a moderator for review before it appears publicly.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          placeholder="Title"
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <textarea
          placeholder="Story text (optional if you're uploading audio)"
          rows={6}
          className="w-full border border-adinkra-300 rounded-md px-3 py-2"
          value={form.textBody}
          onChange={(e) => setForm((f) => ({ ...f, textBody: e.target.value }))}
        />
        <div>
          <label className="block text-sm text-adinkra-700 mb-1">Audio narration (MP3, WAV, M4A, or WebM, max 4MB)</label>
          <input
            type="file"
            accept="audio/mpeg,audio/mp4,audio/wav,audio/webm,audio/x-wav"
            onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              required
              list="language-suggestions"
              placeholder="Language"
              className="w-full border border-adinkra-300 rounded-md px-3 py-2"
              value={form.language}
              onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
            />
            <datalist id="language-suggestions">
              {LANGUAGE_SUGGESTIONS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
          <input
            required
            placeholder="Narrator name"
            className="w-full border border-adinkra-300 rounded-md px-3 py-2"
            value={form.narratorName}
            onChange={(e) => setForm((f) => ({ ...f, narratorName: e.target.value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              list="region-suggestions"
              placeholder="Region"
              className="w-full border border-adinkra-300 rounded-md px-3 py-2"
              value={form.region}
              onChange={(e) => setForm((f) => ({ ...f, region: e.target.value }))}
            />
            <datalist id="region-suggestions">
              {REGION_SUGGESTIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>
          <input
            placeholder="Ethnic group"
            className="w-full border border-adinkra-300 rounded-md px-3 py-2"
            value={form.ethnicGroup}
            onChange={(e) => setForm((f) => ({ ...f, ethnicGroup: e.target.value }))}
          />
        </div>
        <p className="text-xs text-adinkra-500 -mt-2">At least one of region or ethnic group is required.</p>

        <label className="flex items-start gap-2 text-sm text-adinkra-800">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.attested}
            onChange={(e) => setForm((f) => ({ ...f, attested: e.target.checked }))}
          />
          I have the right to share this story — it is a traditional tale I have permission to submit, not
          copyrighted material I do not own.
        </label>

        {(clientError || mutation.isError) && (
          <p className="text-sm text-red-700">{clientError ?? mutation.error?.message}</p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 rounded-md bg-adinkra-700 text-white font-medium"
        >
          {mutation.isPending ? "Submitting…" : "Submit for review"}
        </button>
      </form>
    </div>
  );
}
