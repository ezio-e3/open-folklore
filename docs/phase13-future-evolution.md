# Phase 13 — Future Evolution

**Project:** OpenFolklore
**Status:** Draft

This consolidates every deferred item already tracked in [docs/phase9-technical-debt.md](phase9-technical-debt.md) (D3–D8, D12–D15) into the standard forward-looking categories, plus genuinely new suggestions for categories the debt register never covered (analytics, automation, mobile, offline). Items already reasoned through elsewhere are referenced, not re-argued — this phase's job is to organize the roadmap, not repeat the debt log.

---

## 1. The Audio-First Vision (the one the user explicitly asked to defer here)

The platform's founding premise (docs/phase1-discovery.md) is audio-first — oral tradition preserved as it was actually transmitted, not just as text. Today it's honestly a reading site with audio support built in (docs/phase11-user-manual.md), because no published story has a recording yet. Closing that gap for real is the single highest-leverage future item:

- **More real narrations** — the actual bottleneck isn't code, it's content: recruiting community members (starting with the same Ghanaian/Nigerian cultural communities the seed stories represent) to record real tellings.
- **In-browser microphone recording** (D5) — currently upload-only; recording directly in the Submit form lowers the barrier for a contributor without separate recording software.
- **A richer listening experience once real audio exists** — continuous/autoplay playback across a set of stories, a narrator profile page (crediting the same voice across multiple tellings), waveform scrubbing instead of a bare native player.
- **Speech-to-text** (D6, FR12) — promote from the current no-op stub to a real pretrained-model integration, so every recording gets a searchable, accessible transcript automatically.

## 2. New Features

- **Per-user reading/listening progress** (D12) — the Landing mockup's "Continue reading" section, honestly omitted from the current build. Needs a new `ReadingProgress` entity and real position tracking, not fabricated percentages.
- **Named story collections** (D13) — the mockup's "Popular collections" (e.g. "Trickster Tales"). Conceptually adjacent to the existing variant-linking feature (FR6) but distinct: variants are pairwise, collections are named and browsable. Worth building on top of the existing tale-type thinking, not instead of it.
- **Editorial curation flag** (D14) — a `featured: boolean` + Admin toggle, small if ever wanted.
- **Normalized region/ethnic-group/language taxonomy** (D3) — turns "free-text with suggestions" into real lookup tables, enabling things like "browse all Akan tales" as a first-class concept rather than a string match.
- **True content-sniffing on uploads** (D4) — closes a real, if low-severity, spoofing gap.
- **Full email verification and/or Google OAuth sign-in** (D18) — the domain-level MX/A/AAAA check added 2026-08-13 catches a fake/typo'd domain at signup, but not a real domain with a fake mailbox; a confirmation-email-with-click-through flow (needs a mail-sending provider, currently out of scope) or OAuth (needs a registered Google Cloud OAuth client + consent-screen setup) are both genuinely bigger asks than they first appear — real, worthwhile future items rather than something to bolt on quickly.

## 3. AI Integrations

