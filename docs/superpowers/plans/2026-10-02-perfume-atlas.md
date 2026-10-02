# Perfume Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved independent perfume guide with a spatial boutique, sourced profiles, guided recommendations, comparison, a saved shelf and transparent seller routes, preserving public GitHub history.

**Architecture:** Use the Sites React/TypeScript starter with server-rendered content and a client-loaded Three.js scene. Versioned catalog data and pure functions own identity, offer eligibility and recommendation constraints. Browser storage owns the personal shelf; a server-only optional Jev adapter can improve bounded judgments while retaining a rules fallback.

**Tech Stack:** Bundled Vinext/React/TypeScript starter and its existing lockfile; Three.js; existing Zod and accessible UI primitives; Vitest for meaningful domain tests; Playwright for end-to-end checks. Use npm and the starter's current supported runtime (Node >=22.13.0). Resolve and pin added package versions at implementation rather than guessing them here.

**Spec:** [Approved first-release specification](../specs/2026-10-02-perfume-atlas-design.md).

## Global Constraints

- Working product/repository name: Perfume Atlas / perfume-atlas.
- The initial collection is 15 user-proposed Middle Eastern fragrances.
- User-provided rupee figures are reference prices, not checked current seller offers.
- Product pages, comparison data, prices and controls remain semantic HTML.
- All core functionality survives WebGL failure.
- No autoplay sound or required sign-up.
- Respect reduced motion and provide a simple view that retains all shopping information.
- Keep secrets and personal customer data out of the public tree.
- No open-source code license is selected implicitly by public visibility.
- Do not squash away the meaningful development history without a user request.
- No background price automation is included in the first implementation.

## Review Focus

1. Ambiguous edition or malformed comparison URL: retain separate identities, drop invalid selections and never merge seller offers by similar names. Owned by Tasks 1, 2 and 4.
2. Unknown shipping, stale prices or a reference price: never label these the verified cheapest delivered deal or guarantee budget eligibility. Owned by Tasks 2 and 5.
3. Empty recommendations after hard exclusions: explain the no-match result and offer editable constraints rather than quietly breaking them. Owned by Task 5.
4. Missing WebGL, reduced motion or failed bottle imagery: keep readable product information and all controls usable without creating substitute packaging. Owned by Tasks 3 and 7.
5. Malformed stored shelf or provider/network output: recover locally or fall back to rules without losing browsing or claiming Jev generated the result. Owned by Task 6.

## File and interface map

| Files | Responsibility |
|---|---|
| `app/layout.tsx`, `app/globals.css`, `components/site-header.tsx` | Shared accessible shell and visual system |
| `app/page.tsx`, `components/collection-explorer.tsx` | Collection, search and connected boutique selection |
| `app/perfumes/[slug]/page.tsx`, `components/perfume-detail.tsx` | Sourced exact-variant profiles and scent phases |
| `app/discover/page.tsx`, `components/discovery-flow.tsx` | Consultation and explained shortlist |
| `app/compare/page.tsx`, `components/comparison-view.tsx` | Up to three exact variants, URL selection and mobile comparison |
| `app/shelf/page.tsx`, `components/shelf-view.tsx` | Browser-owned favorites, trial notes and reset |
| `app/api/recommend/route.ts` | Validated server request with optional Jev and honest fallback |
| `lib/catalog/types.ts`, `data.ts`, `query.ts`, `validate.ts` | Canonical records, sources and read/query interface |
| `lib/offers/compare.ts` | Exact-variant eligibility and delivered-price handling |
| `lib/recommendations/types.ts`, `baseline.ts`, `explain.ts` | Constraints, scoring, diversified selection and reason templates |
| `lib/server/jev.ts`, `recommend.ts` | Provider request/validation and rules fallback |
| `lib/shelf/storage.ts`, `lib/compare/selection.ts` | Versioned local data and bounded URL selections |
| `components/boutique/boutique.tsx`, `scene.ts`, `scent-stage.tsx` | Graphics lifecycle, controlled camera and qualitative scent composition |
| `public/perfumes/`, `data/assets.json`, `docs/ASSET-SOURCES.md` | Real images, source/reuse information and missing-asset states |
| `tests/*.test.ts`, `tests/fixtures.ts`, `e2e/*.spec.ts` | Domain integrity and complete user flows |

