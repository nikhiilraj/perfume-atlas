import { describe, it, expect } from "vitest";
import {
  eligibleCandidates,
  rankCandidates,
} from "@/lib/recommendations/baseline";
import {
  makeCatalog,
  makePreferences,
  makeFragrance,
  makeVariant,
  makeOffer,
} from "./fixtures";
import { getCatalog } from "@/lib/catalog/query";
describe("recommendation constraints", () => {
  it("retains a known delivered budget match alongside unknown shipping", () => {
    const now = new Date("2026-10-02T01:00:00Z");
    const c = makeCatalog({
      offers: [
        makeOffer({ id: "complete", amountInr: 3000, shippingInr: 100 }),
        makeOffer({ id: "unknown", amountInr: 2900, shippingInr: null }),
      ],
    });
    const r = eligibleCandidates(
      c,
      makePreferences({ budgetMode: "observed-only", maxBudgetInr: 3500 }),
      now,
    );
    expect(r.eligible).toHaveLength(1);
    expect(r.eligible[0].budgetEvidence).toBe("observed");
    expect(
      eligibleCandidates(
        c,
        makePreferences({ budgetMode: "observed-only", maxBudgetInr: 3000 }),
        now,
      ).eligible,
    ).toHaveLength(0);
  });
  it("never exceeds a reference budget", () => {
    const r = rankCandidates(
      makeCatalog(),
      makePreferences({ maxBudgetInr: 3000 }),
    );
    expect(r.candidates).toEqual([]);
    expect(r.exclusions[0].reason).toBe("budget");
  });
  it("cannot use reference prices in observed-only mode", () => {
    expect(
      rankCandidates(
        makeCatalog(),
        makePreferences({ budgetMode: "observed-only" }),
      ).candidates,
    ).toEqual([]);
  });
  it("provider scores cannot defeat disliked traits", () => {
    const r = rankCandidates(
      makeCatalog(),
      makePreferences({ excludedTraitIds: ["sweet"] }),
      [{ variantId: "test-100", score: 4 }],
    );
    expect(r.candidates).toEqual([]);
    expect(r.noMatchReason).toBeTruthy();
  });
  it("returns real IDs and at most three, deterministically", () => {
    const c = getCatalog(),
      p = makePreferences();
    const r = rankCandidates(c, p);
    expect(r.candidates.length).toBeGreaterThan(0);
    expect(r.candidates.length).toBeLessThanOrEqual(3);
    expect(r).toEqual(rankCandidates(c, p));
    expect(
      r.candidates.every((x) => c.variants.some((v) => v.id === x.variantId)),
    ).toBe(true);
  });
  it("retains reference evidence instead of claiming a current price", () => {
    expect(
      rankCandidates(makeCatalog(), makePreferences({ maxBudgetInr: 4000 }))
        .candidates[0].budgetEvidence,
    ).toBe("reference");
  });
  it("excludes unknown and conflicted identity from recommendations", () => {
    expect(
      rankCandidates(
        makeCatalog({
          variants: [makeVariant({ identityStatus: "conflicted" })],
        }),
        makePreferences(),
      ).candidates,
    ).toEqual([]);
  });
  it("does not admit an unknown price under a budget ceiling", () => {
    expect(
      rankCandidates(
        makeCatalog({
          fragrances: [makeFragrance({ referencePrice: { kind: "unknown" } })],
        }),
        makePreferences({ maxBudgetInr: 10000 }),
      ).candidates,
    ).toEqual([]);
  });
  it("diversifies eligible scent families instead of repeating three sweet profiles", () => {
    const fs = ["a", "b", "c", "d"].map((id, i) =>
      makeFragrance({
        id,
        slug: id,
        profile: {
          ...makeFragrance().profile,
          family: i === 3 ? "Fresh" : "Warm",
        },
      }),
    );
    const c = makeCatalog({
      fragrances: fs,
      variants: fs.map((f) => makeVariant({ id: f.id, fragranceId: f.id })),
    });
    expect(
      rankCandidates(c, makePreferences()).candidates.some(
        (x) => x.fragranceId === "d",
      ),
    ).toBe(true);
  });
});
