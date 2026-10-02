# Perfume Atlas — first-release build specification

Date: 2 October 2026

Status: approved by the user on 2 October 2026. This document specifies the first implementation; it does not describe a completed application.

## 1. Agreed purpose and success

Build an independent perfume guide and seller-comparison website for Indian buyers. Visitors should understand fragrance character in familiar terms, form a personally useful shortlist, find a sample route, and compare buying options with clear evidence. Use an attractive spatial boutique without requiring a bespoke 3D model for every bottle.

Maintain meaningful Git commits throughout development and publish the project in a public GitHub repository. Working product/repository name: Perfume Atlas / perfume-atlas. This is a working name, not a trademark clearance claim.

The initial collection is 15 user-proposed Middle Eastern fragrances. User-provided rupee figures are reference prices, not checked current seller offers. The experience must never silently promote a reference figure into a live deal.

Success for the first implementation means the complete browse → discover → inspect → compare → sample/buy-link journey works on desktop and mobile; sources and unknowns remain visible; recommendations respect explicit constraints; and the site can run without a Jev credential.

## 2. Selected approach and alternatives

Selected: a conventional accessible website with a client-loaded 3D boutique as its exploration surface. Product pages, comparison data, prices and controls remain semantic HTML. A versioned catalog and a pure recommendation engine make the first release inspectable and maintainable. Add a server-side provider adapter for Jev with an honest rules fallback.

Alternative A: a completely free-roaming 3D store. This adds navigation, asset and accessibility cost without established decision benefit. Do not use for the first release.

Alternative B: a conventional catalog with isolated decorative bottle animations. Easier to implement, but lacks the connected spatial exploration requested by the user. Preserve this as the graphics fallback, not the main visual direction.

## 3. Visual direction and primary viewport

Visual thesis: a contemporary perfume boutique with walnut/charcoal displays, warm directional light, clear pale surfaces and editorial typography. Real bottle assets remain the focal point. Avoid a dashboard grid of anonymous cards as the primary desktop experience.

The first viewport exposes the collection, search, and the actions Find my perfume and Compare. Do not require scrolling past a marketing page or an introduction animation to begin.

Use controlled camera movement between displays and the selected perfume's scent composition. Limit movement to viewpoints supported by the available photography. Do not fabricate a 360-degree bottle view from one front image.

Use 3D geometry for simple architectural display surfaces and lighting. Use real product photographs or transparent cutouts for the bottles, with recorded source and reuse status. Use approved or appropriately licensed imagery for representational note references. Avoid generated counterfeit bottle labels or made-up packaging.

Motion and visuals are editorial scent metaphors, not a digital reproduction of smell or measured ingredient proportions. Default audio is off. Respect reduced motion and provide a simple view that retains all shopping information.

## 4. Application surfaces

### Collection: `/`

- Search by product and brand; filter by scent family and reference-budget range.
- Spatial shelf and an accessible synchronized product list.
- Select a perfume to focus its display and open its description.
- Direct links to the profile, discovery consultation, comparison and saved shelf.
- Clear handling for no search results and unavailable graphics.

### Perfume profile: `/perfumes/:slug`

- Real product image, canonical identity and exact variant selector where needed.
- One-sentence sensory summary and evidence label.
- A continuous opening → main character → drydown composition; qualitative phases unless tested timings exist.
- Brand-published notes separated from the ingredient declaration and editorial interpretation.
- Context recommendations and reasons the user might dislike it.
- Performance section that states limited evidence until original or attributable wear observations exist. No invented hours or projection distances.
- Source links, checked dates and unresolved conflict labels.
- Comparison/shelf actions and separate sample versus bottle seller routes.
- Invalid slugs return a genuine not-found state.

### Guided discovery: `/discover`

- Short consultation using budget, occasion, climate/use setting, preferred presence, familiar liked fragrances and explicit dislikes.
- Each question can be answered without fragrance jargon. Optional inputs remain optional.
- Return up to three differentiated candidates with reasons, a material drawback and evidence quality.
- Respect the exact hard constraints deterministically. If no candidate fits, state that and allow editing the relevant constraints.
- Avoid percentage claims of predicted enjoyment. No forced account creation.

### Compare: `/compare`

- Compare up to three distinct fragrance variants.
- Show scent character, context, evidenced performance, reference/observed price status, caveats and sample/bottle routes.
- Comparison selection can be shared through URL identifiers without embedding private preference data.
- Mobile comparison remains readable without uncontrolled page-wide horizontal scrolling.

### My Shelf: `/shelf`

- Save favorites and samples tried; record liked/disliked traits and brief personal notes.
- Store locally in the browser for the first release, with a clear reset option and an explanation that data does not sync across devices.
- Show candidate overlap with saved scents as an editorial similarity judgment, not an exact clone claim.
- Corrupt or old local records must recover without breaking browsing.

## 5. Initial catalog and identity rules

