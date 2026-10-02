import { z } from "zod";
import type { TraitId } from "../catalog/types";
export const traitIds = [
  "fresh",
  "sweet",
  "woody",
  "spicy",
  "smoky",
  "creamy",
  "tropical",
  "green",
  "floral",
  "leathery",
  "tea",
] as const;
export const preferencesSchema = z
  .object({
    maxBudgetInr: z.number().int().min(1).max(100000).nullable(),
    budgetMode: z.enum(["reference-ok", "observed-only"]),
    occasion: z.enum(["daily", "casual", "evening", "special"]),
    setting: z.enum(["shared", "private", "outdoors"]),
    climate: z.enum(["hot", "mild", "cool"]),
    presence: z.enum(["soft", "balanced", "bold"]),
    likedProductIds: z.array(z.string().max(80)).max(15),
    excludedTraitIds: z.array(z.enum(traitIds)).max(11),
    desiredTraitIds: z.array(z.enum(traitIds)).max(11),
  })
  .strict();
export type Preferences = z.infer<typeof preferencesSchema>;
export type CandidateJudgment = { variantId: string; score: number };
export type Recommendation = {
  variantId: string;
  fragranceId: string;
  score: number;
  reasonCodes: string[];
  caveats: string[];
  budgetEvidence: "reference" | "observed" | "unknown";
};
export type RecommendationResult = {
  candidates: Recommendation[];
  exclusions: { variantId: string; reason: string }[];
  noMatchReason: string | null;
  method: "rules" | "jev";
};
export type RecommendationExplanation = { reasons: string[]; caveat: string };
export const defaultPreferences: Preferences = {
  maxBudgetInr: null,
  budgetMode: "reference-ok",
  occasion: "daily",
  setting: "shared",
  climate: "hot",
  presence: "balanced",
  likedProductIds: [],
  excludedTraitIds: [],
  desiredTraitIds: ["fresh"],
};
export const isTrait = (x: string): x is TraitId =>
  traitIds.includes(x as TraitId);