Core record names: `Fragrance`, `Variant`, `SourceClaim`, `ScentProfile`, `WearReport`, `Seller`, `Offer`, `ReferencePrice`, `ProductAsset`, `Preferences`, `ShelfEntry`. Define them once in `lib/catalog/types.ts` or the owning feature's types file and import them elsewhere. A `Catalog` contains arrays of fragrances, variants, sellers, offers and assets, plus source claims referenced by stable IDs.

`Variant.identityStatus` is `confirmed | conflicted | unresolved`. A price state is `unknown`, `reference`, or `observed` with distinct typed fields. `Offer` records exact variant/condition, amount in INR, nullable shipping, stock and observation time. No user reference price is an `Offer`.

`Preferences` contains `maxBudgetInr`, `budgetMode: reference-ok | observed-only`, occasion, use setting, preferred presence, liked product IDs and excluded trait IDs. A reference-based candidate must retain `budgetEvidence: reference` in the result and visible copy. Unknown prices cannot establish budget fit. No preference object is placed in a shareable URL.

## Task 1: Publish documented project and establish a runnable shell

**Files:** Modify `README.md`, `.gitignore`, `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`; retain the bundled starter files and add `vitest.config.ts`, `playwright.config.ts`, `lib/compare/selection.ts`, `tests/selection.test.ts`.

