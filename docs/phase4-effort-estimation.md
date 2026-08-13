# Phase 4 — Software Effort Estimation

**Project:** OpenFolklore
**Status:** Draft — one open question for you at the end before this baselines Phase 7's schedule

---

## 1. Framing: why this phase is unusual here

Classical effort estimation answers "given this scope, how long will it take?" so a schedule can be set. Here the schedule is already fixed — **48 hours, solo** — and the scope (Phase 3 SRS) was written before knowing whether it fits. So this phase has to answer a different question: **given 48 hours and one person, how much of the SRS actually fits, and where should the line be cut?** That reframing determines which estimation technique is actually useful here versus which ones are academically required to compare but will predictably produce numbers too coarse to act on. Both kinds are shown below, honestly labeled.

---

## 2. Method Comparison

| Method | What it needs | Fit for a 48h solo build |
|---|---|---|
| **Function Points** | Counts of inputs/outputs/inquiries/files, weighted by complexity | Size-measurement method, technology-agnostic — good for cross-checking scale, but its effort-conversion benchmarks (person-hours/FP) are calibrated for average industry delivery, not a single AI-assisted developer. Useful as a sanity check, not the primary hour estimate. |
| **Use Case Points** | Actors + use cases, already fully specified in Phase 2/3 | Best-aligned method structurally, since the SRS is already use-case-driven — but its standard 20 hrs/UCP productivity constant is calibrated for the same kind of team/process overhead as FP. Useful for *relative* complexity ranking across features, not absolute hours at this scale. |
| **COCOMO II** | Size in KSLOC, scale factors, 17 cost-driver ratings | Calibrated for projects with real team/process overhead; even at the small end of its documented range, it assumes multi-person coordination and calendar-month granularity. Included for completeness; its output is expected to overestimate hours the most severely and is treated as a scale sanity-check only. |
| **Story Points** | Relative sizing (Fibonacci) + historical velocity to convert to time | No velocity history exists — this is a first sprint on a new solo project. Points can rank relative effort, but cannot be converted to hours without invented data. Used for backlog ordering (feeds Phase 7), not for the hour budget. |
| **Expert Judgement** | Direct task-level estimation from someone who understands both the domain and the implementation | At this scale (well-decomposed FR list, known task shapes: CRUD form, auth, file upload, moderation workflow, one AI integration, one deployment), a bottom-up task breakdown by someone who can see the actual work is the most reliable method available. |

**Selected approach: Expert Judgement (bottom-up task breakdown) as the primary, actionable estimate, triangulated against Use Case Points and Function Points for scale sanity-checking, with COCOMO II and Story Points included per the comparison requirement but explicitly not used to set the hour budget.** This is standard estimation practice — reconciling a top-down size-based method against a bottom-up task-based one is stronger than trusting either alone — adapted here to a scale where the top-down methods' *absolute* numbers are known in advance to be unusable, while their *relative* signal (which features are the biggest) remains useful.

---

## 3. Function Points (comparison method)

**Data functions:**

| Type | Count | Complexity (assumed avg) | Weight | Subtotal |
|---|---|---|---|---|
| Internal Logical Files (Story, User, ModerationAction, VariantLink, TakedownRequest) | 5 | Average | 10 | 50 |
| External Interface Files | 0 | — | 7 | 0 |

**Transactional functions:**

| Type | Count | Examples | Weight | Subtotal |
|---|---|---|---|---|
| External Inputs | 6 | Submit story, register/login, moderation decision, variant link, takedown request, role change | 4 | 24 |
| External Outputs | 2 | Draft transcript generation, bulk export | 5 | 10 |
| External Inquiries | 4 | Browse/search, story detail, moderation queue, public API read | 4 | 16 |

**Unadjusted Function Points (UFP)** = 50 + 0 + 24 + 10 + 16 = **100**

**Value Adjustment Factor (VAF)** = 0.65 + (0.01 × ΣGSC), with ΣGSC estimated at ~40 across the 14 General System Characteristics (moderate-to-high on distributed access, performance, reusability, security; low on multi-site/heavy transaction volume) → VAF ≈ **1.05**

**Adjusted Function Points (AFP)** = 100 × 1.05 = **105 FP**

**Effort conversion** at a mid-range industry benchmark of ~10 person-hours/FP:

> 105 FP × 10 hrs/FP ≈ **1,050 person-hours**

## 4. Use Case Points

**Actors:**

| Actor | Classification | Weight |
|---|---|---|
| Contributor, Listener, Moderator, Admin (human, GUI) | Complex | 3 each = 12 |
| Researcher/Developer (external system via API) | Simple | 1 |

**Unadjusted Actor Weight (UAW) = 13**

**Use cases** (classified by transaction count per Phase 2/3 flows):

