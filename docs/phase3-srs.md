# Software Requirements Specification (SRS)

**Project:** OpenFolklore — Open African Oral Folklore Platform
**Document version:** 1.1
**Date:** 2026-08-13
**Prepared for:** CSCD602 Advanced Software Engineering Capstone Examination
**Status:** Approved baseline, amended in Phase 5 — proceeding to Phase 6 (System Design)

Conforms to the structure of IEEE 830 (Recommended Practice for Software Requirements Specifications). Content is derived from, and must remain consistent with, [Phase 1 — Project Discovery](phase1-discovery.md) and [Phase 2 — Requirements Engineering](phase2-requirements.md); this document formalizes those decisions and is the authoritative source from Phase 4 onward.

---

## 1. Introduction

### 1.1 Purpose

This SRS specifies the functional and non-functional requirements for OpenFolklore, a web platform for submitting, moderating, and browsing/listening to African oral folktales with structured provenance and cross-cultural variant tracking. It is intended to be sufficient, on its own, for a single developer to design (Phase 6), plan (Phase 7), build, and test (Phase 8) the system within a 48-hour window, and for an examiner to assess requirement-to-implementation traceability during the viva.

### 1.2 Scope

**In scope (this build):**
- Community submission of stories as text and/or audio narration, with structured provenance metadata (language, region, ethnic group, narrator).
- Moderator review workflow (approve/reject/request changes) prior to publication.
- Public, no-login browsing, search, and playback of published stories.
- Manual (moderator-confirmed) linking of stories as variants of one another.
- Speech-to-text draft transcription of submitted audio.
- A public read-only API and bulk export of published, openly-licensed content.
- Explicit license/attribution display and a takedown/dispute channel.
- A seed dataset spanning multiple African regions (per the confirmed pan-African scope), self-retold by the developer from well-documented, canonically public-domain tale families — not scraped from any existing archive.

**Out of scope (this iteration):** AI-suggested variant linking, text-to-speech generation for text-only stories, bulk export UI polish, multi-institution federation, native mobile apps, SMS/USSD access, real-time collaborative translation, any monetisation feature, and analytics dashboards beyond basic moderation counts. These map to the "Could" and "Won't" tiers of the Phase 2 MoSCoW prioritisation (§12 of Phase 2) and are revisited in Phase 13 — Future Evolution.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|---|---|
| Provenance | Structured metadata describing a story's origin: narrator, region, ethnic group, language, and whether it is an original oral telling or a transcribed/adapted retelling. |
| Variant | A story recorded as a distinct telling of the same underlying tale (tale-type) as another published story, linked by a Moderator. |
| ASR | Automatic Speech Recognition — used here for FR12's draft-transcript generation. |
| TTS | Text-to-Speech — synthesized narration; stretch feature (FR14) only. |
| CC BY-NC-SA | Creative Commons Attribution-NonCommercial-ShareAlike license; the platform's default content license (BR4). |
| RBAC | Role-Based Access Control. |
| PII | Personally Identifiable Information. |
| WCAG | Web Content Accessibility Guidelines. |
| MVP | Minimum Viable Product. |
| FR / NFR | Functional Requirement / Non-Functional Requirement. |
| MoSCoW | Must/Should/Could/Won't prioritisation method. |
| Tale-type | A recognized recurring narrative pattern across cultures (e.g., "trickster outwits a larger predator"), used informally here to group variants — not a formal Aarne-Thompson-Uther classification implementation. |

### 1.4 References

- [Phase 1 — Project Discovery](phase1-discovery.md) (this project), including the competitive scan of africanstorybook.org, folktales.africa, Mythopia, and Digital African Storytelling.
- [Phase 2 — Requirements Engineering](phase2-requirements.md) (this project).
- UNESCO 2003 Convention for the Safeguarding of the Intangible Cultural Heritage (real-world anchor for the problem domain, cited in Phase 2 §2).
- Creative Commons license definitions (creativecommons.org) — for BR4 license allow-list definition in Phase 6.
- IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications (structural template for this document).

### 1.5 Document Overview

Section 2 describes the product at a high level. Section 3 specifies functional requirements. Section 4 specifies non-functional requirements. Section 5 specifies external interfaces. Sections 6–8 restate constraints, assumptions, and future scope formally. Section 9 defines version control practice for both this document and the codebase. Section 10 provides the requirements traceability matrix used to verify completeness in later phases.

