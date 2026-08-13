# Phase 11 — User Manual

**Project:** OpenFolklore
**Live at:** https://openfolklore.vercel.app

This manual documents the application as it actually runs today. Every navigation path, field, and role behavior below was exercised directly (Phase 8 Playwright pass, Phase 10 production verification) — nothing here is aspirational.

---

## 1. Installation

OpenFolklore is a hosted web application — there is nothing to install to use it. Open **https://openfolklore.vercel.app** in any modern browser (Chrome, Firefox, Safari, Edge).

To run your own copy locally instead, see [README.md](../README.md) "Quick start" — it covers both the Vercel/Neon/Blob setup (matching production) and a fully-offline fallback (local Postgres + local disk storage, no cloud accounts required).

## 2. Login

Three roles exist. **Note (UI redesign in progress):** the current login/register screens use a plain, functional Tailwind styling pass from the initial build — a dedicated UI/UX design revision is planned next and will change how these screens look, not how they behave.

**Demo/test accounts** (seeded, see [docs/phase8-testing.md](phase8-testing.md)):

| Role | Email | Password |
|---|---|---|
| Admin | admin@openfolklore.org | ChangeMe123! |
| Moderator | moderator@openfolklore.org | ChangeMe123! |
| Contributor | contributor@openfolklore.org | ChangeMe123! |

**To log in:** click **Log in** in the top-right of the nav bar → enter email and password → **Log in**. On success you're redirected to the Browse page and the nav bar updates to show your name, role, and role-appropriate links.

**To register a new account:** from the login page, click **Register**. New accounts are always created as **Contributor** — Moderator/Admin roles can only be granted by an existing Admin (see §5.4), never chosen at signup. This is deliberate (docs/phase7-implementation-plan.md §4) — it closes an obvious privilege-escalation path.

`[Screenshot: Login page with email/password fields]`
`[Screenshot: Register page with name/email/password fields]`

## 3. System Navigation

The nav bar (top of every page) is role-aware — links only appear if you're allowed to use them:

| Link | Visible to | Goes to |
|---|---|---|
| OpenFolklore (logo) | Everyone | Browse page |
| Browse | Everyone | Story listing |
| Submit a Story | Logged-in users | Submission form |
| My Submissions | Logged-in users | Your own stories + their review status |
| Moderation Queue | Moderator, Admin | Pending review queue |
| Admin | Admin only | User roles + takedown requests |
| Log in / [Your name] + Log out | Everyone | — |

`[Screenshot: Nav bar as seen by an anonymous visitor]`
`[Screenshot: Nav bar as seen by a logged-in Moderator]`

## 4. Feature Walkthrough

### 4.1 Browse and read/listen (everyone, no account needed)

The homepage lists all **published** stories. Use the search box (title/text) and the Region / Ethnic Group / Language filters to narrow results. Click any story card to open it.

On a story's page you'll see: title, narrator, region/ethnic group, language, and license — then an audio player if the story was narrated, or the story text, or both. If the story has known variants (other tellings of the same tale from a different culture), they're listed at the bottom with links.

`[Screenshot: Browse page with filter bar and story cards]`
`[Screenshot: Story detail page showing audio player and provenance line]`

**Example to try:** open "Ananse and the Pot of Wisdom" (Ghana/Akan) — once its variant link exists, "Ijapa and the Gourd of Wisdom" (Nigeria/Yoruba) appears as a related telling of the same tale-type. If you don't see the link yet, a Moderator hasn't approved/linked it — see §4.3.

**Reporting a concern:** at the bottom of any story page, "Report a concern about this story's provenance or license" opens a short form (name, email, reason) — no account needed. An Admin reviews it (§4.4).

### 4.2 Submit a story (Contributor, Moderator, or Admin)

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

### 4.3 Moderate submissions (Moderator, Admin)

**Moderation Queue** lists everything pending. Select an item to open the review panel: full text/audio, a draft transcript if one was auto-generated from audio, and three actions:

- **Approve** — publishes it immediately
- **Request Changes** — sends it back to the Contributor with your note; they can resubmit
- **Reject** — requires a reason, which the Contributor will see

You can also **link it as a variant** of any existing published story from the same panel — search by title, click **Link**. This is how the Ananse/Ijapa "hoarded wisdom" pair (§4.1) gets connected.

`[Screenshot: Moderation Queue with the review panel open]`

### 4.4 Admin tasks (Admin only)

The **Admin** page has two sections:

- **Users & Roles** — change any user's role via the dropdown next to their name. This is the only way a Contributor becomes a Moderator or Admin.
- **Open Takedown Requests** — review concerns filed from story pages (§4.1). **Dismiss** leaves the story published; **Uphold** unpublishes it immediately (it's removed from public view but not deleted — the record and its history are retained).

`[Screenshot: Admin page showing the user table and takedown list]`

### 4.5 Open data (researchers/developers)

`GET /api/stories` and `GET /api/export?format=json` (or `format=csv`) return published stories and their metadata as structured data, no authentication required — see [docs/phase6-design.md §5](phase6-design.md) for the full API reference.

## 5. Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| "Invalid email or password" on login | Wrong credentials, or account doesn't exist | Double-check the email; use Register if you don't have an account |
| Submit button stays disabled / form won't submit | A required field is empty, or neither text nor audio was provided, or the rights checkbox isn't checked | Check the inline error message under the form — it names the specific missing field |
| Audio file rejected on submit | Wrong file type, or over 4MB | Only MP3/WAV/M4A/WebM are accepted; re-encode or trim longer recordings (§6 explains the 4MB limit) |
| Submitted story never appears on Browse | It's still pending, was rejected, or changes were requested | Check **My Submissions** for its actual status and any reviewer note |
| "Moderation Queue" / "Admin" links don't appear in the nav | You're logged in with a role that doesn't have access | Only Moderators/Admins see the queue; only Admins see the Admin page — this is enforced server-side, not just hidden in the UI |
| A story you expect to see is gone | It may have been unpublished after an upheld takedown (§4.4) | This is by design, not a bug — check with an Admin if you believe it was in error |

## 6. FAQs

**Why is the audio upload limit only 4MB, when the app was originally designed for 25MB?**
The production deployment runs on Vercel's serverless platform, which caps request bodies at roughly 4.5MB. The limit was lowered to 4MB to fit safely under that ceiling rather than let large uploads fail unpredictably. See [docs/phase10-deployment.md §5](phase10-deployment.md) for the full story — it's a platform constraint, not a storage-cost decision. 4MB is still several minutes of spoken narration at a reasonable bitrate.

**Who owns the stories on this platform?**
No one — that's the point (see [docs/phase1-discovery.md](phase1-discovery.md) for the original problem framing). Published stories default to CC BY-NC-SA 4.0, displayed on every story page, with the submitter and narrator credited. See [CONTENT_LICENSE.md](../CONTENT_LICENSE.md).

**Are the seed stories real community submissions?**
No, and the platform doesn't pretend otherwise — they're labeled "Traditional (retold for the OpenFolklore seed dataset)". They're original retellings of well-documented traditional tale-types (Ghanaian Akan and Nigerian Yoruba trickster tales), written for this project rather than copied from any existing archive. See [docs/phase2-requirements.md §8](phase2-requirements.md) for the sourcing constraint and [server/prisma/seed-stories.ts](../server/prisma/seed-stories.ts) for the content itself.

**Can I use the API to build something else on top of this data?**
Yes — that's an explicit design goal (§4.5). The published dataset is openly licensed and the export endpoint exists specifically for this.

**Will the UI look like this for long?**
No — a dedicated UI/UX design pass is planned next (noted in this project's working memory as of 2026-08-13). The functional behavior documented here will stay the same; the visual design is expected to change.

---

## 7. Decision Point

This manual reflects the live application as verified in Phases 8 and 10. Confirm it's accurate against your own experience using https://openfolklore.vercel.app, then proceeding to **Phase 12 — Maintenance Plan**.
