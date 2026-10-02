# Perfume Atlas

An independent perfume guide for India, built as a spatial boutique with an inspectable decision layer. Browse 15 sourced fragrance profiles, explore qualitative scent phases, consult a constrained shortlist, compare up to three exact editions and keep a local personal shelf.

[Public development repository](https://github.com/nikhiilraj/perfume-atlas). Meaningful milestone commits are preserved on `main`.

## Run locally

Requires Node.js 22.13+ and npm. The lockfile is committed.

```sh
npm ci
npm run dev
```

Open the Local URL printed by the server (normally http://localhost:5173). The starter uses Vinext, React, TypeScript, Vite and a Cloudflare-compatible worker. Three.js loads only in the browser; all product information remains semantic HTML.

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

For browser flows, install Chromium with `npx playwright install chromium`, start the local server, then run `npm run test:e2e`. `TEST_BASE_URL` can override the default `http://127.0.0.1:5173`.

## Evidence conventions

- User-supplied INR amounts are **reference prices**, never live offers. Their size applicability is unconfirmed. No current delivered offers are seeded.
- Edition, size, concentration and condition must match for offer eligibility. Stale (>24 hours), future, unavailable or mismatched observations cannot win. Unknown shipping prevents a cheapest-delivered label for the set.
- Seller links are unverified outbound routes, not authenticity guarantees or affiliate links.
- Notes and sensory descriptions are advertised claims plus labeled editorial inference. They are not chemical ingredient declarations or a firsthand smell test. No independently measured longevity or projection is claimed.
- Conflicted or unresolved product identities remain browsable but cannot enter recommendations. Explicit dislikes and budget evidence stay hard constraints. Results are limited to three distinct fragrances, with documented rule weights and stable-ID tie breaking.

## Jev

Without `JEV_API_KEY`, matching uses deterministic rules. Optional Jev runs only through `/api/recommend` on the server. It batches bounded scent-direction judgments over eligible candidates, validates the entire response, times out within three seconds and falls back to rules on failure. It never invents facts, offers or authenticity verdicts. Copy `.env.example` to an ignored local environment file for local configuration; configure production credentials as runtime secrets, never public browser variables.

The [official TypeSafe API contract](https://docs.typesafe.ai/api) was checked 2 October 2026. Adapter tests use injected responses; no live Jev call or recommendation-quality evaluation has been performed.

## Shelf and privacy

`perfume-atlas:shelf:v1` stores favorites, tried status, reactions and notes in `localStorage`. The shelf is browser-local, never synced or sent to Jev. Storage failure is visible and is never reported as a successful save. Clearing the shelf removes only this key. Consultation answers are transient; comparison URLs contain variant IDs only.

## Imagery and publication

No explicit photo reuse license was found. Downloaded brand imagery is excluded from the repository and hosted bundle. Original abstract scent studies occupy the gallery while profiles link to actual product source pages. See [asset provenance and seller coverage](docs/ASSET-SOURCES.md) and `data/asset-provenance.json`. Neutral studies are not representations of product packaging.

Code is public for review; no open-source license is selected implicitly. Third-party starter/style notices remain in `build/` and `vendor/`. Hosting uses the recorded Sites project; its audience remains private by default, separately from the public GitHub repository.

## Design and validation

[Approved specification](docs/superpowers/specs/2026-10-02-perfume-atlas-design.md), [implementation plan](docs/superpowers/plans/2026-10-02-perfume-atlas.md), [verification record](docs/VERIFICATION.md).