---

## 2. Overall Description

### 2.1 Product Perspective

OpenFolklore is a new, standalone, greenfield web system. It does not replace or integrate with any existing system (no legacy system to migrate from). It optionally depends on one external service class — a speech-to-text engine (FR12) — which must be swappable/abstracted so the core system is not hard-coupled to a specific vendor (Design and Implementation Constraint, §2.5).

### 2.2 Product Functions (Summary)

1. Story submission (text + audio + provenance + rights attestation)
2. Moderation workflow (review, approve/reject/request changes, variant linking)
3. Public discovery (browse, search, filter by provenance fields)
4. Playback and reading (audio player + text display + transcript)
5. Draft transcription (speech-to-text)
6. Account and role management
7. Open data access (public API, bulk export)
8. Licensing, attribution, and takedown handling

### 2.3 User Classes and Characteristics

| User Class | Technical Proficiency | Frequency of Use | Notes |
|---|---|---|---|
| Contributor | Low–Medium (e.g. Ama persona) | Occasional | Mobile-first; needs a short, forgiving submission flow |
| Listener | Low–High (general public, diaspora) | Frequent, casual | No account required; primary consumption path |
| Moderator | Medium (community volunteer, e.g. Kojo persona) | Regular, brief sessions | Needs an efficient queue, not an enterprise CMS |
| Admin | Medium–High | Rare | User/role management, takedown resolution |
| Researcher/Developer | High | Occasional, API-driven | Consumes FR17/FR18; does not use the web UI as primary interface |

### 2.4 Operating Environment

- Client: modern evergreen web browsers (Chrome, Firefox, Safari, Edge — last two major versions), desktop and mobile, supporting the MediaRecorder/Web Audio API for in-browser audio recording (FR2).
- Server: containerized backend (final stack decided in Phase 6), deployed to a free-tier-compatible cloud host suitable for a graded demo (Constraint, Phase 2 §8).
- Storage: relational database for structured data; object/file storage for audio assets (NFR — Storage, Phase 2 §6).
- No native mobile or desktop client in this iteration (Out of scope, §1.2).

### 2.5 Design and Implementation Constraints

- Solo developer, 48-hour build window (Phase 2 §8) — drives a strong preference in Phase 6/7 for a single deployable unit and a small number of moving parts over a distributed/microservice architecture.
- Effectively $0 budget — free-tier hosting/storage only.
- No dependency on scarce or unavailable third-party services on the critical path — ASR (FR12) must be provided by a self-hostable or reliably-available pretrained model; TTS (FR14) is explicitly excluded from the critical path given limited African-language TTS availability (Phase 2 §8).
- Codebase must carry a permissive open-source license (e.g. MIT); content must carry an open Creative Commons license by default (BR4) — these are two separate license declarations in the repository.
- Seed content must be self-authored/retold by the developer from verifiable, canonical, public-domain tale families, never scraped or copied from an existing archive (Constraint, Phase 2 §8) — this is a hard constraint on Phase 7 content-seeding work, not just a legal footnote.

### 2.6 Assumptions and Dependencies

Restated formally from Phase 2 §9:
- Evaluation is via live demo, documentation, and viva — not sustained production load.
- A single test Moderator account is sufficient to demonstrate UC2 end-to-end.
- Speech-to-text uses an existing pretrained model/library, not a custom-trained one.
- English is the documentation/UI language; the data model supports non-English content by design (NFR — Internationalization).
- The requirements in this document are frozen for the duration of the 48-hour build unless a finding in Phase 5 (Analysis) or Phase 6 (Design) requires a documented, explicit change — see §9 (Version Control) for how such a change is recorded.

---

## 3. Functional Requirements

Requirements are carried forward from Phase 2 §5 (FR1–FR20) and restated here as the frozen baseline, with formal priority and traceability. Full narrative flows for the most complex requirements (submission, moderation, public API) are expanded below the table; the remainder are fully specified by their one-line requirement statement plus the Section 10 traceability matrix.

