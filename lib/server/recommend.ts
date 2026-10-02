import type { Catalog } from "../catalog/types";
import type {
  Preferences,
  RecommendationResult,
} from "../recommendations/types";
import {
  rankCandidates,
  eligibleCandidates,
} from "../recommendations/baseline";
import { assessWithJev, type JevOptions } from "./jev";
export type RecommendationOptions = JevOptions;
export async function recommend(
  c: Catalog,
  p: Preferences,
  options: RecommendationOptions = {},
): Promise<RecommendationResult> {
  const baseline = rankCandidates(c, p);
  if (!options.apiKey || !baseline.candidates.length) return baseline;
  const eligible = eligibleCandidates(c, p)
    .eligible.sort(
      (a, b) => b.score - a.score || a.variantId.localeCompare(b.variantId),
    )
    .slice(0, 10);
  const variants = c.variants.filter((v) =>
    eligible.some((r) => r.variantId === v.id),
  );
  const assessed = await assessWithJev(variants, p, {
    ...options,
    fragrances: c.fragrances,
  });
  return assessed.status === "used"
    ? rankCandidates(c, p, assessed.judgments)
    : baseline;
}