**Interfaces:** Produces `parseComparisonIds(raw: string | null, validIds: ReadonlySet<string>): string[]`, preserving order, removing duplicates/invalid IDs and retaining at most three selections. Produces `npm run test`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm run test:e2e`.

- [ ] Prepare the starter in an empty scratch directory using the installed Sites `project-setup.mjs` helper; port its source into the existing repository while preserving `.git`, the approved docs, README and ignore rules. Keep the starter's package manager and lockfile.
- [ ] Add Three.js, its needed types and the test tooling using supported current versions; install with the documented Sites dependency helper. Merge ignores and preserve template notices.
- [ ] Write `tests/selection.test.ts`: `parseComparisonIds('a,a,missing,b,c,d', new Set(['a','b','c','d']))` equals `['a','b','c']`; null and invalid-only input equal `[]`.
- [ ] Run the selection test and confirm it fails because the implementation is absent, then implement the exact parser interface and rerun until it passes.
- [ ] Create the minimal branded shell with working links to Collection, Discover, Compare and My Shelf; use body text >=16px and recurring controls >=14px. Add metadata and preserve the approved visual thesis.
- [ ] Run typecheck, lint and the targeted test; load the shell through the supported preview workflow and confirm useful content renders.
- [ ] Commit the runnable shell. Create `nikhiilraj/perfume-atlas` as public with `gh repo create`, attach origin, push the existing history, and verify public visibility and remote `main` SHA. The user has explicitly authorized public repository publication. Keep credentials out of command arguments and files.

## Task 2: Build the sourced catalog and offer integrity layer

**Files:** Create `lib/catalog/{types,data,query,validate}.ts`, `lib/offers/compare.ts`, `tests/{fixtures,catalog.test,offers.test}.ts`, `data/assets.json`, `docs/ASSET-SOURCES.md`; add vetted real images under `public/perfumes/`.

**Interfaces:** Produces `getCatalog(): Catalog`, `getFragrance(slug: string): Fragrance | undefined`, `getVariants(fragranceId: string): Variant[]`, `validateCatalog(catalog: Catalog): ValidationIssue[]`, `getComparableOffers(variant: Variant, offers: readonly Offer[], now: Date): OfferComparison`. Test factories `makeVariant(overrides?)`, `makeOffer(overrides?)`, `makePreferences(overrides?)` and `makeCatalog(overrides?)` live only in `tests/fixtures.ts`.

- [ ] Write catalog tests proving 15 unique fragrance IDs, exact separate CDN variants, all source/variant links resolving, and rejection of duplicate IDs or confirmed identity with unresolved concentration.
- [ ] Write offer tests using factories: a 10ml decant cannot win a 100ml sealed-bottle comparison; another edition is excluded; an out-of-stock or older-than-24-hours observation cannot win the current default; unknown shipping yields no cheapest-delivered label. Supplied reference prices are not offers.
- [ ] Run both test files and confirm failures before implementing their respective interfaces.
- [ ] Seed all 15 planned names from the existing researched sources. Record checked dates and conflicts. Leave unverified ingredient lists, performance measurements and offer amounts absent. Do not turn supplier descriptions into wear-test facts.
- [ ] Implement validation and exact-variant offer selection. Set the first-release current-offer freshness policy to 24 hours; keep older observations viewable as historical evidence, never the current cheapest default.
- [ ] Obtain real factual product images with an asset provenance/reuse record. Use the approved asset-search workflow; never invent image URLs or draw substitute bottle labels. If publication rights cannot be established, keep the honest missing-image state and note the limitation.
- [ ] Add three to five documented seller/sample routes. Capture observed offers only when a real current exact-SKU check succeeds; otherwise retain seller links with unconfirmed price.
- [ ] Run catalog/offer tests and typecheck, then commit and push the catalog milestone.

## Task 3: Implement the collection and spatial boutique

**Files:** Modify `app/page.tsx`, `app/globals.css`; create `components/collection-explorer.tsx`, `components/boutique/boutique.tsx`, `components/boutique/scene.ts`, `e2e/collection.spec.ts`.

**Interfaces:** `CollectionExplorer({catalog}: {catalog: Catalog})` owns search/filter/selected product state. `Boutique({items, selectedId, onSelect, reducedMotion}: BoutiqueProps)` consumes display data and emits a selected fragrance ID; it does not mutate prices or recommendations.

- [ ] Write an end-to-end flow: searching Liquid Brun finds its accessible entry; selecting it reveals the correct summary and profile link; searching an absent product yields a clear empty result. Run and confirm failure before authoring that flow.
- [ ] Implement semantic collection search, family/reference-budget filters and a synchronized accessible list. Label the budget filter as reference-based when relevant.
- [ ] Create architectural shelf geometry and camera states with real bottle-image planes. Make first useful content available before scene loading. Enforce the photographic camera limits and correct aspect ratio.
- [ ] Implement selected-product focus and pointer interactions through semantic controls. Use brief continuous camera movement; for reduced motion switch viewpoints immediately. Pause animation when hidden and dispose graphics resources on unmount.
- [ ] Implement WebGL failure and missing-image states with the same product links and search functionality intact.
- [ ] Run the collection flow, inspect actual movement on desktop/mobile, check no text is occluded, and confirm reduced-motion/simple-view behavior. Commit and push.

## Task 4: Add exact perfume profiles and comparison

**Files:** Create `app/perfumes/[slug]/page.tsx`, `app/compare/page.tsx`, `components/{perfume-detail,comparison-view}.tsx`, `components/boutique/scent-stage.tsx`, `e2e/profiles-compare.spec.ts`.

**Interfaces:** `PerfumeDetail({fragrance, variants, catalog}: PerfumeDetailProps)` renders identity, evidence and selected variant. `ComparisonView({catalog, selectedVariantIds}: ComparisonViewProps)` uses the parser from Task 1 and offer results from Task 2. Scent phases are `opening | character | drydown` with qualitative text, never inferred hour measurements.

- [ ] Write browser checks: a valid profile displays source links and a limited-performance-evidence statement; an invalid slug returns not-found; selecting a different CDN edition changes its identity without merging price observations; compare URLs with repeated/invalid IDs render at most three valid selections.
- [ ] Run and confirm failure, then implement server-rendered profile content, exact variant selection and meaningful metadata.
- [ ] Build continuous qualitative scent-phase exploration using the family's reusable approved visual materials and per-product editorial text. Keep note and ingredient sections distinct; no unsupported physical radius or precise timing.
- [ ] Implement comparison adding/removing, URL persistence and a mobile layout with readable per-product values. Missing price/performance fields render honestly.
- [ ] Run profile/comparison checks and keyboard navigation; verify external seller links point to the correct documented route and cannot be mistaken for the site's own checkout. Commit and push.

## Task 5: Implement guided recommendations with transparent rules

**Files:** Create `lib/recommendations/{types,baseline,explain}.ts`, `app/discover/page.tsx`, `components/discovery-flow.tsx`, `tests/recommendations.test.ts`, `e2e/discovery.spec.ts`.

**Interfaces:** `rankCandidates(catalog: Catalog, preferences: Preferences, judgments?: readonly CandidateJudgment[]): RecommendationResult` returns up to three candidates, exclusions and a no-match reason. A candidate contains a valid variant ID, reason codes, caveats and budget-evidence state. `explainRecommendation(candidate: Recommendation, catalog: Catalog): RecommendationExplanation` uses reviewed templates and sourced attributes. `RecommendationResult.method` is `rules | jev`.

- [ ] Write tests: a ₹3,000 ceiling excludes a ₹3,500 reference candidate in reference-ok mode; observed-only mode excludes reference-only candidates; an explicitly excluded sweet trait cannot be overridden by provider scores; all-excluded input returns no candidates plus a useful reason; every returned ID resolves and results never exceed three.
- [ ] Run tests and confirm failure before implementing hard filters.
- [ ] Implement preference validation and hard filters first. For remaining candidates, score normalized 0–5 evidenced trait match and contextual recommendations, using documented weights in code. Unknown traits cannot become certain positive evidence.
- [ ] Add deterministic selection diversification: avoid three near-identical profiles when an eligible useful contrasting candidate exists. Tie-break by stable variant ID and document it.
- [ ] Build the concise consultation and result cards with two fit reasons, one material caveat, explicit method/evidence labels and edit-answers action. No enjoyment percentages or universal safe-blind-buy claim.
- [ ] Run domain tests and the browser consultation → shortlist → profile flow, including no-match and low-budget cases. Commit and push.

## Task 6: Add personal shelf and optional server-side Jev

**Files:** Create `lib/shelf/storage.ts`, `app/shelf/page.tsx`, `components/shelf-view.tsx`, `lib/server/{jev,recommend}.ts`, `app/api/recommend/route.ts`, `.env.example`, `tests/{shelf.test,jev.test}.ts`, `e2e/shelf.spec.ts`.

**Interfaces:** `readShelf(storage: StorageLike, validIds: ReadonlySet<string>): ShelfState`, `writeShelf(storage: StorageLike, shelf: ShelfState): void`, `resetShelf(storage: StorageLike): void`. Use storage key `perfume-atlas:shelf:v1` with `{version: 1, entries: ShelfEntry[]}`. `assessWithJev(candidates: readonly Variant[], preferences: Preferences, options: JevOptions): Promise<JevAssessment>` never returns prose facts. `recommend(catalog: Catalog, preferences: Preferences, options?: RecommendationOptions): Promise<RecommendationResult>` owns provider validation and fallback.

- [ ] Write storage tests for malformed JSON, unsupported version, duplicate/unknown IDs and throwing storage access. Browsing remains usable; a failed save is communicated rather than falsely confirmed.
- [ ] Write provider tests using injected fetch: absent secret, timeout, malformed payload and unknown candidate IDs return the rules method; valid bounded judgments cannot defeat the Task 5 constraints; response bodies never expose credentials.
- [ ] Run the tests and confirm failures, then implement storage recovery, favorite/trial notes and reset. State that this shelf is local and does not sync.
- [ ] Verify the current official TypeSafe request/response contract, then implement the server-only adapter with `JEV_API_KEY` from runtime secrets and a 3-second timeout. Batch independent questions, validate answers and make no live call when configuration is absent. Keep API secrets out of browser bundles and logs.
- [ ] Implement POST `/api/recommend` with schema-validated bounded inputs, a request-size limit of 16 KiB, preference validation and same-origin request checking. Anonymous browsing remains available; malformed requests return clear 400 responses.
- [ ] Run storage/provider/domain tests and shelf save → reload → edit → reset browser checks. Verify baseline and provider method labels. Commit and push.

## Task 7: Verify complete flows, accessibility and visual behavior

**Files:** Update the owning components for discovered issues; create `e2e/accessibility-fallbacks.spec.ts`, `docs/VERIFICATION.md`.

**Interfaces:** No new product interfaces. The completed application fulfills the approved route contracts and degrades to semantic content.

- [ ] Add browser tests for blocked WebGL, reduced-motion media, missing image, keyboard focus progression and malformed comparison URLs. Verify all core interactions still work.
- [ ] Run the meaningful domain suite, typecheck, lint and production build. Fix causes rather than suppressing checks.
- [ ] Inspect desktop and representative mobile viewports, 200% text zoom, contrast, layout overflow, focus visibility and actual camera transitions. Validate the first meaningful reveal in motion.
- [ ] Perform a clean install/build from tracked source in a scratch checkout. Confirm no app depends on untracked assets or a local secret. Record exact commands/results and distinguish automated checks from subjective visual review.
- [ ] Perform an independent whole-branch review using the chosen execution workflow. Resolve material findings and rerun only affected checks. Commit the fixes and verification notes; push and verify remote SHA.

## Task 8: Publish, document and hand off

**Files:** Update `README.md`, `docs/ASSET-SOURCES.md`, `docs/VERIFICATION.md`, `.env.example`, and the Sites hosting manifest as required by its tools.

**Interfaces:** Deliver a public GitHub repository with meaningful history, reproducible local commands and a successfully published site URL when hosting succeeds.

- [ ] Document installation/runtime requirements, source/evidence conventions, shelf storage, missing Jev configuration, real offer coverage, asset reuse limitations and actual checks. Do not claim measured perfume performance or tested model satisfaction.
- [ ] Scan the tracked tree and relevant Git history for secrets/runtime state before public publication. Preserve the user's Git identity and existing commits.
- [ ] Register the new Site exactly once, retain its returned identity and use the official source/publish helpers. GitHub development origin and Sites source may be distinct remotes; preserve `origin` and the same commit ancestry. Do not discard the public development history when preparing hosting source.
- [ ] Keep new-site audience private under the hosting default; the explicit public request referred to the GitHub repository. Do not silently reinterpret repository visibility as site-access permission.
- [ ] Run the normal hosting workflow with remaining checks/build and archive from the exact pushed source. Save/deploy that version and verify a successful deployment status before claiming the URL is live.
- [ ] Push final documentation to GitHub; verify repository `PUBLIC`, `main` SHA matches the local final commit and history contains the milestones. If hosting required a source-manifest commit, synchronize it to GitHub too.
- [ ] Hand off the repo and deployed URL, latest commit, verification evidence, and any unresolved facts or provider/asset limits. No scheduled updater is created.

## Self-review record

Coverage: Tasks 1–8 implement the approved scope; the unresolved-data states, offer provenance and optional-provider behavior have explicit owners. Core types/signatures are defined in the interface map and referenced consistently. Each of the five Review Focus conditions has a domain or browser test in its owning task. UI polish and asset acquisition use actual visual inspection rather than tests that mirror markup. The plan preserves the existing repository and separates public source publication from the hosting audience.

Execution recommendation: Native implementation in this chat, followed by independent whole-branch review. The modules share typed interfaces and state, so one implementer can maintain continuity efficiently while the domain tests and final review check the consequential constraints.
