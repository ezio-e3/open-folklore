# Phase 2 — Requirements Engineering

**Project (working title):** OpenFolklore — Open African Oral Folklore Platform

**Status:** Confirmed — proceeding to Phase 3 (SRS)

**Confirmed decisions (2026-08-13):**
- Team size: **Solo.** All later effort estimation, scope, and module sequencing assume one developer for the 48-hour window.
- Seed scope: **Broader pan-African seed from launch**, not Ghana-only (supersedes the Phase 1 §5.3 scope note, which recommended a Ghana-only seed for lower sourcing risk — see the updated risk/mitigation note in §8 below).

---

## 1. Problem Definition

African oral folktales are traditionally communal, unowned, and transmitted through performance — voice, rhythm, audience call-and-response — not just plot. Several digital archives already preserve the *content* of these tales as text (africanstorybook.org, folktales.africa — see Phase 1 competitive scan), but none treat the *oral medium itself*, the *provenance* of a telling (who told it, where, in what language), or the *variation* between tellings of the same tale across communities as first-class, structured data. As oral transmission declines with urbanization and generational change, this specific dimension of the tradition — not just the stories, but how and by whom they are told, and how they differ — is being lost fastest and preserved least.

**Problem statement:** There is no open platform where community members can contribute audio-narrated folktales with structured provenance (narrator, region, ethnic group, language) and have related tellings of the same tale linked as variants, under a license that keeps the material free for non-commercial reuse by researchers, educators, and the public.

## 2. Business Context

