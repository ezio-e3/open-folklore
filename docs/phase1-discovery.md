# Phase 1 — Project Discovery

**Exam:** CSCD602 Advanced Software Engineering Capstone (48-hour)
**Date:** 2026-08-13
**Status:** Awaiting project selection before Phase 2 (Requirements Engineering)

---

## 1. Method

Ten candidate ideas were shortlisted (from the initial brainstorm). Each is evaluated against the same fixed set of criteria so comparisons are fair, then scored 1–5 on six ranking dimensions. The 48-hour constraint is treated as a hard technical constraint, not a formality — an idea that scores well on "value" but requires data that can't realistically be sourced or seeded in the exam window is marked down on feasibility regardless of its civic merit.

A key filter applied throughout: **does the MVP depend on data you control (crowdsourced/user-generated), or data you don't control (government portals, scraped datasets, third-party APIs that may be down, gated, or nonexistent for Ghana)?** Ideas in the second bucket look impressive on paper but carry a data-availability risk that can sink a 48-hour build. This is flagged explicitly per idea.

---

## 2. Candidate Evaluation

### 2.1 Public Procurement Contract Tracker

- **Problem statement:** Public procurement contracts in Ghana are difficult for citizens, journalists, and CSOs to track — award data is fragmented across PPA bulletins, ministry press releases, and PDFs, making it hard to spot single-sourcing abuse, cost overruns, or delayed delivery.
- **Target users:** Journalists, anti-corruption CSOs (e.g. GACC, CDD-Ghana-style users), citizens, procurement officers.
- **Existing solutions:** Ghana's PPA portal (data exists but is not analytics-friendly), Open Contracting Partnership tools globally, GhanaGov procurement bulletins.
- **Why insufficient:** No structured, searchable, cross-referenced database; no anomaly detection; PDFs aren't machine-readable; no historical trend view.
- **Value proposition:** Structured, searchable contract award database with red-flag analytics (single-source rate, repeat-winner concentration, budget-vs-actual variance).
- **Estimated scope:** Large — needs a data ingestion/normalization pipeline before any UI value exists.
- **48h feasibility:** **Low.** Real value depends on real procurement data, which is not available as a clean API. You'd spend most of the 48 hours scraping/cleaning PDFs instead of building software, or fall back to fabricated demo data that undercuts the project's own thesis (transparency).
- **Future scalability:** High, if data pipeline problem solved.
- **Monetisation:** Grants, CSO partnerships, government transparency contracts.
- **Open-source potential:** Very high.
- **AI integration:** Anomaly detection on award patterns, NLP extraction from contract PDFs, summarization of contract terms.

### 2.2 Assembly Complaint & Issue Reporting Platform

- **Problem statement:** Residents have no structured digital channel to report local issues (broken infrastructure, sanitation, disputes) to Metropolitan/Municipal/District Assemblies (MMDAs); assemblies lack a triage dashboard.
- **Target users:** Residents, assembly staff, assembly members.
- **Existing solutions:** Phone calls, in-person complaints, occasional Facebook pages.
- **Why insufficient:** No tracking, no accountability trail, no prioritization, no analytics for assemblies to see recurring problem areas.
- **Value proposition:** Citizen-facing report app + assembly-facing triage/analytics dashboard.
- **Estimated scope:** Medium.
- **48h feasibility:** **High.** Pure CRUD + geolocation + status workflow + two role types (citizen, staff). No dependency on external data.
- **Future scalability:** High — could federate across all 261 MMDAs.
- **Monetisation:** Government SaaS licensing, donor funding (USAID/World Bank local governance programs).
- **Open-source potential:** High.
- **AI integration:** Auto-categorization of free-text complaints, duplicate-report clustering, priority scoring.

### 2.3 Market Price Intelligence Platform

