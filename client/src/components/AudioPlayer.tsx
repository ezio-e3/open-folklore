// FR11 — play/pause/seek. Native <audio controls> is used deliberately rather
// than a custom player: it's keyboard- and screen-reader-accessible out of
// the box (Accessibility NFR, docs/phase3-srs.md §4) and the seek bar works
// because the server serves /uploads with Accept-Ranges support
// (docs/phase6-design.md §5) — no custom streaming logic needed on either side.
export function AudioPlayer({ src }: { src: string }) {
  return (
    <audio controls preload="metadata" className="w-full" src={src}>
      Your browser does not support audio playback.
    </audio>
  );
}
