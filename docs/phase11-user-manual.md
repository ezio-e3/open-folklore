# Phase 11 — User Manual

**Project:** OpenFolklore
**Live at:** https://openfolklore.vercel.app
**Updated 2026-08-13** after the Landing page redesign (from a Claude Design mockup) changed the homepage, navigation, and login redirect — this revision reflects that, not the original launch layout.

This manual documents the application as it actually runs today. Every navigation path, field, and role behavior below was exercised directly (Phase 8 Playwright pass, Phase 10 production verification, and a full 12-point functional re-audit after the redesign) — nothing here is aspirational.

**OpenFolklore is a reading site today, with audio support built in and growing.** Every story records a narrator, region, and language, and the platform fully supports narrated audio (upload, storage, playback with seeking) — but no published story currently has a recording. The homepage reflects this honestly: reading is the primary path, audio narration is described as something the community adds over time, not oversold as the current default experience.

---

## 1. Installation

OpenFolklore is a hosted web application — there is nothing to install to use it. Open **https://openfolklore.vercel.app** in any modern browser (Chrome, Firefox, Safari, Edge).

To run your own copy locally instead, see [README.md](../README.md) "Quick start" — the default path is a fully-isolated local Postgres container and local disk storage, no cloud accounts required and never touching real production data (docs/phase9-technical-debt.md D17). Pointing local dev at real Neon/Blob is possible but deliberately not the default.

## 2. Login

Three roles exist.

**Demo/test accounts** (seeded, see [docs/phase8-testing.md](phase8-testing.md)):

| Role | Email | Password |
|---|---|---|
| Admin | admin@openfolklore.org | ChangeMe123! |
| Moderator | moderator@openfolklore.org | ChangeMe123! |
| Contributor | contributor@openfolklore.org | ChangeMe123! |

**To log in:** click **Sign in** in the top-right of the nav bar → enter email and password → **Log in**. On success you're redirected to the homepage and the nav bar updates to show your name, role, and role-appropriate links.

**To register a new account:** click the prominent **Get started** button in the nav bar (not a small link buried elsewhere — an earlier version of this app only had a text link on the Login page, which real users reported as effectively invisible; see docs/phase9-technical-debt.md D11). New accounts are always created as **Contributor** — Moderator/Admin roles can only be granted by an existing Admin (see §4.5), never chosen at signup. This is deliberate (docs/phase7-implementation-plan.md §4) — it closes an obvious privilege-escalation path.

`[Screenshot: Login page with email/password fields]`
`[Screenshot: Register page with name/email/password fields]`

## 3. System Navigation

The nav bar (top of every page) merges a public discovery structure with role-aware links — the discovery links are always visible, the rest only appear if you're allowed to use them:

| Link | Visible to | Goes to |
|---|---|---|
| OpenFolklore (logo) | Everyone | Homepage (Landing) |
| Discover | Everyone | Browse — full search/filter story listing |
| Countries | Everyone | Regions with published stories, and how many each has |
| Languages | Everyone | Same, grouped by language |
| Search icon | Everyone | Browse (where the real search box lives) |
| Submit a Story | Logged-in users | Submission form |
| Library | Logged-in users | My Submissions — your own stories + their review status |
| Moderation Queue | Moderator, Admin | Pending review queue |
| Admin | Admin only | User roles + takedown requests |
| Sign in / Get started, or [Your name] + Log out | Everyone | Login/Register, or logs you out |

`[Screenshot: Nav bar as seen by an anonymous visitor]`
`[Screenshot: Nav bar as seen by a logged-in Moderator]`

## 4. Feature Walkthrough

### 4.1 The homepage

The homepage is a curated view built from real published stories — not placeholder content. It shows: a hero introducing the project, "From the archive" (a sample of published stories), "Featured cultures" (real counts of stories per ethnic group, clicking one pre-filters Discover), "Recently added" (newest published stories), and a community/GitHub callout. A "Fireside recordings" section for narrated stories exists in the code but only appears once at least one published story actually has audio — it won't show an empty or fake section in the meantime.

`[Screenshot: Homepage hero and "From the archive" section]`
`[Screenshot: "Featured cultures" and "Recently added" sections]`

### 4.2 Discover, Countries, and Languages (everyone, no account needed)

**Discover** (`/browse`) is the full listing. Use the search box (title/text) and the Region / Ethnic Group / Language filters to narrow results — or arrive here pre-filtered by clicking a culture on the homepage or an entry on the Countries/Languages pages. Click any story card to open it.

On a story's page you'll see: title, narrator, region/ethnic group, language, and license — then an audio player if the story was narrated, or the story text, or both. If the story has known variants (other tellings of the same tale from a different culture), they're listed at the bottom with links.

`[Screenshot: Discover/Browse page with filter bar and story cards]`
`[Screenshot: Story detail page showing provenance and license]`
`[Screenshot: Countries page with region counts]`

**Example to try:** open "Ananse and the Pot of Wisdom" (Ghana/Akan) — once its variant link exists, "Ijapa and the Gourd of Wisdom" (Nigeria/Yoruba) appears as a related telling of the same tale-type. If you don't see the link yet, a Moderator hasn't approved/linked it — see §4.4.

**Reporting a concern:** at the bottom of any story page, "Report a concern about this story's provenance or license" opens a short form (name, email, reason) — no account needed. An Admin reviews it (§4.5).

### 4.3 Submit a story (Contributor, Moderator, or Admin)

Log in, then **Submit a Story**. Fields:

- **Title** (required)
- **Story text** — required unless you provide audio
- **Audio narration** — MP3, WAV, M4A, or WebM, max 4MB (see §6 for why the limit is 4MB, not a larger number)
- **Language** (required) — a dropdown of suggestions appears as you type, but any value is accepted
- **Region** and/or **Ethnic group** — at least one is required
- **Narrator name** (required)
- **Rights checkbox** (required) — confirms you have the right to share this story

Submit sends it for review — it will not appear on the public Browse page until a Moderator approves it. Check **My Submissions** any time to see its status (Pending review / Published / Rejected / Changes requested / Unpublished) and, for rejections, the reason given.

`[Screenshot: Submit a Story form, filled in]`
`[Screenshot: My Submissions page showing status badges]`

### 4.4 Moderate submissions (Moderator, Admin)

**Moderation Queue** lists everything pending. Select an item to open the review panel: full text/audio, a draft transcript if one was auto-generated from audio, and three actions:

- **Approve** — publishes it immediately
- **Request Changes** — sends it back to the Contributor with your note; they can resubmit
- **Reject** — requires a reason, which the Contributor will see

You can also **link it as a variant** of any existing published story from the same panel — search by title, click **Link**. This is how the Ananse/Ijapa "hoarded wisdom" pair (§4.2) gets connected.

`[Screenshot: Moderation Queue with the review panel open]`

### 4.5 Admin tasks (Admin only)

The **Admin** page has two sections:

- **Users & Roles** — change any user's role via the dropdown next to their name. This is the only way a Contributor becomes a Moderator or Admin.
- **Open Takedown Requests** — review concerns filed from story pages (§4.2). **Dismiss** leaves the story published; **Uphold** unpublishes it immediately (it's removed from public view but not deleted — the record and its history are retained).

`[Screenshot: Admin page showing the user table and takedown list]`

### 4.6 Open data (researchers/developers)

`GET /api/stories` and `GET /api/export?format=json` (or `format=csv`) return published stories and their metadata as structured data, no authentication required — see [docs/phase6-design.md §5](phase6-design.md) for the full API reference.

## 5. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "Invalid email or password" on login | Wrong credentials, or account doesn't exist | Double-check the email; use Register if you don't have an account |
| Submit button stays disabled / form won't submit | A required field is empty, or neither text nor audio was provided, or the rights checkbox isn't checked | Check the inline error message under the form — it names the specific missing field |
| Audio file rejected on submit | Wrong file type, or over 4MB | Only MP3/WAV/M4A/WebM are accepted; re-encode or trim longer recordings (§6 explains the 4MB limit) |
| Submitted story never appears on Browse | It's still pending, was rejected, or changes were requested | Check **My Submissions** for its actual status and any reviewer note |
| "Moderation Queue" / "Admin" links don't appear in the nav | You're logged in with a role that doesn't have access | Only Moderators/Admins see the queue; only Admins see the Admin page — this is enforced server-side, not just hidden in the UI |
| A story you expect to see is gone | It may have been unpublished after an upheld takedown (§4.5) | This is by design, not a bug — check with an Admin if you believe it was in error |

## 6. FAQs

**Why is the audio upload limit only 4MB, when the app was originally designed for 25MB?**
The production deployment runs on Vercel's serverless platform, which caps request bodies at roughly 4.5MB. The limit was lowered to 4MB to fit safely under that ceiling rather than let large uploads fail unpredictably. See [docs/phase10-deployment.md §5](phase10-deployment.md) for the full story — it's a platform constraint, not a storage-cost decision. 4MB is still several minutes of spoken narration at a reasonable bitrate.

**Who owns the stories on this platform?**
No one — that's the point (see [docs/phase1-discovery.md](phase1-discovery.md) for the original problem framing). Published stories default to CC BY-NC-SA 4.0, displayed on every story page, with the submitter and narrator credited. See [CONTENT_LICENSE.md](../CONTENT_LICENSE.md).

**Are the seed stories real community submissions?**
No, and the platform doesn't pretend otherwise — they're labeled "Traditional (retold for the OpenFolklore seed dataset)". They're original retellings of well-documented traditional tale-types (Ghanaian Akan and Nigerian Yoruba trickster tales), written for this project rather than copied from any existing archive. See [docs/phase2-requirements.md §8](phase2-requirements.md) for the sourcing constraint and [server/prisma/seed-stories.ts](../server/prisma/seed-stories.ts) for the content itself.

**Can I use the API to build something else on top of this data?**
Yes — that's an explicit design goal (§4.6). The published dataset is openly licensed and the export endpoint exists specifically for this.

**Will the UI look like this for long?**
The homepage and navigation (§3, §4.1) were redesigned from a real Claude Design mockup on 2026-08-13 and reflect the intended look. The rest of the app — Login/Register/Submit/Discover/story detail/Moderation/Admin — still uses the original functional styling from initial launch and is next in line for the same treatment (docs/phase9-technical-debt.md D15). The functional behavior documented here won't change; the visual design of those remaining pages will.

**Why does the homepage talk about reading, not listening, when the project is meant to be audio-first?**
Because that's what's actually true right now, not because the ambition changed. Every story records full provenance and the platform fully supports narrated audio — upload, storage, and playback with seeking all work — but no published story has a recording yet, so the homepage doesn't claim otherwise. A richer audio-first experience (more real narrations, and eventually things like autoplay listening) is real future work, not a broken promise today.

---

## 7. Decision Point

This manual reflects the live application as verified in Phases 8 and 10, and re-verified against the redesigned homepage/nav with a full 12-point functional audit on 2026-08-13. Confirm it's accurate against your own experience using https://openfolklore.vercel.app.