- **Problem statement:** Food and commodity prices in Ghana's markets fluctuate significantly by region and season; farmers, traders, and consumers lack real-time, crowdsourced price transparency, making them vulnerable to price gouging and poor selling decisions.
- **Target users:** Market traders, farmers, consumers, researchers/journalists, NGOs tracking food security.
- **Existing solutions:** Ghana Statistical Service periodic bulletins (slow, aggregate-level, not real-time), Esoko (commercial, limited free access), word-of-mouth.
- **Why insufficient:** Not real-time, not granular by market/location, not free/open, not crowdsourced.
- **Value proposition:** Crowdsourced, real-time commodity price reporting by market and location, with trend visualization and an open API for researchers.
- **Estimated scope:** Medium — core loop is simple (report price → aggregate → visualize); complexity is optional (forecasting, verification).
- **48h feasibility:** **High.** Entirely built on user-generated data; no external dependency. MVP = report form + market/commodity taxonomy + trend charts + map. Very demoable.
- **Future scalability:** Very high — regional expansion, SMS/USSD reporting for feature-phone users, integration with agri-value-chain apps.
- **Monetisation:** API access for researchers/NGOs, premium analytics for traders/exporters, ads.
- **Open-source potential:** Very high.
- **AI integration:** Price forecasting (time-series), anomaly/outlier detection on submitted prices (fraud or data-entry errors), natural-language query ("what's the price of tomatoes in Kumasi this week?").

### 2.4 Clinic Queue & Appointment Manager