The 15 proposed fragrances:

1. Rasasi Hawas For Him, original.
2. French Avenue Liquid Brun, original.
3. Afnan 9 PM, original.
4. French Avenue Vulcan Feu.
5. Afnan Supremacy Collector's Edition — interpretation of the supplied CE abbreviation, visibly provisional until confirmed.
6. Al Haramain Amber Oud Aqua Dubai.
7. Armaf Club de Nuit Intense Man — Pure Parfum and Limited Edition as separate variants.
8. Rasasi Fattan Pour Homme.
9. Maison Alhambra Glacier Bold.
10. Armaf Club de Nuit Iconic EDP.
11. French Avenue Spectre Ghost.
12. Lattafa Khamrah, original.
13. Arabiyat Prestige Marwa EDP — distinct from its Extrait.
14. Al Haramain Amber Oud Tobacco Edition.
15. Maison Alhambra Amber & Leather — perfume identity unresolved; do not substitute deodorant data.

All can appear in the planned catalog. Unresolved identities must be explicitly incomplete and excluded from precise offer matching or recommendations where their uncertainty affects fit. The first deeply reviewed scent compositions will focus on contrasting profiles, with Hawas, Liquid Brun and Fattan used for early visual testing.

Reuse family-level visual materials and scene templates across perfumes. Maintain distinct editorial content and real packaging for each.

Primary-source conflicts need a stored flag. For example, Vulcan Feu's title/specification concentration conflict must remain visible; CDN Intense regional edition descriptions must not be merged by name similarity.

