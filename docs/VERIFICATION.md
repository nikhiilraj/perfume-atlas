# Verification record

Checked 2 October 2026, Node 22.21.1, macOS. This record distinguishes implementation tests from product evidence: tests do not validate perfume performance, authenticity or actual preference satisfaction.

## Completed checks

- `npm test`: 32 domain/API tests pass. Covers catalog/source identity, offer mismatch/freshness/shipping, hard budgets/dislikes, provider validation/timeout/fallback and local storage recovery.
- `npm run typecheck` and `npm run lint`: pass.
- Initial seven browser flows pass: collection search/selection/empty state, sourced profiles, invalid profile, exact CDN variants, bounded comparison URL, consultation/no-match and shelf persistence/edit/reset.
- Five additional browser checks pass: blocked WebGL, reduced motion/simple view and keyboard focus, blocked local storage, 390px route layouts and doubled computed text sizes, and server content with scripts disabled. Total after review regressions: 19 browser tests.
- `npm run build`: passes; all six route patterns and the recommendation API compile to Cloudflare-compatible output. The lazy Three.js chunk triggers a size warning; it is not needed for first product content.
- Independent review: no Critical findings; five Important findings fixed with RED→GREEN regressions. See `docs/REVIEW.md`.
- Updated local production worker: all 19 browser flows pass, including exact-edition round trips, cross-tab storage, malformed-response fallback and editorial overlap.
- The initial tracked clean checkout installed and built successfully. The final reviewed snapshot is checked again before packaging.

## Product evidence boundaries

There are zero seeded live INR offers, zero independent wear reports and no live Jev evaluation. Seller coverage is four unverified retailer/sample routes. All 16 product-image licenses remain unverified and no downloaded images are published. Source conflicts remain visible and recommendations exclude unresolved or conflicted identities. The first collection is concentrated on Middle Eastern fruity/woody/gourmand directions and does not cover every taste.

## Preview correction

After adding dependencies, Vite retained an obsolete navigation chunk during development. A forced preview refresh restored navigation; the complete consultation-to-profile test then passed. This was a development cache issue, not a relaxed product constraint. Interactive form controls remain disabled until hydrated to prevent lost initial interactions.

## Production navigation correction

A clean production worker exposed a bundled Vinext RSC prefetch function failure that development did not reproduce. Standard semantic browser links restore route navigation and preserve script-free navigation. Profile query parameters now retain the exact selected edition. Full page navigation is the deliberate compatibility tradeoff.