| UC | Complexity | Weight |
|---|---|---|
| UC1 Submit a Story | Complex | 15 |
| UC2 Moderate a Submission | Complex | 15 |
| UC3 Browse/Search | Simple | 5 |
| UC4 Listen/Read | Average | 10 |
| UC5 Link a Variant | Simple | 5 |
| UC6 Register/Login | Average | 10 |
| UC7 Export Dataset | Average | 10 |
| UC8 Request Takedown | Simple | 5 |
| UC9 Manage Users | Simple | 5 |

**Unadjusted Use Case Weight (UUCW) = 80**

**UUCP = UAW + UUCW = 13 + 80 = 93**

**Technical Complexity Factor:** ΣTFactor = 40.5 across the 13 standard technical factors (rated highest on portability, third-party API access, security, and end-user efficiency — all explicit NFRs in the SRS; rated 0 on "special training facilities," since the platform must be self-service).
**TCF = 0.6 + (0.01 × 40.5) = 1.005**

**Environmental Factor:** ΣEFactor = 23.5 across the 8 environmental factors (high motivation and stable requirements pull it up; full-time solo commitment and moderate language familiarity keep the negative factors low).
**EF = 1.4 + (−0.03 × 23.5) = 0.695**

**UCP = UUCP × TCF × EF = 93 × 1.005 × 0.695 ≈ 65 UCP**

**Effort conversion** at Karner's standard 20 hrs/UCP:

> 65 UCP × 20 hrs/UCP ≈ **1,300 person-hours**

## 5. COCOMO II (comparison method, expected weakest fit)

Backfiring AFP (105 FP) to size at ~50 SLOC/FP → **Size ≈ 5.25 KSLOC**.

Effort (person-months) = A × Size^E × ∏EM, with A = 2.94, E = B + 0.01×ΣSF ≈ 0.91 + 0.15 = 1.06 (small, flexible, solo-but-experienced profile), ∏EM assumed ≈ 1 (nominal cost drivers, not individually rated — see caveat below):

> 2.94 × (5.25)^1.06 ≈ 2.94 × 5.80 ≈ **17.1 person-months ≈ 2,600 person-hours**

**Caveat:** COCOMO II's constants are calibrated for projects with real multi-person coordination overhead and its documented reliable range assumes that overhead exists. This build has none of it — no handoffs, no cross-team communication, no formal change control. The 17-month figure is not a credible estimate for this project; it's included only because the comparison was requested, and its distance from reality is itself informative (see §7).

## 6. Story Points (relative sizing, not hour-convertible)

| Feature grouping | Points (Fibonacci) |
|---|---|
| Auth (register/login/roles) | 5 |
| Story submission form + validation + attestation | 8 |
| Audio upload/recording | 5 |
| Moderation queue + decision workflow | 8 |
| Variant linking | 3 |
| Browse/search | 5 |
| Story detail + audio player | 5 |
| Speech-to-text integration | 8 |
| Public API | 5 |
| Takedown form | 2 |
| License/attribution display | 2 |
| Deployment | 5 |
| Seed content authoring | 5 |

**Total ≈ 69 points.** No velocity exists (first sprint, new solo project) so this cannot be converted to hours without fabricating a number. What it *does* confirm: the same features score highest here (submission form, moderation queue, ASR integration) as scored highest in UCP's use-case complexity ranking (UC1, UC2 both rated Complex) — two independently-reasoned relative-sizing methods agree on where the effort concentrates, which is useful triangulation even without an hour output.

## 7. Triangulation

Function Points (~1,050h), Use Case Points (~1,300h), and COCOMO II (~2,600h) — three independent size-based methods — all agree the **full SRS scope, at normal industry delivery rates, is a multi-month project** (roughly 6–17 person-months depending on method). That agreement is the actual finding from this half of the analysis: **it is not possible to build everything in the Phase 3 SRS in 48 hours**, at any realistic productivity rate. This isn't a flaw in the estimate — it's exactly why Phase 2 already did MoSCoW prioritisation. The size-based methods confirm the prioritisation was necessary; they don't tell us the achievable hour budget, because their productivity constants don't describe a solo, AI-assisted, framework-scaffolded build. For that, we need Expert Judgement.

## 8. Expert Judgement (primary estimate)

Bottom-up, task-level, assuming a solo developer using a modern framework and AI-assisted coding (a materially faster mode than the manual, unassisted throughput the classical constants above assume — stated explicitly as an estimation assumption, not a hidden one).

**Must-have tasks:**

| # | Task | Hours |
|---|---|---|
| 1 | Project setup, repo init, base architecture scaffold | 2 |
| 2 | Data model / schema (Story, User, ModerationAction, VariantLink, TakedownRequest) | 2 |
| 3 | Auth + RBAC (FR15) | 3 |
| 4 | Story submission form: text/audio inputs, metadata, validation (FR1–FR3) | 5 |
| 5 | Audio upload + in-browser recording (FR2) | 3 |
| 6 | Moderation queue + approve/reject/request-changes + notification (FR4, FR5, FR7) | 5 |
| 7 | Public browse/search (FR8) | 3 |
| 8 | Story detail page: text, player, provenance, license (FR9, FR11, FR19) | 3 |
| 9 | Seed content authoring (self-retold, multi-region, per Phase 2 §8 mitigation) | 3 |
| 10 | Responsive styling pass | 3 |
| 11 | Testing on the critical submission→moderation→publish path | 4 |
| 12 | Deployment (containerize, deploy, configure) | 3 |
| 13 | Documentation + debugging/contingency buffer | 4 |
| | **Must-have subtotal** | **43 hours** |