- **Problem statement:** Outpatient clinics (especially in under-resourced public facilities) rely on first-come-first-served physical queuing, causing long unpredictable waits and no ability to book ahead.
- **Target users:** Patients, clinic front-desk staff, clinic administrators.
- **Existing solutions:** Paper queue numbers, some private hospitals use basic digital displays.
- **Why insufficient:** No remote booking, no wait-time visibility, no analytics on patient flow/staffing needs.
- **Value proposition:** Digital queue + appointment booking + SMS notification + admin analytics on patient flow.
- **Estimated scope:** Medium.
- **48h feasibility:** **High.** Self-contained CRUD + scheduling logic; no external data dependency. SMS integration (e.g. Twilio/Africa's Talking) is optional stretch, not core-path-blocking.
- **Future scalability:** High — multi-clinic network, EHR integration, teleconsultation.
- **Monetisation:** SaaS subscription per clinic, freemium tier for small clinics.
- **Open-source potential:** Medium-high (health data sensitivity limits some openness).
- **AI integration:** Predictive wait-time estimation, no-show prediction, symptom-based triage suggestion (careful: not diagnostic).

### 2.5 University Final-Year Project Repository

- **Problem statement:** Final-year/thesis projects are rarely archived searchably; students duplicate prior work, can't discover related projects, and institutions lose an easy way to check originality.
- **Target users:** Students, supervisors, department administrators, future researchers.
- **Existing solutions:** Departmental shelves/binders, scattered Google Drive folders, some university repositories (often unsearchable, no full-text).
- **Why insufficient:** No search, no similarity/plagiarism checking, no structured metadata, not institution-agnostic.
- **Value proposition:** Searchable, tagged repository with similarity detection and AI-assisted topic discovery for new students choosing a project.
- **Estimated scope:** Medium.
- **48h feasibility:** **High.** Core = document upload/metadata/search; can seed with a modest self-collected dataset (own department's project list) rather than needing external data.
- **Future scalability:** High — multi-institution network, citation graph, research trend analytics.
- **Monetisation:** Institutional licensing.
- **Open-source potential:** High.
- **AI integration:** Embedding-based similarity/plagiarism flagging, topic clustering, "suggest a project idea based on gaps in the repository."

### 2.6 Agricultural Pest & Disease Reporting System

- **Problem statement:** Smallholder farmers lack fast channels to report and get help identifying crop pests/diseases before an outbreak spreads regionally.
- **Target users:** Farmers, agricultural extension officers, Ministry of Food and Agriculture (MoFA) staff.
- **Existing solutions:** Extension officer field visits (slow, low coverage), some NGO pilot apps (e.g. PlantVillage Nuru — not Ghana-specific/localized).
- **Why insufficient:** No localized, low-bandwidth-friendly, crowdsourced regional outbreak map.
- **Value proposition:** Photo-based report + optional AI pest/disease classification + regional outbreak heatmap for extension officers.
- **Estimated scope:** Medium-large if AI image classification is core-path (requires a trained/pretrained model, image dataset).
- **48h feasibility:** **Medium.** Reporting + heatmap is easily feasible; reliable pest/disease image classification within 48 hours is risky unless you use an existing pretrained model (e.g. a public plant-disease dataset model) rather than training your own — plan for this as a "best-effort" AI feature, not the load-bearing one.
- **Future scalability:** High — this is a genuinely high-impact food-security tool.
- **Monetisation:** Government/NGO partnership, input-supplier advertising.
- **Open-source potential:** High.
- **AI integration:** Image classification (core), outbreak trend prediction.

### 2.7 Road Hazard Reporting Platform

- **Problem statement:** Potholes, damaged signage, flooding-prone roads, and accident blackspots go unreported to road authorities in a structured way, delaying maintenance and increasing accident risk.
- **Target users:** Drivers, commuters, road authorities (e.g. Ghana Highway Authority / local assemblies).
- **Existing solutions:** Social media complaints, occasional call-in lines.
- **Why insufficient:** No structured tracking, no prioritization by severity/traffic volume, no historical accident-hotspot correlation.
- **Value proposition:** Crowdsourced hazard reporting with map visualization and severity-based prioritization for authorities.
- **Estimated scope:** Medium.
- **48h feasibility:** **High.** Same low-risk profile as 2.2/2.8 — pure user-generated data, no external dependency.
- **Future scalability:** High — integration with insurance, navigation apps.
- **Monetisation:** Government contracts, insurance-industry data licensing.
- **Open-source potential:** High.
- **AI integration:** Hotspot clustering, severity classification from report text/photos.

### 2.8 Water & Power Outage Reporting Dashboard

- **Problem statement:** Unplanned water and electricity outages ("dumsor") are common but poorly tracked — utilities (ECG, GWCL) publish planned outage schedules inconsistently, and there's no crowdsourced record of actual reliability by area.
- **Target users:** Residents, businesses, journalists, utility regulators (PURC), researchers.
- **Existing solutions:** ECG/GWCL social media/SMS notices (planned outages only, not verified against reality), no crowdsourced reliability record exists publicly.
- **Why insufficient:** No ground-truth data on actual (vs. announced) outage frequency/duration by area; no historical reliability metric citizens can use (e.g., when renting/opening a business).
- **Value proposition:** Crowdsourced outage reporting + historical reliability score per area/neighborhood, highly demoable and emotionally resonant (everyone in Ghana has a dumsor story).
- **Estimated scope:** Medium.
- **48h feasibility:** **High.** User-generated data only; core loop (report start/end of outage → aggregate → area reliability score → map) is straightforward.
- **Future scalability:** Very high — regulator partnership (PURC), utility accountability reporting, correlation with economic impact studies.
- **Monetisation:** API for researchers/journalists, premium alerts (SMS "your area has an active outage report"), ads.
- **Open-source potential:** Very high.
- **AI integration:** Outage duration prediction, anomaly detection (fake reports), pattern detection ("this transformer area fails every Tuesday").

### 2.9 Scholarship & Internship Aggregator

- **Problem statement:** Students struggle to discover relevant scholarships/internships, which are scattered across university portals, NGO sites, and social media, with no centralized deadline tracking.
- **Target users:** Students, recent graduates, career services offices.
- **Existing solutions:** Individual organization websites, scattered Facebook groups, some global aggregators (not Ghana/Africa-focused).
- **Why insufficient:** No localization, no deadline-based notification, no personalized matching.
- **Value proposition:** Centralized, searchable, AI-matched scholarship/internship listing with deadline reminders.
- **Estimated scope:** Medium — value depends on listing volume, which for a 48h MVP means manually seeding a modest curated dataset (feasible) rather than needing live scraping (risky/legally grey).
- **48h feasibility:** **High**, if scope is kept to "curated seed data + user-submitted listings" rather than "scrape the entire internet."
- **Future scalability:** High.
- **Monetisation:** Sponsored listings, referral commissions from partner organizations.
- **Open-source potential:** Medium-high.
- **AI integration:** Personalized matching (student profile → eligible opportunities), deadline-risk alerts, application-essay feedback assistant.

### 2.10 Open Budget & Spending Visualiser

- **Problem statement:** Government budget documents are long, dense PDFs; citizens can't easily see how funds are allocated or spent across sectors/regions.
- **Target users:** Citizens, journalists, CSOs, students of public policy.
- **Existing solutions:** Ministry of Finance budget statements (PDF only), Open Budget Survey reports (global, not granular/interactive for Ghana).
- **Why insufficient:** Not interactive, not machine-readable, no year-over-year comparison tooling.
- **Value proposition:** Interactive dashboard of national/sector budget allocation vs. actual spend.
- **Estimated scope:** Large — same data-availability problem as 2.1: value depends on structured budget data that doesn't exist as an API and would need to be manually transcribed from PDFs.
- **48h feasibility:** **Low**, for the same reason as the Procurement Tracker — real value requires real, structured public-finance data that isn't readily machine-readable, and a demo built on toy/fabricated numbers undercuts the project's premise.
- **Future scalability:** High, if data pipeline solved.
- **Monetisation:** CSO/donor funding, education licensing.
- **Open-source potential:** Very high.
- **AI integration:** PDF-to-structured-data extraction (the hard, valuable part), natural-language budget Q&A.

---

## 3. Ranking

Scored 1 (low) – 5 (high). **Feasibility** and **Score-likelihood** are weighted most heavily because this is a 48-hour graded exam, not an open-ended civic-tech initiative — an idea that can't be demonstrated end-to-end by the deadline cannot score well regardless of its social value.

| # | Project | Innovation | Ease of Implementation (48h) | Likelihood of High Score | Usefulness — Ghana | Usefulness — Africa | Usefulness — Global | **Total /30** |
|---|---|---|---|---|---|---|---|---|
| 2.3 | Market Price Intelligence Platform | 4 | 5 | 5 | 5 | 5 | 3 | **27** |
| 2.8 | Water & Power Outage Reporting Dashboard | 4 | 5 | 5 | 5 | 4 | 3 | **26** |
| 2.7 | Road Hazard Reporting Platform | 3 | 5 | 4 | 4 | 4 | 4 | **24** |
| 2.2 | Assembly Complaint & Issue Reporting Platform | 3 | 5 | 4 | 4 | 4 | 3 | **23** |
| 2.4 | Clinic Queue & Appointment Manager | 3 | 4 | 4 | 4 | 4 | 4 | **23** |
| 2.5 | University Final-Year Project Repository | 3 | 5 | 4 | 3 | 3 | 3 | **21** |
| 2.9 | Scholarship & Internship Aggregator | 3 | 4 | 3 | 3 | 3 | 3 | **19** |
| 2.6 | Agricultural Pest & Disease Reporting System | 4 | 3 | 3 | 5 | 5 | 3 | **23**† |
| 2.1 | Public Procurement Contract Tracker | 4 | 2 | 2 | 5 | 4 | 3 | **20**‡ |
| 2.10 | Open Budget & Spending Visualiser | 4 | 2 | 2 | 5 | 4 | 3 | **20**‡ |

† High social value pulled down hard by the AI-classification feasibility risk noted in §2.6.
‡ High social value, but real 48h execution risk is high due to data-availability problems noted in §2.1/§2.10 — recommend revisiting post-exam with a proper data pipeline, not as the capstone submission.

---

## 4. Recommendation

**Primary recommendation: 2.3 Market Price Intelligence Platform**

Reasoning:
- No dependency on external/government data — the entire dataset is user-generated from day one, which removes the single biggest risk category seen across this shortlist (2.1, 2.10, and partly 2.6).
- Natural MVP boundary: report price → validate/aggregate → visualize by market/region/time → (stretch) forecast/alert. Easy to demonstrate incrementally in a viva.
- Strong, legitimate AI integration story (forecasting, anomaly detection, NLP query) that isn't bolted on artificially.
- Directly useful and easy to explain to a Ghanaian examiner: market price volatility is a lived daily experience, which makes the problem statement and stakeholder interviews (Phase 2) easy to ground in reality rather than invented personas.
- Clean scalability story: SMS/USSD channel for feature-phone traders is a genuine, creative Africa-specific extension for Phase 13.

**Close second: 2.8 Water & Power Outage Reporting Dashboard** — nearly identical risk/value profile, arguably even more emotionally resonant ("dumsor tracker"), slightly lower global-market applicability since "dumsor" as a term/problem is more West-Africa-specific than food-price volatility (which is a universal problem, aiding the "usefulness — global" and future monetisation/portfolio story).

Both are safe, high-scoring, and honest choices for a 48-hour window. The procurement/budget-transparency ideas (2.1, 2.10) are the most prestigious-sounding but are the ones most likely to blow up the schedule — flagging that risk explicitly rather than letting ambition drive the choice is itself part of what distinction-level engineering judgment looks like.

---

## 5. Addendum — 2.11 Open African Oral Folklore Platform (Audio-First)

Proposed after the initial ranking, and evaluated against the same criteria plus a competitive scan (see §5.3), since a plausible-sounding idea in this space could easily collide with an existing incumbent.

### 5.1 Evaluation

- **Problem statement (refined):** African oral folktales are increasingly transmitted through text-only digital archives, which preserves the *content* of the tradition but loses the *oral* medium itself — voice, performance, language, and the fact that the same tale is told differently by different narrators, regions, and ethnic groups. No existing open platform treats audio narration, narrator/region provenance, and cross-cultural tale variants as first-class, structured data.
- **Target users:** General readers/listeners (including diaspora), cultural researchers/folklorists, educators and children, contributors (elders, storytellers, community members), NGOs/cultural-heritage organizations, and developers/researchers wanting an open, structured dataset (e.g. for low-resource African-language NLP/TTS work).
- **Existing solutions (verified by web research, 2026-08-13):**
  - **African Storybook Initiative** (africanstorybook.org, Saide, since 2014) — 800+ openly licensed storybooks in 120+ African languages; read/create/translate/adapt tooling; mature and NGO-backed. Text/picture-book focused.
  - **Folktales.Africa** — live community "Submit a Story" form today; CC non-commercial license with attribution; free access. Text-focused, no confirmed structured provenance metadata or audio.
  - **Mythopia** — 1,000+ stories, largest free reading library found; read-only, reuse/licensing terms unclear (not confirmed open or community-submitted).
  - **Digital African Storytelling** — academic project; 385 folktales from 33 cultural groups, preserves multiple transcriptions/translations/retellings side by side. Scholarly, not an extensible community platform.
- **Why current solutions are insufficient (evidence-based, revised from the original pitch):** The claim "no open platform for African folktales exists" is **false** — several do. What's actually missing, based on the platforms reviewed: (1) audio narration is not a first-class feature anywhere reviewed; (2) no live platform models tale variants across regions/ethnic groups as linked, structured data — only an academic, non-extensible project does anything close; (3) the one platform with live community submission (folktales.africa) uses a plain form, not structured provenance metadata (narrator, region, ethnic group, language, oral-vs-transcribed) or a visible moderation/verification pipeline.
- **Value proposition (refined):** Not "the first African folklore archive" — an audio-first platform where narration, provenance, and cross-cultural variants are first-class structured data, openly licensed and community-governed, with an open dataset/API for researchers (including the low-resource African-language NLP/TTS research community).
- **Estimated scope:** Medium-large. Core 48h loop: submit story (text + optional audio upload/recording) with structured metadata (title, region, ethnic group, language, narrator, license, original-vs-adapted) → moderation queue → publish → browse/search/listen. Stretch: tale-variant linking, AI transcription/TTS.
- **48h feasibility:** Medium-high. The core CRUD + file storage (audio) + role-based moderation loop is standard and achievable. Risk sits entirely in the AI stretch features — recommend picking **one** AI feature to implement well (most likely: speech-to-text transcription of submitted audio, since pretrained ASR models are readily available) rather than attempting transcription + local-language TTS + variant clustering all at once. This mirrors the caveat already noted for the pest/disease classifier (§2.6) — don't let an ambitious AI feature become the single point of failure for the whole submission.
- **Future scalability:** High — genuine potential to become a cited open dataset for African-language NLP/TTS research (a real, documented need), plus use by schools and cultural-heritage institutions.
- **Monetisation:** Grants/cultural-heritage funding (UNESCO, Goethe-Institut, British Council-type programs), API licensing to researchers/ed-tech, optional paid value-adds (offline packs, printed anthologies) — must be scoped so monetisation attaches to services, never to the stories themselves, to stay consistent with the stated "not owned, free for non-commercial use" mission.
- **Open-source potential:** Very high — should be MIT/CC-licensed by design, per the original brief.
- **AI integration opportunities:** speech-to-text transcription of audio submissions (primary, lowest-risk); text-to-speech narration for text-only submissions in local languages (higher risk — African-language TTS model availability is limited, treat as best-effort stretch, not core path); embedding-based tale-variant clustering (group different tellings of "the same" tale across regions); translation assistance for cross-language accessibility.
- **Licensing/business-rule flag for Phase 2:** because the core value proposition is "not owned, free for non-commercial use," the licensing model (e.g. CC BY-NC-SA on community submissions), a submitter attestation that they have the right to share the story, and a dispute/takedown process all need to be defined as explicit Business Rules — this is unusual for a typical capstone and should be treated as a first-class requirement, not an afterthought.

### 5.2 Ranking (added to the §3 table)

| # | Project | Innovation | Ease of Implementation (48h) | Likelihood of High Score | Usefulness — Ghana | Usefulness — Africa | Usefulness — Global | **Total /30** |
|---|---|---|---|---|---|---|---|---|
| 2.11 | Open African Oral Folklore Platform (audio-first) | 5 | 3 | 4 | 4 | 5 | 4 | **25** |

Sits just behind the Market Price Intelligence Platform (27) and Water & Power Outage Dashboard (26), ahead of everything else. Lower ease-of-implementation score than the pure-reporting apps because it carries real (if scoped) audio-storage and AI-transcription complexity — but higher innovation, since it isn't another "report X on a map" pattern, and it's the only idea on the list with strong cultural-heritage/global-diaspora resonance alongside genuine Ghana/Africa relevance.

### 5.3 Decision

**Selected: 2.11 Open African Oral Folklore Platform, positioned audio-first with structured provenance and tale-variant tracking.**

Scope note carried into Phase 2: for a 48-hour build, the initial content seed should likely lean Ghana-specific (Akan/Ewe/Ga/Dagbani tales — e.g. Anansi stories) for a credible, coherent demo dataset, while the data model and licensing remain pan-African/open by design so the platform is genuinely extensible post-exam. This will be revisited explicitly as a scope question in Phase 2.

---

## 6. Decision Point

**Project selected: Open African Oral Folklore Platform (audio-first, provenance + variant tracking).** Phase 1 is complete. Proceeding to Phase 2 (Requirements Engineering) on confirmation.