| ID | Requirement (summary) | Priority |
|---|---|---|
| FR1 | Submit story: title + text and/or audio + required provenance metadata | Must |
| FR2 | Audio upload and in-browser microphone recording | Must |
| FR3 | Rights attestation required before submission accepted | Must |
| FR4 | New submissions enter "Pending Review" state | Must |
| FR5 | Moderator can Approve / Reject (with reason) / Request Changes | Must |
| FR6 | Moderator can link a story as a variant of another published story | Should |
| FR7 | Contributor notified of moderation decision | Should |
| FR8 | Public browse/search by title, region, ethnic group, language, theme | Must |
| FR9 | Story detail view: text, audio, full provenance, license | Must |
| FR10 | Story detail view shows linked variants | Should |
| FR11 | Standard audio playback controls | Must |
| FR12 | Auto-generated draft transcript from audio (speech-to-text) | Should |
| FR13 | AI-suggested variant links (embeddings), Moderator-confirmed | Could |
| FR14 | TTS-generated narration for text-only stories | Could |
| FR15 | Registration/login with roles (Contributor, Listener, Moderator, Admin) | Must |
| FR16 | Admin can view/change user roles | Could |
| FR17 | Public read-only API for published stories/metadata (JSON) | Should |
| FR18 | Bulk export (JSON/CSV) of published open-licensed content | Could |
| FR19 | License/attribution/submitter display on every published story | Must |
| FR20 | Takedown/dispute request form, routed to Admin; resolution transitions the Story per BR9 (v1.1) | Should |

### 3.1 Expanded Specification — FR1/FR2/FR3 (Story Submission)

- **Inputs:** title (string, required); body text (string, optional); audio file upload or in-browser recording (audio blob, optional — at least one of text/audio required per BR1); language (required, from extensible taxonomy); region and/or ethnic group (at least one required per BR2); narrator name (string, required); rights-attestation checkbox (boolean, must be true per BR3).
- **Processing:** validate BR1 (text or audio present) and BR2 (language + region/ethnic-group present) client- and server-side; reject with field-level errors if invalid; on valid submission, persist as a new Story record with status = `pending_review`; if audio present, queue it for FR12 draft transcription; store audio as an object (NFR — Storage), not inline in the database.
- **Outputs:** confirmation to Contributor with a trackable submission reference; new item appears in the Moderator queue (FR4/UC2).
- **Priority:** Must.
- **Traceability:** UC1; BR1, BR2, BR3.

### 3.2 Expanded Specification — FR5/FR6/FR7 (Moderation Decision)

- **Inputs:** Moderator's decision (Approve / Reject / Request Changes); rejection reason (required if Reject, per BR7); optional variant-link target (existing published story, per BR6); optional transcript edits (from FR12 draft).
- **Processing:** enforce BR5 (only Moderator/Admin role may invoke this action) server-side, independent of UI — i.e. authorization is checked at the API layer, not only hidden in the UI, so a direct API call from a non-privileged role is also rejected. On Approve, transition status to `published` and trigger FR7 notification. On Reject, transition to `rejected`, persist the reason, trigger FR7 notification. On Request Changes, transition to `changes_requested` with feedback visible to the Contributor.
- **Outputs:** updated Story status; notification event to the Contributor (FR7); if Approved, the story becomes visible via FR8/FR9/FR17.
- **Priority:** Must (decision action) / Should (variant linking, notification).
- **Traceability:** UC2, UC5; BR5, BR6, BR7.

### 3.3 Expanded Specification — FR17/FR18 (Public API and Export)

- **Inputs:** HTTP GET request, optionally with filter query parameters mirroring FR8 (region, ethnic group, language).
- **Processing:** query only `published`-status stories — Pending, Rejected, and Changes-Requested stories must never be reachable via this endpoint, regardless of filter parameters (this is a security/privacy requirement as much as a functional one — see NFR Security). Serialize story content and full provenance/license metadata to JSON.
- **Outputs:** JSON array of published stories (FR17); on-demand bulk file (JSON/CSV) for FR18.
- **Priority:** Should (FR17) / Could (FR18).
- **Traceability:** UC7; BR4 (license must be included in every record).

---

## 4. Non-Functional Requirements

Restated formally from Phase 2 §6, organized by IEEE-style category with measurable targets where applicable.