**Should-have tasks (stretch queue, attempted in this order only after Must-have is done):**

| # | Task | Hours |
|---|---|---|
| A | Public read-only API (FR17) | 2 |
| B | Takedown/dispute form (FR20) | 2 |
| C | Variant linking (FR6, FR10) | 2 |
| D | Speech-to-text draft transcript (FR12) | 4 |
| | **Should-have subtotal (all four)** | **10 hours** |

**Full Must + Should = 53 hours.**

---

## 9. Final Estimate and Duration

- **Committed baseline (Must-have only): 43 person-hours**, against a 48-hour window — a 5-hour contingency margin.
- **Full stretch scope (Must + Should): 53 person-hours** — 5 hours *over* budget if all four stretch items are attempted; realistic only if Must-have goes faster than estimated.
- **Recommendation:** commit to the 43-hour Must-have baseline as the real plan; treat A→B→C→D as a strictly ordered stretch queue attempted only with hours remaining, stopping at any point without risk to the core deliverable. Order A→B→C→D is deliberate: FR17 (API) is cheapest and most directly serves the project's "open dataset" mission; FR12 (speech-to-text) is both the most expensive and the most integration-risk stretch item, so it's attempted last, not first — a genuinely nice-to-have AI feature should never be allowed to threaten the Must-have core.

### Calendar-time caveat — resolved

**Confirmed: ~24 effective hours available across the 48-hour window** (2026-08-13). This is below the 43-hour Must-have baseline computed under classical (manual-coding) person-hour assumptions.

One distinction worth being precise about: the 43 hours above is a **scope/effort measure** — a standard unit for "how much work this is" — not a prediction of wall-clock session time. Because implementation in Phase 7 is AI-assisted (this session writes and runs the code directly, rather than a human typing every line), actual elapsed time to produce the Must-have scope will be substantially less than 43 hours of session time. What the 24-hour figure really budgets is **your** time: reviewing output, making decisions at phase boundaries, testing the live app, and recording content for the seed dataset (a task only you can do, since it requires an actual human voice). That human-bound work doesn't compress the same way code generation does, so it's the real constraint — which is exactly why the trim below is applied as a safety margin rather than skipped.

---

## 10. How This Estimate Changes Scope

1. The three size-based methods confirm the full SRS is not buildable in 48 hours at any realistic rate — full-scope was never the plan (Phase 2 MoSCoW already anticipated this), but it's now confirmed numerically rather than just by intuition.
2. The Expert Judgement breakdown gives an actionable number: **43 hours for Must-have** (classical effort units), with a **strictly ordered Should-have stretch queue (A→B→C→D, 10 hours)** attempted only as time allows.
3. **Confirmed trim applied**, since the 24-hour human-review/recording budget is tighter than even the 43-hour Must-have figure: support audio **file-upload only** for FR2 in the initial build (in-browser microphone recording deferred — same functional requirement, thinner implementation), seed content trimmed to **2 regions** instead of 3–4 (still satisfies the pan-African, non-Ghana-only decision from Phase 2, just narrower), and styling simplified to a **single clean responsive baseline** rather than a full polish pass. None of these touch a Must-have functional requirement — only their depth/polish — and all three are explicitly reversible if time allows (Should-have queue, then these, in that order).

---

## 11. Assumptions and Constraints (this phase)

- Solo developer, AI-assisted, modern framework — materially faster than the unassisted industry throughput the FP/UCP/COCOMO constants assume (stated assumption, not hidden in the numbers).
- No historical velocity exists for Story Points; used for relative ordering only.
- FP/UCP/COCOMO effort conversions use standard published benchmarks (10 hrs/FP, 20 hrs/UCP, 2.94/0.91 COCOMO II constants) — not calibrated to this developer specifically, by design, since their purpose here is triangulation against an external baseline, not a usable hour figure.
- The 43-hour Must-have figure assumes no major blocking unknowns in the chosen tech stack (finalized in Phase 6) — Phase 5 (Analysis) and Phase 6 (Design) may surface risks that revise this number, per the SRS §9 change-log policy.

---

## 12. Decision — Confirmed

**~24 effective hours confirmed.** Trim from §10.3 applied to the baseline now. Phase 4 is locked. Proceeding to **Phase 5 — Analysis** (domain analysis, entity analysis, business workflow, risk analysis, data flow, system behaviour).
