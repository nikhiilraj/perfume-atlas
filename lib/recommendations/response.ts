import { z } from "zod";
import type { Catalog } from "../catalog/types";
import { eligibleCandidates } from "./baseline";
import type { Preferences, RecommendationResult } from "./types";

const responseSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            variantId: z.string().max(80),
            fragranceId: z.string().max(80),
            score: z.number().finite().min(0).max(100),
            reasonCodes: z.array(z.string().max(80)).min(1).max(20),
            caveats: z.array(z.string().max(2000)).min(1).max(20),
            budgetEvidence: z.enum(["reference", "observed", "unknown"]),
          })
          .strict(),
      )
      .max(3),
    exclusions: z
      .array(
        z
          .object({
            variantId: z.string().max(80),
            reason: z.enum(["identity", "dislike", "budget"]),
          })
          .strict(),
      )
      .max(100),
    noMatchReason: z.string().max(2000).nullable(),
    method: z.enum(["rules", "jev"]),
  })
  .strict();

// Validate before rendering; code-owned evidence/explanations remain authoritative.
export function parseRecommendationResponse(
  raw: unknown,
  catalog: Catalog,
  preferences: Preferences,
): RecommendationResult {
  const data = responseSchema.parse(raw);
  const { eligible, exclusions } = eligibleCandidates(catalog, preferences);
  const seen = new Set<string>();
  const candidates = data.candidates.map((candidate) => {
    const known = eligible.find(
      (x) =>
        x.variantId === candidate.variantId &&
        x.fragranceId === candidate.fragranceId,
    );
    if (
      !known ||
      seen.has(candidate.fragranceId) ||
      known.budgetEvidence !== candidate.budgetEvidence
    )
      throw Error("Invalid candidate");
    seen.add(candidate.fragranceId);
    return { ...known, score: candidate.score };
  });
  if (
    data.exclusions.some(
      (x) => !catalog.variants.some((v) => v.id === x.variantId),
    )
  )
    throw Error("Invalid exclusion");
  if (Boolean(candidates.length) === Boolean(data.noMatchReason))
    throw Error("Invalid match state");
  return {
    candidates,
    exclusions,
    noMatchReason: data.noMatchReason,
    method: data.method,
  };
}