| Category | Requirement |
|---|---|
| Performance | Story detail pages render in <2s on typical broadband; search results return in <1s against the demo dataset (target reflects demo scale, not production load — see Scalability below). |
| Scalability | Data model and storage approach must not require redesign to grow from tens to thousands of stories; this build demonstrates the architecture's shape, not its scale. |
| Reliability / Availability | Reasonable uptime for the exam/demo window; no formal SLA at this stage; the system must degrade gracefully if the ASR dependency (FR12) is unavailable — submission must still succeed without a transcript, never block on it. |
| Usability | Mobile-first; minimal required fields in the submission flow to reduce drop-off for low-digital-literacy Contributors. |
| Accessibility | Target WCAG 2.1 AA where feasible; every audio narration must have an accompanying text transcript for screen-reader/hearing-impaired access (structurally satisfied by FR12). |
| Security | Authenticated sessions; server-side RBAC enforcement on every write endpoint (not just UI-level hiding, per §3.2); input validation and sanitization on all submitted content (defends against injection/XSS); validated file type and size limits on audio uploads. |
| Privacy | Minimal PII collection; explicit consent capture at submission (FR3); no public exposure of contributor contact details without consent; Pending/Rejected content never exposed via the public API (§3.3). |
| Internationalization | Unicode support for all text fields (non-Latin scripts, diacritics); region/ethnic-group/language values stored as an extensible taxonomy, never a hardcoded enum. |
| Maintainability | Modular, layered architecture; documented public API; automated test coverage on the submission → moderation → publish critical path. |
| Portability | Containerized for reproducible deployment outside the exam environment. |
| Storage | Audio stored as objects (file/object storage), never as database blobs. |
| Legal / Compliance | Every published story carries explicit license metadata (BR4); takedown requests are actionable and auditable (FR20/BR8). |
| Open-source compliance | Code under a permissive OSS license (e.g. MIT); content under CC BY-NC-SA by default (BR4) — declared separately in the repository. |

---

## 5. External Interface Requirements

### 5.1 User Interfaces

Responsive web UI, mobile-first. Primary screens: Home/Browse, Story Detail (text + audio player + provenance + variants), Submit Story (multi-step, short), Moderation Queue (Moderator/Admin only), Login/Register, Admin (user/role management, takedown review). Exact wireframes are produced in Phase 6.

### 5.2 Hardware Interfaces

Client device microphone, accessed only via the browser's standard MediaRecorder/Web Audio API for FR2 — no native/OS-level audio driver integration required.

### 5.3 Software Interfaces

| Interface | Purpose | Notes |
|---|---|---|
| Speech-to-Text engine | FR12 draft transcription | Must be abstracted behind an internal interface so the provider is swappable (Constraint §2.5); pretrained model/library, not custom-trained (Assumption §2.6). |
| Object/file storage | Audio asset storage | Final provider selected in Phase 6, constrained to free-tier-compatible options. |
| Public REST API | FR17/FR18 | JSON over HTTPS; read-only; unauthenticated (published content only, per §3.3). |
| Text-to-Speech engine *(stretch, FR14)* | Synthesized narration for text-only stories | Explicitly not on the critical path (Constraint §2.5); evaluated only if core scope (Must+Should) is complete with time remaining. |
| Embedding/similarity service *(stretch, FR13)* | AI-suggested variant candidates | Same treatment as FR14 — stretch only. |

### 5.4 Communication Interfaces

HTTPS only for all client-server and API traffic. REST/JSON. No real-time/WebSocket requirement identified for this scope — notifications (FR7) are satisfied by in-app/async delivery, not push/real-time messaging, unless Phase 6 finds a compelling reason to add it (none anticipated).

---

## 6. System Constraints

Formal restatement of Phase 2 §8 (see that document for full rationale): 48-hour solo build; $0 budget, free-tier hosting; no critical-path dependency on scarce services (African-language TTS excluded from critical path); seed content must be self-retold from verifiable public-domain tale families, never scraped; deliverable must be a working deployed demo, not source code alone. Final technology stack is selected in Phase 6, constrained by: must be deployable as a small number of units (ideally one) to keep solo operational overhead low, and every chosen component must have a viable free tier.

## 7. Assumptions

Formal restatement of Phase 2 §9 and SRS §2.6: solo demo-scale evaluation; self-retold pan-African seed content (depth over breadth per Phase 2 §8 mitigation); single test Moderator account sufficient; pretrained ASR; English documentation with an internationalized data model; requirements frozen for the build unless a documented change is raised in Phase 5/6.

