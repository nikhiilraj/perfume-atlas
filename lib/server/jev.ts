import { z } from "zod";
import type { Variant, Fragrance } from "../catalog/types";
import type { Preferences, CandidateJudgment } from "../recommendations/types";
export type JevOptions = {
  apiKey?: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  fragrances?: readonly Fragrance[];
};
export type JevAssessment = {
  judgments: CandidateJudgment[];
  status: "used" | "unavailable";
};
const scoreSchema = z.object({
  type: z.literal("score"),
  score: z.number().finite().min(0).max(4),
  confidence: z.number().finite().min(0).max(1),
  legend: z.record(z.string()),
  probabilities: z.record(z.number().finite().min(0).max(1)),
});
// Server-only dependency path. This adapter is never imported by a client component.
// Official contract checked 2026-10-02: https://docs.typesafe.ai/api
export async function assessWithJev(
  candidates: readonly Variant[],
  preferences: Preferences,
  options: JevOptions,
): Promise<JevAssessment> {
  const fallback: JevAssessment = { judgments: [], status: "unavailable" };
  if (!options.apiKey || !candidates.length) return fallback;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const questions = Object.fromEntries(
      candidates.map((v) => [
        v.id,
        {
          type: "score",
          instructions: {
            question:
              "Using only the advertised scent profile for this candidate, how well does its scent direction align with the selected desired traits and liked perfume directions? Do not judge price, authenticity, longevity or projection.",
            candidate_id: v.id,
          },
          criteria: [
            "Advertised scent direction conflicts with desired directions.",
            "Advertised scent direction has little supporting overlap.",
            "Advertised scent direction has mixed supporting overlap.",
            "Advertised scent direction has useful supporting overlap.",
            "Advertised scent direction clearly supports the selected directions.",
          ],
        },
      ]),
    );
    const request = (async () => {
      const response = await (options.fetch ?? fetch)(
        "https://api.typesafe.ai/v1/systemone",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + options.apiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "jev-latest",
            state: {
              preferences,
              candidates: candidates.map((v) => ({
                variantId: v.id,
                profile:
                  options.fragrances?.find((f) => f.id === v.fragranceId)
                    ?.profile ?? null,
              })),
              likedProfiles:
                options.fragrances
                  ?.filter((f) => preferences.likedProductIds.includes(f.id))
                  .map((f) => ({ id: f.id, profile: f.profile })) ?? [],
            },
            questions,
          }),
          signal: controller.signal,
        },
      );
      if (!response.ok) throw Error("Provider unavailable");
      const root = z
        .object({ answers: z.record(scoreSchema) })
        .parse(await response.json());
      const keys = Object.keys(root.answers);
      if (
        keys.length !== candidates.length ||
        keys.some((id) => !candidates.some((v) => v.id === id))
      )
        throw Error("Candidate mismatch");
      for (const answer of Object.values(root.answers)) {
        if (
          Object.keys(answer.probabilities).sort().join(",") !== "0,1,2,3,4" ||
          Object.keys(answer.legend).sort().join(",") !== "0,1,2,3,4" ||
          Math.abs(
            Object.values(answer.probabilities).reduce((a, b) => a + b, 0) - 1,
          ) > 0.01
        )
          throw Error("Invalid rubric");
      }
      return {
        judgments: keys.map((variantId) => ({
          variantId,
          score: root.answers[variantId].score,
        })),
        status: "used" as const,
      };
    })();
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => {
          controller.abort();
          reject(Error("Timeout"));
        },
        Math.min(options.timeoutMs ?? 3000, 3000),
      );
    });
    return await Promise.race([request, timeout]);
  } catch {
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}