Sources for seed identity and notes include [Rasasi Hawas](https://store.rasasi.com.sa/en/wlqzamr/p2072824605), [Liquid Brun](https://frenchavenue.com/products/liquid-brun), [9 PM](https://india.afnan.com/products/9-pm), [Vulcan Feu](https://frenchavenue.com/products/vulcan-feu), [Collector's Edition](https://us.afnan.com/pages/supremacy-collectors), [Fattan](https://rasasistore.com/products/fs402001), [Khamrah](https://lattafa.com/product/khamrah/) and [Marwa](https://myperfumes.ae/products/arabiyat-prestige-marwa-edp-unisex). Source claims require review during implementation; these links do not grant asset reuse rights.

## 6. Data model and editorial boundaries

Versioned initial data is owned by the repository, not by an unverified runtime scrape. Validate it at build/test time. No database or paid data service is needed to run this first release.

Keep separate records for:

- `Fragrance`: stable identifier, brand, canonical name, summary, merchandising metadata.
- `Variant`: size, concentration, edition, condition-independent identity and uncertainty.
- `SourceClaim`: field/value, source URL, checked date, source category and conflict status.
- `ScentProfile`: editorial attributes, descriptive phases, supporting claims and confidence category.
- `WearReport`: skin/fabric, conditions, application, observations and provenance; absent evidence stays absent.
- `Seller`: identity, route, evidence of authorization where obtained, policy source and review status.
- `Offer`: exact variant/condition, observed price, known shipping, coupon conditions, stock and checked time.
- `ReferencePrice`: user-supplied or editorial planning amount, separately modeled from an observed offer.
- `Asset`: source, local path, reuse status and product identity.
- `PreferenceProfile` and `ShelfEntry`: local personal preferences and observations.

Use typed discriminated states for unknown/reference/observed prices and unknown/conflicted/confirmed identity. UI and recommendation functions must handle every state explicitly.

## 7. Seller comparison

Offer comparisons require matching size, concentration, edition and retail/tester/decant condition. Never rank a decant as the cheapest full bottle. Rank by delivered cost only when the required charges are known; otherwise show observed item price and say shipping is unconfirmed.

Label the result lowest observed price among checked sellers, with coverage and time. Exclude out-of-stock or stale observations from the cheapest default. Runtime observations must not be claimed unless a check actually happened.

Begin with three to five maintainable seller routes. Where offer evidence is not complete, publish seller links and reference prices with explicit labels instead of presenting fake deals. Candidate research routes include [Afnan India](https://india.afnan.com/), [Armaf India](https://armafperfume.com/), [Nykaa's published guarantee](https://www.nykaa.com/authenticity-nykaa-guarantee/lp) and independently reviewed sample sellers.

Seller authorization is a documented evidence category, not an AI judgment. Do not guarantee a bottle's authenticity from a photograph, barcode or seller self-claim. Link relevant brand procedures, such as [Lattafa](https://lattafa.com/spot-a-fake/) and [My Perfumes](https://myperfumes.ae/pages/how-to-spot-a-fake).

No background price automation is included in the first implementation. Add a scheduled refresher only with defined supported sources and explicit later scope. Do not bulk reuse competitor data without permission.

## 8. Recommendation and Jev responsibilities

Use a pure deterministic baseline that:

1. Validates preferences and exact candidate identities.
2. Applies budget, availability requirements if requested, and explicit exclusions.
3. Scores evidence-backed scent preference and contextual fit with documented weights.
4. Returns differentiated candidates with reason codes, caveats and incomplete-evidence status.

Keep templates responsible for clear explanations. Do not generate facts about perfume performance.

Provide a server-side Jev adapter behind the same typed recommendation interface. It may classify free-text preference into known values, score narrowly defined scent fit, check dislike conflicts and choose a next question from known options. Ordinary code owns constraints, price arithmetic, seller eligibility, result validation and final ranking.

Batch independent questions against the same state. A live call requires a configured server-side secret. No secret should reach client code, URLs, logs, screenshots or Git history. Follow the current [TypeSafe documentation](https://docs.typesafe.ai/introduction) during implementation.

If the key is absent, the provider times out, returns malformed data or identifies unsupported candidates, use the rules baseline and accurately report that method. Never label a baseline result as Jev-generated. Do not silently equate provider confidence with a calibrated likelihood of enjoyment.

## 9. Technical architecture

Use a React/TypeScript framework with server-rendered routes and a client-loaded Three.js scene. For Sites publishing, use its bundled Cloudflare-compatible starter and preserve its package manager/lockfile. Keep the public GitHub repository as the development history and verify matching source commits when publishing.

Proposed module boundaries:

- `catalog`: typed data, identity/source validation and read/query functions.
- `recommendations`: baseline, reason codes, constraint validation and provider interface.
- `server/jev`: credential handling, requests, timeouts and response validation.
- `offers`: comparable-offer eligibility and delivered-price calculations.
- `boutique`: scene assets, camera states, quality adaptation and selection events.
- `components`: semantic controls, product information and responsive layouts.
- `shelf`: versioned browser storage and recovery.

The scene consumes catalog identities and emits selections. It does not own prices or recommendation state. All core functionality survives WebGL failure.

## 10. Loading, errors and accessibility

- Useful HTML renders before optional 3D resources.
- Images have descriptive alternative text and preserve aspect ratios.
- Search, modal/dialog interactions, quiz steps and comparison controls work with keyboard navigation.
- Visible focus and adequate contrast; information never depends only on color or particles.
- Honor reduced motion, with immediate viewpoint changes or static compositions.
- Adapt render resolution/effects for slower devices and pause inactive animation.
- Missing images use a clearly identified neutral placeholder, not an invented bottle.
- Unknown price, unavailable sample, no recommendation match, failed provider and corrupt local storage each have a useful state.
- No autoplay sound or required sign-up.

## 11. Verification and acceptance criteria

Necessary meaningful checks:

- Catalog validation catches duplicate IDs, broken variant references, missing source provenance and contradictory certainty states.
- Recommendation tests prove hard-budget and explicit-dislike handling, no-match results, deterministic reasons and fallback behavior.
- Offer tests prove exact-variant matching, tester/decant separation, stock exclusion and unknown-shipping handling.
- Browser checks cover browse → profile → compare, discovery → shortlist, shelf persistence/reset, keyboard operation, and mobile layouts.
- Test the graphics fallback and reduced motion; inspect actual animated camera transitions and text readability.
- Build/type checks and a clean install from tracked files.
- Verify no credentials or runtime state are tracked before public push.
- Verify GitHub visibility, latest remote commit and repository history after publication.

Acceptance: the complete first-release journey works, source/price uncertainty is honest, and a new developer can clone and run it from the README. Visual rendering success alone does not validate fragrance recommendations or subjective design quality.

## 12. Commit strategy and delivery

Maintain reviewable milestone commits, for example:

1. `docs: define perfume atlas product and build specification`
2. `chore: scaffold application and quality checks`
3. `feat: add sourced catalog and exact variant model`
4. `feat: build spatial boutique and perfume profiles`
5. `feat: add guided recommendations and comparison`
6. `feat: add saved shelf and optional Jev adapter`
7. `test: verify mobile flows, fallbacks and offer integrity`
8. `docs: document setup, sources and release limitations`

Do not squash away the meaningful development history without a user request. Push checkpoints to the public repository and verify remote SHA. Keep secrets and personal customer data out of the public tree. Document image licensing separately from any eventual code license; no open-source code license is selected implicitly by public visibility.

Hand off the repository URL, tested build/preview, checks performed, latest commit and real limitations. Publish the website using the available hosting workflow after implementation; a public GitHub repository does not itself establish a public live website.

## 13. Explicit first-release limits

No own perfume inventory or checkout, user accounts, cross-device shelf sync, universal authenticity certification, measured smell reproduction, real-time lowest-price guarantee, statistically validated enjoyment probabilities, unrestricted bottle rotation or background price scheduler.

These are scope boundaries, not obstacles to a useful first release. The extension interfaces and transparent data states preserve a path to later wear tests, supported offer feeds and calibrated recommendations.