## 8. Future Scope

Preview only — detailed in Phase 13. Candidate post-exam directions, consistent with Phase 1's scalability assessment (§2.11) and Phase 2's "Won't have" list: SMS/USSD submission for feature-phone contributors, AI-suggested variant clustering at scale (FR13 promoted from Could to Must), TTS narration for text-only stories in more languages as models mature (FR14 promoted), multi-institution/cultural-organization federation, native mobile apps, multilingual UI (not just multilingual content), and formal partnership with cultural-heritage or research bodies as an API consumer base.

## 9. Version Control

**Document versioning:** This SRS is baselined as v1.0 as of 2026-08-13. Any requirement change after this point (e.g., a finding during Phase 5 Analysis or Phase 6 Design that forces a requirement to be added, removed, or reprioritised) must be logged in a changelog appended to this section with: date, requirement ID affected, nature of change, and reason — never silently edited, so that Phase 14's consistency check has a real trail to verify against.

**Changelog:**

| Version | Date | Change | Reason |
|---|---|---|---|
| 1.0 | 2026-08-13 | Initial baseline | Formalizes Phase 2 requirements after project-name and scope confirmation |
| 1.1 | 2026-08-13 | Added Story status `unpublished`; added **BR9**: a takedown resolution of "Upheld" transitions the Story to `unpublished` (Admin-only), "Dismissed" leaves it `published` | [Phase 5 Analysis](phase5-analysis.md) found the baseline did not specify the effect of an upheld takedown on the Story itself |

**Code versioning:** Git, initialized at the start of Phase 7 (the working directory is not yet a repository). Given the solo-developer constraint (§2.5), a lightweight trunk-based workflow is recommended over long-lived feature branches: short-lived branches per module (per the Phase 7 module sequence), merged to `main` as each module reaches a working state, tagged at the final submission commit. Commit messages should reference the FR/BR IDs they implement (e.g. "FR1/FR2/FR3: story submission form + validation") to keep the traceability matrix (§10) verifiable against actual commits during the viva.

---

## 10. Traceability Matrix

Maps each functional requirement to its originating use case, governing business rule(s), and MoSCoW priority. The "Test Coverage" column is a placeholder populated in Phase 8 — included now so the matrix's final column is never retrofitted, only filled in.

| FR ID | Use Case | Business Rule(s) | NFR Link(s) | Priority | Test Coverage (Phase 8) |
|---|---|---|---|---|---|
| FR1 | UC1 | BR1, BR2, BR3 | Usability, Internationalization | Must | *TBD* |
| FR2 | UC1 | BR1 | Storage | Must | *TBD* |
| FR3 | UC1 | BR3 | Privacy | Must | *TBD* |
| FR4 | UC1 | — | — | Must | *TBD* |
| FR5 | UC2 | BR5, BR7 | Security | Must | *TBD* |
| FR6 | UC5 | BR6 | — | Should | *TBD* |
| FR7 | UC2 | BR7 | — | Should | *TBD* |
| FR8 | UC3 | — | Performance | Must | *TBD* |
| FR9 | UC4 | BR4 | — | Must | *TBD* |
| FR10 | UC4 | BR6 | — | Should | *TBD* |
| FR11 | UC4 | — | Accessibility | Must | *TBD* |
| FR12 | UC1, UC2 | — | Accessibility, Reliability | Should | *TBD* |
| FR13 | UC5 | BR6 | — | Could | *TBD* |
| FR14 | UC4 | — | — | Could | *TBD* |
| FR15 | UC6 | — | Security | Must | *TBD* |
| FR16 | UC9 | — | Security | Could | *TBD* |
| FR17 | UC7 | BR4 | Security, Privacy | Should | *TBD* |
| FR18 | UC7 | BR4 | — | Could | *TBD* |
| FR19 | UC4 | BR4 | Legal/Compliance | Must | *TBD* |
| FR20 | UC8 | BR8, BR9 | Legal/Compliance | Should | *TBD* |

---

## 11. Decision Point

This SRS baselines Phase 2's content in IEEE structure with no scope changes — it is a formalization step, not a new set of decisions. Confirm this baseline (or flag any FR/NFR that should change now, before it becomes the reference point for Phase 4's effort estimate) to proceed to **Phase 4 — Software Effort Estimation**.