- **Domain:** Digital cultural heritage / open data / civic & education technology.
- **Real-world anchor:** Aligns with UNESCO's 2003 Convention for the Safeguarding of the Intangible Cultural Heritage, which explicitly names oral traditions and expressions as a category of heritage at risk — this project operationalizes that concern as software rather than policy.
- **Why now:** Smartphone penetration in Ghana/West Africa now makes community audio capture realistic at low cost (a precondition that didn't exist when africanstorybook.org launched its text-first model in 2014).
- **Business drivers:** cultural preservation, open-data value for the African-language NLP/speech research community (a documented, cited need — low-resource language datasets are scarce), education/literacy support, diaspora cultural connection.
- **Relationship to Phase 1 competitors:** this project is a differentiated entrant, not a category creator — it must be positioned and built accordingly (see §5.3 of Phase 1).

## 3. Stakeholders

| Stakeholder | Type | Interest |
|---|---|---|
| Contributors (community members, storytellers, elders) | Primary | Submit stories/audio; want easy submission, attribution, control over how their contribution is used |
| Listeners/Readers (public, diaspora) | Primary | Discover, read, and listen to stories; want easy browsing, playback, trustworthy provenance |
| Moderators/Curators | Primary | Review submissions for authenticity/quality/appropriateness; want an efficient queue and variant-linking tools |
| Administrators | Primary | Manage users, roles, disputes, platform health |
| Researchers/Developers (folklorists, NLP/speech researchers) | Secondary | Need structured metadata and an open API/dataset export |
| Educators/Institutions | Secondary | Want curated, age-appropriate content for classroom use |
| Cultural-heritage NGOs/funders | Secondary | Potential partners; interested in impact and open-licensing integrity |
| Rights holders / disputing parties | Tertiary | May contest a submission's provenance or licensing — need a takedown channel |
| Exam evaluators | Tertiary (this context only) | Assess SE process rigor, not just the artifact |

## 4. User Personas

**1. Ama Boateng, 58 — Contributor**
Retired teacher in Kumasi. Knows dozens of Anansi and Akan moral tales from her grandmother. Owns a smartphone, moderate digital literacy, no patience for complicated forms. Wants to record a story on her phone and have it "just work."
*Design implication: submission flow must be short, mobile-first, and forgiving (drafts, resumable audio recording).*

**2. Kwabena Mensah, 24 — Listener (diaspora)**
Software developer living in London, born in Accra. Listens to stories to reconnect with heritage he didn't get much exposure to growing up abroad. Wants to filter by ethnic group/region and hear authentic narration, not just read text.
*Design implication: audio must be a peer feature to text, not a bolt-on; strong filter/search by provenance fields.*

**3. Dr. Efua Sarpong, 41 — Researcher**
Folklore/linguistics researcher at a university. Needs structured, exportable metadata; cares about variant tracking (comparing how a tale changes across regions) and citation-worthy provenance.
*Design implication: public API + bulk export are not "nice to have" — they're this persona's entire use case.*

**4. Kojo Aidoo, 35 — Moderator**
Community volunteer, cultural association member. Reviews submissions for authenticity and appropriateness, links variants, occasionally rejects mis-tagged or disputed content. Not a professional platform admin — needs a simple, low-friction queue, not an enterprise CMS.
*Design implication: moderation UI must be simple enough for a volunteer, not just staff.*

## 5. Functional Requirements

| ID | Requirement |
|---|---|
| FR1 | The system shall allow a registered Contributor to submit a story with a title, optional text, optional audio narration, and required provenance metadata (region and/or ethnic group, language, narrator name). At least one of text or audio must be present. |
| FR2 | The system shall support both audio file upload and in-browser microphone recording for narration. |
| FR3 | The system shall require the Contributor to affirmatively attest they have the right to share the story before submission is accepted (BR3). |
| FR4 | The system shall place new submissions into a "Pending Review" state, visible only to the submitter, moderators, and admins. |
| FR5 | The system shall allow a Moderator to Approve, Reject (with a required reason), or Request Changes on a pending submission. |
| FR6 | The system shall allow a Moderator to link a story as a variant of another existing (published) story. |
| FR7 | The system shall notify the Contributor of the moderation decision on their submission. |
| FR8 | The system shall allow any visitor (no login required) to browse and search published stories by title, region, ethnic group, language, and theme/tale-type. |
| FR9 | The system shall display, for each published story: text (if present), audio player (if present), and full provenance metadata (narrator, region, ethnic group, language, license). |
| FR10 | The system shall display, on a story's page, links to any published variants of that story. |
| FR11 | The system shall provide standard audio playback controls (play/pause/seek) for narrated stories. |
| FR12 | The system shall auto-generate a draft text transcript from uploaded/recorded audio using speech-to-text, editable by the Contributor or Moderator before publishing. |
| FR13 *(stretch)* | The system may suggest candidate variant links between a new submission and existing stories using text-similarity/embeddings, subject to Moderator confirmation (BR6). |
| FR14 *(stretch)* | The system may generate a synthesized (TTS) narration for a text-only story lacking human audio, clearly labeled as machine-generated. |
| FR15 | The system shall support user registration and login, with roles: Contributor, Listener (default/anonymous), Moderator, Admin. |
| FR16 | The system shall allow an Admin to view and change user roles. |
| FR17 | The system shall expose a public, read-only API returning published stories and their metadata in a structured format (JSON). |
| FR18 | The system shall provide a bulk export (JSON/CSV) of all published, openly-licensed content. |
| FR19 | The system shall display license, attribution, and submitter information on every published story (BR4). |
| FR20 | The system shall provide a form for any party to submit a takedown/dispute request against a published story, routed to Admins. |

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Story detail pages load in <2s on a typical broadband connection; search returns results in <1s against the demo dataset. |
| Scalability | Data model and storage approach must not require redesign to grow from a few dozen to several thousand stories (architecture-level concern; exam build only needs to demonstrate the shape, not the scale). |
| Availability | Deployed demo targets reasonable uptime for the exam/demo window; no formal SLA required at this stage. |
| Usability | Mobile-first, low-digital-literacy-friendly submission flow (Ama persona); minimal required fields to reduce drop-off. |
| Accessibility | Target WCAG 2.1 AA where feasible; every audio narration should have an accompanying text transcript (satisfied structurally by FR12) for screen-reader and hearing-impaired access. |
| Security | Authenticated sessions, role-based authorization on all write endpoints, input validation and sanitization on all submitted content, validated file type/size limits on audio uploads. |
| Privacy | Minimal PII collection; explicit consent capture at submission (FR3); no public exposure of contributor contact details without consent. |
| Internationalization | Text fields must support Unicode (non-Latin scripts, diacritics common in Ghanaian languages); region/ethnic-group/language taxonomies must be extensible, not hardcoded to a fixed enum. |
| Maintainability | Modular, layered architecture; documented public API (FR17); automated test coverage on core submission/moderation/publish flow. |
| Portability | Containerized so the build is reproducible outside the exam environment. |
| Storage | Audio files stored as objects (object storage / file storage), not as database blobs. |
| Legal/Compliance | Every published story must carry explicit license metadata (BR4); takedown requests must be actionable (FR20/BR8). |
| Open-source compliance | Codebase under a permissive open-source license (e.g., MIT); content under a Creative Commons non-commercial license by default (BR4) — the two are declared separately since code and cultural content have different appropriate licenses. |

## 7. Business Rules

| ID | Rule |
|---|---|
| BR1 | A story cannot be published unless it has at least one of {text, audio}. |
| BR2 | A story cannot be published without complete required provenance metadata: language (required), and at least one of region or ethnic group. |
| BR3 | A Contributor must explicitly attest they have the right to share the story before the system accepts the submission. |
| BR4 | Published stories default to CC BY-NC-SA unless the Contributor/Moderator selects an alternative license from an approved open-license allow-list. |
| BR5 | Only Moderator or Admin roles may change a submission's status (Pending → Published/Rejected/Changes Requested). |
| BR6 | A variant link between two stories requires explicit Moderator confirmation, even when AI-suggested (FR13) — no fully automated linking. |
| BR7 | Every rejection must include a reason, visible to the Contributor. |
| BR8 | Every takedown/dispute request must be reviewed by an Admin; the system records a timestamp and outcome for auditability. |

## 8. Constraints

- **Hard deadline:** 48-hour exam window — this is the dominant constraint shaping MVP scope decisions throughout every later phase.
- **Team size:** solo (confirmed) — this materially affects Phase 4 effort estimation and Phase 7 module sequencing; no parallelization across people is possible, only across time.
- **No dependency on scarce/unavailable third-party services for the core path:** African-language TTS (FR14) is not reliably available as a mature API, so it must remain a stretch feature, never on the critical path to a working demo.
- **Copyright integrity:** seed/demo content must be genuinely traditional/public-domain retellings or self-recorded by the student — the project cannot undercut its own "not owned, free for non-commercial use" premise by seeding from scraped copyrighted retellings.
- **Pan-African seed breadth vs. authenticity risk (confirmed decision):** seeding from launch with stories from multiple regions (not Ghana-only) increases sourcing/authenticity risk within a solo 48-hour build. Mitigation: cap the seed set to a small number of very well-documented, canonically public-domain tale families per region (e.g. Ghana — Anansi/Akan trickster tales; Nigeria — Ijapa the tortoise/Yoruba tales; Southern Africa — Zulu/Sotho trickster or origin tales; East Africa — Swahili coastal tales), all self-written/retold by the student in their own words rather than copied verbatim from any existing archive, each tagged with real, verifiable region/ethnic-group metadata. Depth over breadth: 3–4 regions with 2–3 stories each is preferable to a thin scatter across many.
- **Budget:** effectively $0 — must use free-tier hosting/storage suitable for a graded demo, not production traffic.
- **Deliverable:** must end in a working deployed demo, per the exam's stated final goal, not just source code.

## 9. Assumptions

- Evaluation is via demo + documentation + viva, not sustained production load.
- The 48-hour seed dataset will be authored/retold by the student using well-known, genuinely traditional tales across several regions (per the pan-African seed decision above), not sourced from real community outreach or copied from existing archives within the exam window.
- A single test Moderator account is sufficient to demonstrate the moderation workflow end-to-end; no real community moderators are needed during the exam.
- Speech-to-text (FR12) will use an existing pretrained model/API rather than a custom-trained one.
- English is the primary documentation/UI language; the data model must still support non-English content (see Internationalization NFR).
- The data model and taxonomy (region, ethnic group, language) are pan-African/extensible from day one, matching the confirmed broader pan-African seed scope — not a Ghana-only schema retrofitted later.

## 10. Use Cases

**Primary use case list:**

| ID | Use Case | Primary Actor |
|---|---|---|
| UC1 | Submit a Story | Contributor |
| UC2 | Moderate a Submission | Moderator |
| UC3 | Browse / Search Stories | Listener (anonymous or registered) |
| UC4 | Listen to / Read a Story | Listener |
| UC5 | Link a Story Variant | Moderator |
| UC6 | Register / Log In | All roles |
| UC7 | Export Open Dataset | Researcher/Developer |
| UC8 | Request a Takedown | Any party |
| UC9 | Manage Users & Roles | Admin |

**Detailed spec — UC1: Submit a Story**
- **Actor:** Contributor
- **Preconditions:** Contributor is logged in.
- **Main flow:** (1) Contributor selects "Submit a Story." (2) Enters title and, optionally, text. (3) Optionally records or uploads audio narration. (4) Fills required provenance metadata (language; region and/or ethnic group; narrator name). (5) Checks the rights-attestation box (FR3/BR3). (6) Submits. (7) System validates BR1/BR2 and stores the submission as "Pending Review" (FR4).
- **Alternate flow:** If neither text nor audio is provided, or required metadata is missing, the system blocks submission and shows the specific missing field(s).
- **Postconditions:** Submission enters the Moderator queue; Contributor sees a confirmation and can track status.

**Detailed spec — UC2: Moderate a Submission**
- **Actor:** Moderator
- **Preconditions:** Moderator is logged in; at least one submission is Pending.
- **Main flow:** (1) Moderator opens the queue. (2) Selects a submission; reviews text/audio/metadata (and the FR12 draft transcript, if audio-only). (3) Optionally edits the transcript. (4) Optionally links the submission as a variant of an existing story (UC5, subject to BR6). (5) Approves (→ Published) or Rejects (with reason, per BR7) or requests changes.
- **Postconditions:** Story status updated; Contributor notified (FR7).

**Detailed spec — UC4: Listen to / Read a Story**
- **Actor:** Listener (no login required)
- **Preconditions:** At least one story is Published.
- **Main flow:** (1) Listener browses or searches (UC3). (2) Opens a story page. (3) Reads text and/or plays audio narration (FR11). (4) Views provenance/license (FR9) and any linked variants (FR10).
- **Postconditions:** None (read-only); no account required, keeping the "free and open" premise concrete at the UX level, not just the licensing level.

## 11. Acceptance Criteria (sample, tied to FRs)

| Requirement | Acceptance Criterion (Given/When/Then) |
|---|---|
| FR1/BR1/BR2 | Given a Contributor omits both text and audio, or omits language/region/ethnic-group, When they submit, Then the system rejects submission and identifies the missing field(s). |
| FR3/BR3 | Given a Contributor has not checked the rights-attestation box, When they attempt to submit, Then the submit action is disabled/blocked. |
| FR5/BR5 | Given a Listener (non-moderator) attempts to approve a submission via a direct API call, When the request is made, Then the system returns an authorization error and the status does not change. |
| FR7 | Given a Moderator rejects a submission with a reason, When the action completes, Then the Contributor receives a notification containing that reason. |
| FR9/FR11 | Given a published story has an audio file, When a Listener opens the story page, Then an audio player with play/pause/seek is rendered alongside the provenance metadata. |
| FR17 | Given at least one story is Published, When a GET request is made to the public API endpoint, Then it returns that story's metadata and content fields in valid JSON, and excludes any Pending/Rejected stories. |
| FR20/BR8 | Given a takedown request is submitted, When an Admin reviews it, Then the system records a timestamp, the reviewing Admin, and the outcome. |

## 12. MoSCoW Prioritisation

**Must have** (no credible demo without these):
- Registration/login with roles (FR15)
- Submit story: text and/or audio + required provenance metadata + rights attestation (FR1–FR3)
- Pending → Moderator review → Approve/Reject with reason (FR4, FR5, FR7)
- Publish + public browse/search (FR8)
- Story detail page: text, audio playback, full provenance, license/attribution (FR9, FR11, FR19)
- Core security/validation NFRs (auth, authorization, input validation, file-type/size limits)

**Should have:**
- Speech-to-text draft transcript on audio submissions (FR12)
- Manual variant linking by Moderator (FR6, FR10)
- Public read-only API (FR17)
- Takedown/dispute form (FR20)

**Could have:**
- AI-suggested variant linking via embeddings (FR13)
- Bulk dataset export (FR18)
- TTS-generated narration for text-only stories (FR14)
- Admin user/role management UI (FR16) — can be done via direct DB/seed script if time-constrained, without losing the underlying capability

**Won't have (this iteration):**
- Multi-institution federation
- Native mobile apps
- SMS/USSD access for feature phones
- Real-time collaborative translation
- Any monetisation feature
- Analytics/reporting dashboards beyond basic moderation queue counts
- Machine translation between languages

---

## 13. Decisions Confirmed (2026-08-13)

1. **Project name:** OpenFolklore.
2. **Team size:** Solo.
3. **Seed scope:** Broader pan-African seed from launch, with the authenticity-risk mitigation in §8 (depth over breadth, self-retold canonical tales, verifiable provenance tags).

Phase 2 is locked. Proceeding to Phase 3 — Software Requirements Specification (SRS).