- **FR12/FR13/FR14** (D6) — speech-to-text (highest priority, lowest risk), AI-suggested variant clustering via embeddings (genuinely useful — could surface real cross-cultural tale-type matches the way the Ananse/Ijapa pair was hand-identified), text-to-speech for text-only stories (lowest priority — African-language TTS model availability is still genuinely limited, this isn't just time-boxing talk).
- **AI-assisted translation** — not just a multi-language UI (§7), but helping a story submitted in Twi reach a Yoruba-speaking reader. A meaningfully harder, higher-value problem than UI string translation.
- **AI moderation assist** — flag likely-duplicate submissions or submissions that read as copied/copyrighted text (rather than an original retelling) *before* a human moderator sees them, reducing the review burden on what's realistically going to be volunteer labor at real scale.
- **Semantic/conversational search** — "trickster tales from West Africa" as a real query over story embeddings, not just exact-match filtering.

## 4. Analytics

There is currently **no analytics of any kind** — worth naming plainly rather than leaving implicit. At demo scale that's correct; at real scale it's a gap:

- A privacy-respecting analytics tool (e.g. Plausible, not Google Analytics — consistent with the project's open, non-extractive ethos) to see which stories/cultures/regions actually get read or listened to, which should inform where outreach effort goes next.
- A public, aggregated **impact dashboard** — total stories, regions represented, API/export usage — published via the existing open-data mission rather than kept internal.

## 5. Automation

- **Finish the GitHub → Vercel connection** (flagged as incomplete in docs/phase10-deployment.md) — deploy-on-push isn't wired up yet; every deploy so far has been a manual `vercel deploy --prod`.
- **Automated dataset backups** (docs/phase12-maintenance.md §7) — the single most concrete unfinished operational item: a scheduled job hitting the existing `GET /api/export` endpoint and archiving the result, independent of Neon's built-in point-in-time recovery.
- **Dependency update automation** (Dependabot/Renovate) — currently all version bumps are manual (D8's npm audit findings, the noted Prisma major-version gap in docs/phase12-maintenance.md).
- **Moderator queue reminders** — a scheduled digest (email/Slack) when the moderation queue has items aging past some threshold, since this will realistically run on volunteer attention, not a paid support team.

## 6. Mobile App

Today: responsive web only — and this session found and fixed a real mobile nav bug (docs/phase9-technical-debt.md), so "responsive" is now actually true rather than assumed. A native app is a bigger step than this project needs yet; the pragmatic next one is a **installable PWA** (service worker, home-screen install, offline shell) — it reuses the existing React codebase almost entirely rather than starting a second client, and sets up §7 (offline support) as basically the same piece of work.

## 7. Offline Support

Currently zero — a pure online-only SPA. This deserves to be treated as more than a generic "nice to have": a meaningful share of the platform's actual target contributors (per docs/phase1-discovery.md's original framing) may have unreliable connectivity. Two concrete, mission-relevant pieces:

- **Offline-queued submission** — let a contributor record/write a story with no connection, queue it locally, and sync when back online, instead of losing the work to a dropped connection.
- **Offline story caching** — download a story (text + audio) for reading/listening without a live connection, the same value proposition as any podcast/reading app's offline mode.

## 8. Public API

Already real and live (`GET /api/stories`, `/api/stories/facets`, `/api/export`) — ahead of where a typical capstone would be at this stage, not a gap to fill from zero. Future extensions:

- API versioning and a documented stability contract, once external consumers exist to break.
- Rate-limit tiers and API keys for attribution — knowing *who* is using the open dataset is itself useful for the project's mission (funding conversations, research citations).
- Webhooks — notify a subscriber when a new story in a region/language they care about gets published, rather than requiring polling.

## 9. Multi-Language

Two distinct things, worth not conflating: the app already supports story **content** in any language (the `language` field is genuinely free-text, not an English-only assumption) — but the **UI chrome** (buttons, labels, error messages) is English-only. For a platform whose entire mission is African-language oral tradition, an English-only interface is a real tension worth resolving, not just a generic i18n checkbox: translating the UI into Twi, Ewe, Ga, Yoruba, Swahili (matching the languages already represented in the seed content) via a standard i18n library (e.g. `react-i18next`) is a mission-aligned improvement, not a cosmetic one.

## 10. Cloud Scaling

Already reasoned through in docs/phase12-maintenance.md §4 (Neon's pooled connection, Vercel's automatic function scaling) — not repeated here. Forward items once real traffic justifies them: CDN caching for the read-heavy public endpoints (`/api/stories`, `/api/stories/facets` change rarely relative to how often they'd be read), read replicas, and graduating off Neon's free tier before its limits become an incident rather than a planning item.

---

## 11. Decision Point

This is a roadmap, not a commitment — nothing here is scheduled. Confirm the categories and priorities above (§1's audio-first vision and §7's offline support are flagged as the two with the strongest tie to the project's actual stated mission, not just generic "things apps have"), then proceeding to **Phase 14 — Final Documentation**, which consolidates all fourteen phases into one submission-ready report.
