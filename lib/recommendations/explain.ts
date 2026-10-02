import type { Catalog } from "../catalog/types";
import type { Recommendation, RecommendationExplanation } from "./types";
const templates: Record<string, string> = {
  "occasion:daily": "An editorial direction for everyday wear.",
  "occasion:casual": "A direction to explore for relaxed, casual occasions.",
  "occasion:evening": "Its scent direction is suggested for evenings.",
  "occasion:special":
    "A direction to explore when you want a dressed-up scent.",
  "setting:shared":
    "Its scent direction is one to explore for shared spaces; test dosage yourself.",
  "setting:outdoors": "Its scent direction is one to explore outdoors.",
  "setting:private":
    "Its richer direction is one to explore in your own space.",
  "liked-family": "It shares a scent family with a perfume you like.",
  explore: "An eligible alternative to sample under your current constraints.",
};
export function explainRecommendation(
  r: Recommendation,
  c: Catalog,
): RecommendationExplanation {
  const f = c.fragrances.find((f) => f.id === r.fragranceId);
  const reasons = r.reasonCodes
    .map((code) =>
      code.startsWith("trait:")
        ? `Its advertised notes suggest the ${code.slice(6)} direction you selected.`
        : templates[code],
    )
    .filter(Boolean);
  if (reasons.length < 2)
    reasons.push(
      `Explore its ${f?.profile.family.toLowerCase() ?? "distinct"} character as a sampling direction.`,
    );
  return {
    reasons: reasons.slice(0, 2),
    caveat: r.caveats[0] ?? "Sample first; actual wear varies.",
  };
}
